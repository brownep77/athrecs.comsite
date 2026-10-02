import { createHash, randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import {
  blobAuthOptions,
  blobStorageConnected,
  databaseBytes,
  deletePrivateBlob,
  fileSignatureMatches,
  photoResponse,
} from "./profile-photo.server";

const MAX_PHOTOS = 30;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PhotoRow = {
  id: string;
  blob_pathname: string | null;
  photo_bytes: Uint8Array | string | null;
  storage_backend: "blob" | "database";
  content_type: string;
  byte_size: number;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function handleAthleteGalleryRequest(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return json({ error: "Sign in to manage your photos" }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get("photo");
  if (id !== null && !UUID.test(id)) return json({ error: "Photo not found" }, 404);
  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return json({ error: "Method not allowed" }, 405);
  }
  if (request.method !== "GET" && request.headers.get("origin") !== url.origin) {
    return json({ error: "Invalid request origin" }, 403);
  }

  const sql = await getSql();
  if (request.method === "GET" && !id) {
    const photos = await sql<{ id: string; uploaded_at: string }>`
      select id, uploaded_at::text as uploaded_at from athlete_gallery_photos
      where user_id = ${userId} order by uploaded_at desc, id desc
    `;
    return json({
      photos: photos.map((photo) => ({
        id: photo.id,
        url: `/api/athlete-photos?photo=${photo.id}`,
        uploadedAt: new Date(photo.uploaded_at).toISOString(),
      })),
      limit: MAX_PHOTOS,
    });
  }

  if (request.method === "GET") {
    const [photo] = await sql<PhotoRow>`
      select id, blob_pathname, photo_bytes, storage_backend, content_type, byte_size
      from athlete_gallery_photos where id = ${id} and user_id = ${userId}
    `;
    if (!photo) return json({ error: "Photo not found" }, 404);
    if (photo.storage_backend === "database") {
      const bytes = databaseBytes(photo.photo_bytes);
      if (!bytes) return json({ error: "Photo not found" }, 404);
      return photoResponse(Uint8Array.from(bytes).buffer, photo.content_type, photo.byte_size);
    }
    if (!photo.blob_pathname || !blobStorageConnected()) {
      return json({ error: "Photo storage is temporarily unavailable" }, 503);
    }
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(photo.blob_pathname, { access: "private", ...blobAuthOptions() });
      if (!result || result.statusCode !== 200) return json({ error: "Photo not found" }, 404);
      return photoResponse(result.stream, photo.content_type, photo.byte_size);
    } catch {
      return json({ error: "Photo storage is temporarily unavailable" }, 503);
    }
  }

  if (request.method === "DELETE") {
    if (!id) return json({ error: "Choose a photo to remove" }, 400);
    const [deleted] = await sql<{ blob_pathname: string | null }>`
      delete from athlete_gallery_photos where id = ${id} and user_id = ${userId}
      returning blob_pathname
    `;
    if (!deleted) return json({ error: "Photo not found" }, 404);
    await deletePrivateBlob(deleted.blob_pathname, "gallery photo cleanup failed");
    return json({ ok: true });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > MAX_UPLOAD_BYTES + 65536) {
    return json({ error: "The processed photo must be 2 MB or smaller" }, 413);
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Upload a valid image file" }, 400);
  }
  const file = formData.get("photo");
  if (!(file instanceof File) || !IMAGE_TYPES.has(file.type)) {
    return json({ error: "Choose a JPEG, PNG or WebP photo" }, 400);
  }
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: "The processed photo must be 2 MB or smaller" }, 400);
  }
  if (!(await fileSignatureMatches(file))) {
    return json({ error: "The file does not match its declared image format" }, 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const photoId = randomUUID();
  let pathname: string | null = null;
  // As with the profile picture, prefer private Blob and retain a private DB fallback.
  if (blobStorageConnected()) {
    const accountKey = createHash("sha256").update(userId).digest("hex").slice(0, 24);
    const extension =
      file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    try {
      const { put } = await import("@vercel/blob");
      const uploaded = await put(`athlete-gallery/${accountKey}/${photoId}.${extension}`, file, {
        access: "private",
        addRandomSuffix: false,
        ...blobAuthOptions(),
      });
      pathname = uploaded.pathname;
    } catch {
      console.warn("[gallery-photo] Private Blob unavailable; using private database storage");
    }
  }

  try {
    const inserted = await sql.transaction(async (tx) => {
      // Serialize allocations per owner; the unique bounded slots also enforce the quota.
      await tx`select id from "user" where id = ${userId} for update`;
      const [available] = await tx<{ slot: number }>`
        select slot from generate_series(1, ${MAX_PHOTOS}) as slots(slot)
        where not exists (
          select 1 from athlete_gallery_photos p where p.user_id = ${userId} and p.slot = slots.slot
        ) order by slot limit 1
      `;
      if (!available) return false;
      await tx`
        insert into athlete_gallery_photos
          (id, user_id, slot, blob_pathname, photo_bytes, storage_backend, content_type, byte_size)
        values (${photoId}, ${userId}, ${available.slot}, ${pathname}, ${pathname ? null : bytes},
          ${pathname ? "blob" : "database"}, ${file.type}, ${file.size})
      `;
      return true;
    });
    if (!inserted) {
      await deletePrivateBlob(pathname, "gallery quota cleanup failed");
      return json({ error: "Your gallery holds up to 30 photos. Remove one to add another." }, 409);
    }
    return json({ ok: true, id: photoId }, 201);
  } catch (error) {
    await deletePrivateBlob(pathname, "gallery upload cleanup failed");
    throw error;
  }
}
