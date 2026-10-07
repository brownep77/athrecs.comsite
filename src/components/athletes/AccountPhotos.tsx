import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Images, Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBearerToken } from "@/lib/auth/client";

type Photo = { id: string; url: string; uploadedAt: string };
type Gallery = { photos: Photo[]; limit: number };
const QUERY_KEY = ["athlete-photo-gallery"];
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function authHeaders(): HeadersInit {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Your photos could not be loaded. Please try again.");
  }
  return response;
}

async function preparePhoto(file: File): Promise<File> {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Choose a JPEG, PNG or WebP photo.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a photo smaller than 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error("This photo could not be opened. Try another image.");
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo uploads are not supported in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    // Re-encode the pixels to resize the image and discard original EXIF/GPS metadata.
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("This photo could not be processed.")),
        "image/webp",
        0.85,
      );
    });
    if (blob.size > 2 * 1024 * 1024) throw new Error("Choose a smaller or less detailed photo.");
    return new File([blob], "athrecs-photo.webp", { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function PhotoCard({
  photo,
  number,
  onRemoved,
}: {
  photo: Photo;
  number: number;
  onRemoved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    const controller = new AbortController();
    void request(photo.url, { signal: controller.signal })
      .then((response) => response.blob())
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError("This photo could not be loaded. Refresh to try again.");
      });
    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo.url]);

  async function removePhoto() {
    setRemoving(true);
    setError("");
    try {
      await request(photo.url, { method: "DELETE" });
      onRemoved();
    } catch (error) {
      setError(error instanceof Error ? error.message : "The photo could not be removed.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <article
      aria-label={`Gallery photo ${number}`}
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-elevated">
        {imageUrl ? (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`View photo ${number} in full size`}
            className="h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <img
              src={imageUrl}
              alt={`Your uploaded photo ${number}`}
              className="h-full w-full object-contain"
            />
          </a>
        ) : error ? (
          <Images className="size-8 text-muted" aria-hidden="true" />
        ) : (
          <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading photo" />
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-xs text-muted">
          Added{" "}
          {new Date(photo.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {confirming ? (
          <div className="space-y-2">
            <p className="text-sm text-fg">Remove this photo permanently?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-red-600"
                disabled={removing}
                onClick={() => void removePhoto()}
              >
                {removing ? "Removing…" : "Remove photo"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={removing}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(true)}>
            <Trash2 className="mr-2 size-4" aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>
    </article>
  );
}

export function AccountPhotos() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const gallery = useQuery<Gallery>({
    queryKey: QUERY_KEY,
    queryFn: async () => (await request("/api/athlete-photos")).json(),
    retry: false,
  });
  const photos = gallery.data?.photos ?? [];
  const limit = gallery.data?.limit ?? 30;

  async function uploadPhotos(files: File[]) {
    if (!files.length || uploadingRef.current || !gallery.data) return;
    uploadingRef.current = true;
    setMessage("");
    setErrors([]);
    const remaining = Math.max(0, limit - photos.length);
    const selected = files.slice(0, remaining);
    const failures: string[] =
      files.length > remaining
        ? ["Only the photos that fit in your 30-photo gallery were selected."]
        : [];
    let added = 0;
    try {
      for (const [index, file] of selected.entries()) {
        setProgress(`Adding photo ${index + 1} of ${selected.length}…`);
        try {
          const form = new FormData();
          form.append("photo", await preparePhoto(file));
          await request("/api/athlete-photos", { method: "POST", body: form });
          added += 1;
        } catch (error) {
          failures.push(
            `${file.name}: ${error instanceof Error ? error.message : "Upload failed. Please try again."}`,
          );
        }
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (added) setMessage(`${added} photo${added === 1 ? "" : "s"} added to your gallery.`);
      setErrors(failures);
    } finally {
      uploadingRef.current = false;
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-fg">Your photos</h3>
          <p className="mt-1 text-sm text-muted">
            Keep photos from races, training and memorable moments together.
          </p>
          {gallery.data ? (
            <p className="mt-2 text-xs text-muted">
              {photos.length} of {limit} photos
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          disabled={!gallery.data || Boolean(progress) || photos.length >= limit}
          onClick={() => inputRef.current?.click()}
        >
          {progress ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="mr-2 size-4" aria-hidden="true" />
          )}
          Add photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose gallery photos"
          className="hidden"
          onChange={(event) => void uploadPhotos(Array.from(event.target.files ?? []))}
        />
      </div>
      <p className="flex items-start gap-2 text-sm text-muted">
        <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Only you can see these photos. Your gallery is not included when you share your profile.
      </p>
      <p className="text-xs text-muted">
        Choose one or more JPEG, PNG or WebP images, up to 10 MB each. Photos are resized and
        location metadata is removed before upload.
      </p>
      <p role="status" aria-live="polite" className="text-sm text-fg">
        {progress || message}
      </p>
      {errors.length ? (
        <ul role="alert" className="space-y-1 text-sm text-red-600">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      ) : null}
      {gallery.isError ? (
        <div role="alert" className="rounded-lg border border-border p-4">
          <p className="text-sm text-fg">{gallery.error.message}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => void gallery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : gallery.isPending ? (
        <p className="text-sm text-muted">Loading your photos…</p>
      ) : photos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              number={index + 1}
              onRemoved={() => {
                queryClient.setQueryData<Gallery>(QUERY_KEY, (current) =>
                  current
                    ? { ...current, photos: current.photos.filter((item) => item.id !== photo.id) }
                    : current,
                );
                setMessage("Photo removed.");
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-elevated px-6 py-10 text-center">
          <Images className="mx-auto mb-3 size-9 text-muted" aria-hidden="true" />
          <p className="font-semibold text-fg">Your photo gallery starts here</p>
          <p className="mt-2 text-sm text-muted">
            Use Add photos to upload from your phone or computer.
          </p>
        </div>
      )}
      {photos.length >= limit ? (
        <p className="text-sm text-muted">Your gallery is full. Remove a photo to add another.</p>
      ) : null}
    </div>
  );
}
