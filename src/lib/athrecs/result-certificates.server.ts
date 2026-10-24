import { createHash, randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { requireStaffUser } from "@/lib/auth/staff.server";
import { getSql } from "@/lib/db";
import {
  blobAuthOptions,
  blobStorageConnected,
  databaseBytes,
  deletePrivateBlob,
  fileSignatureMatches,
} from "./profile-photo.server";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
type Certificate = {
  id: string;
  filename: string;
  content_type: string;
  byte_size: number;
  sha256: string;
  uploaded_at: string;
  blob_pathname: string | null;
  file_bytes: Uint8Array | string | null;
  storage_backend: "blob" | "database";
};

function download(body: BodyInit, row: Certificate) {
  return new Response(body, {
    headers: {
      ...headers,
      "Content-Type": row.content_type,
      "Content-Length": String(row.byte_size),
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": `attachment; filename="certificate"; filename*=UTF-8''${encodeURIComponent(row.filename).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}`,
    },
  });
}

export async function handleResultCertificates(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return json({ error: "Sign in to manage certificates" }, 401);
  const url = new URL(request.url);
  if (!["GET", "POST", "DELETE"].includes(request.method))
    return json({ error: "Method not allowed" }, 405);
  if (request.method !== "GET" && request.headers.get("origin") !== url.origin)
    return json({ error: "Invalid request origin" }, 403);
  const staff = url.searchParams.get("staff") === "1";
  if (staff) {
    if (request.method !== "GET") return json({ error: "Staff access is read only" }, 403);
    // Use the same dedicated host, Google identity and allowlist as staff reviews.
    try {
      await requireStaffUser();
    } catch (error) {
      return json(
        { error: "Staff access required" },
        error instanceof Error && "status" in error ? Number(error.status) : 403,
      );
    }
  }
  const id = url.searchParams.get("certificate");
  const resultId = Number(url.searchParams.get("result"));
  if (
    !Number.isSafeInteger(resultId) ||
    resultId === 0 ||
    Math.abs(resultId) > 2147483647 ||
    (id && !UUID.test(id))
  )
    return json({ error: "Certificate not found" }, 404);
  const sql = await getSql();
  const [result] = await sql<{ athlete_id: number }>`
    select r.athlete_id from athlete_claimable_results r where r.id = ${resultId}
      and (${staff} or exists (select 1 from athlete_account_links l where l.athlete_id = r.athlete_id
        and l.user_id = ${userId} and l.status = 'active')) and (r.id > 0 or r.available)
  `;
  if (!result) return json({ error: "Result not found" }, 404);

  if (request.method === "GET" && !id) {
    // Never read file bodies for the metadata list.
    const rows =
      await sql<Certificate>`select id, filename, content_type, byte_size, sha256, uploaded_at::text
      from athlete_result_certificates where result_id = ${resultId} and athlete_id = ${result.athlete_id}
      and (${staff} or user_id = ${userId}) order by uploaded_at desc, id`;
    return json({
      certificates: rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        contentType: row.content_type,
        byteSize: row.byte_size,
        sha256: row.sha256,
        uploadedAt: row.uploaded_at,
      })),
      limit: 5,
    });
  }
  if (request.method === "GET") {
    const [row] = await sql<Certificate>`select * from athlete_result_certificates where id = ${id}
      and result_id = ${resultId} and athlete_id = ${result.athlete_id} and (${staff} or user_id = ${userId})`;
    if (!row) return json({ error: "Certificate not found" }, 404);
    if (row.storage_backend === "database") {
      const bytes = databaseBytes(row.file_bytes);
      return bytes
        ? download(Uint8Array.from(bytes).buffer, row)
        : json({ error: "Certificate not found" }, 404);
    }
    if (!row.blob_pathname || !blobStorageConnected())
      return json({ error: "Certificate storage unavailable" }, 503);
    try {
      const { get } = await import("@vercel/blob");
      const blob = await get(row.blob_pathname, { access: "private", ...blobAuthOptions() });
      return blob?.statusCode === 200
        ? download(blob.stream, row)
        : json({ error: "Certificate not found" }, 404);
    } catch {
      return json({ error: "Certificate storage unavailable" }, 503);
    }
  }
  if (request.method === "DELETE") {
    if (!id) return json({ error: "Choose a certificate to remove" }, 400);
    const [row] = await sql<{
      blob_pathname: string | null;
    }>`delete from athlete_result_certificates
      where id = ${id} and user_id = ${userId} and result_id = ${resultId}
      and athlete_id = ${result.athlete_id} returning blob_pathname`;
    if (!row) return json({ error: "Certificate not found" }, 404);
    await deletePrivateBlob(row.blob_pathname, "certificate cleanup failed");
    return json({ ok: true });
  }
  if (Number(request.headers.get("content-length")) > MAX_BYTES + 65536)
    return json({ error: "Certificates must be 2 MB or smaller" }, 413);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Choose a valid certificate file" }, 400);
  }
  const file = form.get("certificate");
  if (!(file instanceof File) || !TYPES.has(file.type) || !file.size || file.size > MAX_BYTES)
    return json({ error: "Choose a PDF, JPEG, PNG or WebP certificate up to 2 MB" }, 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (
    file.type === "application/pdf"
      ? bytes.subarray(0, 5).toString() !== "%PDF-"
      : !(await fileSignatureMatches(file))
  )
    return json({ error: "The file does not match its declared format" }, 400);
  const filename =
    file.name
      // eslint-disable-next-line no-control-regex -- Strip control characters from attachment filenames.
      .replace(/[\x00-\x1f\x7f/\\]/g, "_")
      .trim()
      .slice(0, 180) || "certificate";
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const certificateId = randomUUID();
  let pathname: string | null = null;
  if (blobStorageConnected()) {
    const accountKey = createHash("sha256").update(userId).digest("hex").slice(0, 24);
    const extension = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    }[file.type];
    try {
      const { put } = await import("@vercel/blob");
      const uploaded = await put(
        `result-certificates/${accountKey}/${certificateId}.${extension}`,
        file,
        { access: "private", addRandomSuffix: false, ...blobAuthOptions() },
      );
      pathname = uploaded.pathname;
    } catch {
      console.warn(
        "[result-certificates] Private Blob unavailable; using private database storage",
      );
    }
  }
  try {
    const outcome = await sql.transaction(async (tx) => {
      await tx`select id from "user" where id = ${userId} for update`;
      const links = await tx`select athlete_id from athlete_account_links where user_id = ${userId}
        and athlete_id = ${result.athlete_id} and status = 'active' for share`;
      if (!links.length) return "This result is no longer linked to your account";
      const [quota] = await tx<{ total: number; per_result: number; duplicate: boolean }>`
        select count(*)::int as total, count(*) filter (where result_id = ${resultId})::int as per_result,
          coalesce(bool_or(result_id = ${resultId} and sha256 = ${sha256}), false) as duplicate
        from athlete_result_certificates where user_id = ${userId}`;
      if (quota.duplicate) return "This certificate is already saved for this result";
      if (quota.total >= 100 || quota.per_result >= 5)
        return "You can store 5 certificates per result and 100 per account. Remove one to add another.";
      await tx`insert into athlete_result_certificates
        (id, user_id, athlete_id, result_id, filename, content_type, byte_size, sha256, storage_backend, blob_pathname, file_bytes)
        values (${certificateId}, ${userId}, ${result.athlete_id}, ${resultId}, ${filename}, ${file.type}, ${file.size},
          ${sha256}, ${pathname ? "blob" : "database"}, ${pathname}, ${pathname ? null : bytes})`;
      return null;
    });
    if (outcome) {
      await deletePrivateBlob(pathname, "certificate quota cleanup failed");
      return json({ error: outcome }, 409);
    }
    return json({ ok: true, id: certificateId }, 201);
  } catch (error) {
    await deletePrivateBlob(pathname, "certificate upload cleanup failed");
    throw error;
  }
}
