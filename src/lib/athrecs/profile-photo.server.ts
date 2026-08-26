import { createHash, randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

type PhotoRow = {
  blob_pathname: string;
  content_type: string;
  byte_size: number;
  updated_at: string;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function blobToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token || null;
}

function mutationIsSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function requireUserId(request: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

function privatePhotoPath(userId: string, contentType: string): string {
  const accountKey = createHash("sha256").update(userId).digest("hex").slice(0, 24);
  const extension =
    contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : "webp";
  return `athlete-profile-photos/${accountKey}/${Date.now()}-${randomUUID()}.${extension}`;
}

async function fileSignatureMatches(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return png.every((value, index) => bytes[index] === value);
  }
  if (file.type === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

async function currentPhoto(userId: string): Promise<PhotoRow | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const rows = await sql<PhotoRow>`
    select
      blob_pathname,
      content_type,
      byte_size,
      updated_at::text as updated_at
    from athlete_profile_photos
    where user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function handleAthleteProfilePhotoRequest(request: Request): Promise<Response> {
  const userId = await requireUserId(request);
  if (!userId) return json({ ok: false, error: "Sign in to manage your profile photo" }, 401);

  if (request.method === "GET") {
    const token = blobToken();
    if (!token) return json({ ok: false, error: "Profile photo storage is not connected" }, 503);
    const photo = await currentPhoto(userId);
    if (!photo) return new Response("Not found", { status: 404 });

    const { get } = await import("@vercel/blob");
    const result = await get(photo.blob_pathname, { access: "private", token });
    if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || photo.content_type,
        "Content-Length": String(photo.byte_size),
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  }

  if (request.method !== "POST" && request.method !== "DELETE") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!mutationIsSameOrigin(request)) {
    return json({ ok: false, error: "Invalid request origin" }, 403);
  }

  const token = blobToken();
  if (!token) {
    return json(
      {
        ok: false,
        error:
          "Profile photo storage is not connected yet. Connect a private Vercel Blob store to ATHRECS and try again.",
      },
      503,
    );
  }

  await ensureAthrecsSeeded();
  const sql = await getSql();
  const previous = await currentPhoto(userId);
  const { del, put } = await import("@vercel/blob");

  if (request.method === "DELETE") {
    await sql`delete from athlete_profile_photos where user_id = ${userId}`;
    if (previous) {
      try {
        await del(previous.blob_pathname, { token });
      } catch (error) {
        console.warn("[profile-photo] private blob cleanup failed after account deletion", error);
      }
    }
    return json({ ok: true, removed: Boolean(previous) });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: "Upload a valid image file" }, 400);
  }
  const file = formData.get("photo");
  if (!(file instanceof File)) return json({ ok: false, error: "Choose a photo to upload" }, 400);
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return json({ ok: false, error: "Use a WebP, JPEG or PNG image" }, 400);
  }
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
    return json({ ok: false, error: "The processed profile photo must be 2 MB or smaller" }, 400);
  }
  if (!(await fileSignatureMatches(file))) {
    return json({ ok: false, error: "The file does not match its declared image format" }, 400);
  }

  const pathname = privatePhotoPath(userId, file.type);
  let uploadedPathname: string | null = null;
  try {
    const uploaded = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      token,
    });
    uploadedPathname = uploaded.pathname;
    const rows = await sql<{ updated_at: string }>`
      insert into athlete_profile_photos (
        user_id, blob_pathname, content_type, byte_size, width, height,
        uploaded_at, updated_at
      ) values (
        ${userId}, ${uploaded.pathname}, ${file.type}, ${file.size}, 512, 512,
        now(), now()
      )
      on conflict (user_id) do update set
        blob_pathname = excluded.blob_pathname,
        content_type = excluded.content_type,
        byte_size = excluded.byte_size,
        width = excluded.width,
        height = excluded.height,
        uploaded_at = now(),
        updated_at = now()
      returning updated_at::text as updated_at
    `;
    const updatedAt = rows[0]?.updated_at ?? new Date().toISOString();

    if (previous && previous.blob_pathname !== uploaded.pathname) {
      try {
        await del(previous.blob_pathname, { token });
      } catch (error) {
        console.warn("[profile-photo] old private blob cleanup failed", error);
      }
    }

    return json({
      ok: true,
      photoUrl: `/api/athlete-profile-photo?v=${encodeURIComponent(updatedAt)}`,
      updatedAt,
    });
  } catch (error) {
    if (uploadedPathname) {
      try {
        await del(uploadedPathname, { token });
      } catch {
        // Preserve the original failure. Unreferenced private blobs can be cleaned separately.
      }
    }
    console.error("[profile-photo] upload failed", error);
    return json({ ok: false, error: "The photo could not be saved. Try again." }, 500);
  }
}
