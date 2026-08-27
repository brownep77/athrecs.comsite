import { createHash, randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { getSql, type Sql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

type StorageBackend = "blob" | "database";

type PhotoRow = {
  blob_pathname: string | null;
  photo_bytes: Uint8Array | string | null;
  storage_backend: StorageBackend;
  content_type: string;
  byte_size: number;
  updated_at: string;
};

type BlobAuthOptions = {
  token?: string;
  storeId?: string;
};

type SavedPhoto = {
  updatedAt: string;
  storageBackend: StorageBackend;
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

function photoResponse(body: BodyInit, contentType: string, byteSize: number): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(byteSize),
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}

function legacyBlobToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token || null;
}

function blobStoreId(): string | null {
  const storeId = process.env.BLOB_STORE_ID?.trim();
  return storeId || null;
}

function blobStorageConnected(): boolean {
  return Boolean(legacyBlobToken() || blobStoreId());
}

function blobAuthOptions(): BlobAuthOptions {
  const token = legacyBlobToken();
  if (token) return { token };
  const storeId = blobStoreId();
  return storeId ? { storeId } : {};
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

function databaseBytes(value: PhotoRow["photo_bytes"]): Uint8Array | null {
  if (!value) return null;
  if (value instanceof Uint8Array) return Uint8Array.from(value);
  if (typeof value === "string" && value.startsWith("\\x")) {
    const hex = value.slice(2);
    if (hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
    return Uint8Array.from(Buffer.from(hex, "hex"));
  }
  return null;
}

async function currentPhoto(userId: string): Promise<PhotoRow | null> {
  await ensureAthrecsSeeded();
  const sql = await getSql();
  const rows = await sql<PhotoRow>`
    select
      blob_pathname,
      photo_bytes,
      storage_backend,
      content_type,
      byte_size,
      updated_at::text as updated_at
    from athlete_profile_photos
    where user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

async function deletePrivateBlob(pathname: string | null, label: string): Promise<void> {
  if (!pathname || !blobStorageConnected()) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(pathname, blobAuthOptions());
  } catch (error) {
    console.warn(`[profile-photo] ${label}`, error);
  }
}

async function saveDatabasePhoto(
  sql: Sql,
  userId: string,
  file: File,
  bytes: Buffer,
): Promise<SavedPhoto> {
  const rows = await sql<{ updated_at: string }>`
    insert into athlete_profile_photos (
      user_id, blob_pathname, photo_bytes, storage_backend,
      content_type, byte_size, width, height, uploaded_at, updated_at
    ) values (
      ${userId}, null, ${bytes}, 'database',
      ${file.type}, ${file.size}, 512, 512, now(), now()
    )
    on conflict (user_id) do update set
      blob_pathname = null,
      photo_bytes = excluded.photo_bytes,
      storage_backend = 'database',
      content_type = excluded.content_type,
      byte_size = excluded.byte_size,
      width = excluded.width,
      height = excluded.height,
      uploaded_at = now(),
      updated_at = now()
    returning updated_at::text as updated_at
  `;
  return {
    updatedAt: rows[0]?.updated_at ?? new Date().toISOString(),
    storageBackend: "database",
  };
}

async function saveBlobPhoto(
  sql: Sql,
  userId: string,
  file: File,
): Promise<SavedPhoto & { pathname: string }> {
  const { put } = await import("@vercel/blob");
  const pathname = privatePhotoPath(userId, file.type);
  const uploaded = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    ...blobAuthOptions(),
  });

  try {
    const rows = await sql<{ updated_at: string }>`
      insert into athlete_profile_photos (
        user_id, blob_pathname, photo_bytes, storage_backend,
        content_type, byte_size, width, height, uploaded_at, updated_at
      ) values (
        ${userId}, ${uploaded.pathname}, null, 'blob',
        ${file.type}, ${file.size}, 512, 512, now(), now()
      )
      on conflict (user_id) do update set
        blob_pathname = excluded.blob_pathname,
        photo_bytes = null,
        storage_backend = 'blob',
        content_type = excluded.content_type,
        byte_size = excluded.byte_size,
        width = excluded.width,
        height = excluded.height,
        uploaded_at = now(),
        updated_at = now()
      returning updated_at::text as updated_at
    `;
    return {
      updatedAt: rows[0]?.updated_at ?? new Date().toISOString(),
      storageBackend: "blob",
      pathname: uploaded.pathname,
    };
  } catch (error) {
    await deletePrivateBlob(uploaded.pathname, "new private blob cleanup failed");
    throw error;
  }
}

export async function handleAthleteProfilePhotoRequest(request: Request): Promise<Response> {
  const userId = await requireUserId(request);
  if (!userId) return json({ ok: false, error: "Sign in to manage your profile photo" }, 401);

  if (request.method === "GET") {
    const photo = await currentPhoto(userId);
    if (!photo) return new Response("Not found", { status: 404 });

    if (photo.storage_backend === "database") {
      const bytes = databaseBytes(photo.photo_bytes);
      if (!bytes) return new Response("Not found", { status: 404 });
      const body = Uint8Array.from(bytes).buffer;
      return photoResponse(body, photo.content_type, photo.byte_size);
    }

    if (!photo.blob_pathname || !blobStorageConnected()) {
      return json({ ok: false, error: "Profile photo storage is temporarily unavailable" }, 503);
    }

    const { get } = await import("@vercel/blob");
    const result = await get(photo.blob_pathname, {
      access: "private",
      ...blobAuthOptions(),
    });
    if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });
    return photoResponse(
      result.stream,
      result.blob.contentType || photo.content_type,
      photo.byte_size,
    );
  }

  if (request.method !== "POST" && request.method !== "DELETE") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!mutationIsSameOrigin(request)) {
    return json({ ok: false, error: "Invalid request origin" }, 403);
  }

  await ensureAthrecsSeeded();
  const sql = await getSql();
  const previous = await currentPhoto(userId);

  if (request.method === "DELETE") {
    await sql`delete from athlete_profile_photos where user_id = ${userId}`;
    if (previous?.storage_backend === "blob") {
      await deletePrivateBlob(
        previous.blob_pathname,
        "private blob cleanup failed after account photo removal",
      );
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

  const bytes = Buffer.from(await file.arrayBuffer());
  let saved: SavedPhoto;

  if (blobStorageConnected()) {
    try {
      const blobPhoto = await saveBlobPhoto(sql, userId, file);
      saved = blobPhoto;
      if (
        previous?.storage_backend === "blob" &&
        previous.blob_pathname !== blobPhoto.pathname
      ) {
        await deletePrivateBlob(previous.blob_pathname, "old private blob cleanup failed");
      }
    } catch (error) {
      console.warn(
        "[profile-photo] private Blob upload failed; using encrypted-at-rest Postgres fallback",
        error,
      );
      saved = await saveDatabasePhoto(sql, userId, file, bytes);
      if (previous?.storage_backend === "blob") {
        await deletePrivateBlob(previous.blob_pathname, "old private blob cleanup failed");
      }
    }
  } else {
    saved = await saveDatabasePhoto(sql, userId, file, bytes);
  }

  return json({
    ok: true,
    photoUrl: `/api/athlete-profile-photo?v=${encodeURIComponent(saved.updatedAt)}`,
    updatedAt: saved.updatedAt,
    storageBackend: saved.storageBackend,
  });
}
