import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, LockKeyhole, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBearerToken } from "@/lib/auth/client";

const SOURCE_MAX_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 512;

type EditorState = {
  sourceUrl: string;
  image: HTMLImageElement;
};

type ProfilePhotoUploaderProps = {
  displayName: string;
  photoUrl: string;
  uploadAvailable: boolean;
  onChanged: () => void;
};

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "A";
}

function authHeaders(): HeadersInit {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function responseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || `Photo request failed (${response.status})`;
  } catch {
    return `Photo request failed (${response.status})`;
  }
}

function drawSquare(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
  horizontal: number,
  vertical: number,
  zoom: number,
): void {
  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * zoom;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const maxPanX = Math.max(0, renderedWidth - size);
  const maxPanY = Math.max(0, renderedHeight - size);
  const offsetX = -(maxPanX * (horizontal / 100));
  const offsetY = -(maxPanY * (vertical / 100));

  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, offsetX, offsetY, renderedWidth, renderedHeight);
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The photo could not be processed"))),
      "image/webp",
      quality,
    );
  });
}

async function compressedPhoto(
  image: HTMLImageElement,
  horizontal: number,
  vertical: number,
  zoom: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Photo editing is not supported in this browser");
  drawSquare(context, image, OUTPUT_SIZE, horizontal, vertical, zoom);

  let quality = 0.9;
  let blob = await canvasBlob(canvas, quality);
  while (blob.size > 1_750_000 && quality > 0.55) {
    quality -= 0.08;
    blob = await canvasBlob(canvas, quality);
  }
  if (blob.size > 2 * 1024 * 1024) {
    throw new Error("The processed photo is still too large. Choose a smaller image.");
  }
  return blob;
}

export function ProfilePhotoUploader({
  displayName,
  photoUrl,
  uploadAvailable,
  onChanged,
}: ProfilePhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [privateImageUrl, setPrivateImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(Boolean(photoUrl));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [horizontal, setHorizontal] = useState(50);
  const [vertical, setVertical] = useState(42);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    if (!photoUrl) {
      setPrivateImageUrl("");
      setImageLoading(false);
      return () => undefined;
    }

    setImageLoading(true);
    void fetch(photoUrl, {
      credentials: "include",
      headers: authHeaders(),
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseMessage(response));
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPrivateImageUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setPrivateImageUrl("");
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !editor) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    drawSquare(context, editor.image, canvas.width, horizontal, vertical, zoom);
  }, [editor, horizontal, vertical, zoom]);

  useEffect(
    () => () => {
      if (editor?.sourceUrl) URL.revokeObjectURL(editor.sourceUrl);
    },
    [editor],
  );

  const visibleImage = privateImageUrl;
  const avatarInitials = useMemo(() => initials(displayName), [displayName]);

  function closeEditor() {
    if (editor?.sourceUrl) URL.revokeObjectURL(editor.sourceUrl);
    setEditor(null);
    setHorizontal(50);
    setVertical(42);
    setZoom(1);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function choosePhoto(file: File | undefined) {
    setMessage(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose a WebP, JPEG or PNG image.");
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      setMessage("Choose an image smaller than 10 MB.");
      return;
    }

    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (image.naturalWidth < 128 || image.naturalHeight < 128) {
        URL.revokeObjectURL(sourceUrl);
        setMessage("Choose a photo at least 128 by 128 pixels.");
        return;
      }
      setHorizontal(50);
      setVertical(42);
      setZoom(1);
      setEditor({ sourceUrl, image });
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      setMessage("That image could not be opened. Try another photo.");
    };
    image.src = sourceUrl;
  }

  async function savePhoto() {
    if (!editor) return;
    setBusy("upload");
    setMessage(null);
    try {
      const blob = await compressedPhoto(editor.image, horizontal, vertical, zoom);
      const formData = new FormData();
      formData.append("photo", new File([blob], "athlete-profile-photo.webp", { type: "image/webp" }));
      const response = await fetch("/api/athlete-profile-photo", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: formData,
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      closeEditor();
      setMessage("Profile photo saved privately.");
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The photo could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  async function removePhoto() {
    setBusy("remove");
    setMessage(null);
    try {
      const response = await fetch("/api/athlete-profile-photo", {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      setPrivateImageUrl("");
      setMessage("Profile photo removed.");
      onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The photo could not be removed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="group relative size-36 shrink-0 overflow-hidden rounded-full border-4 border-white/90 bg-slate-800 shadow-2xl ring-1 ring-white/20 md:size-40">
        {imageLoading ? (
          <div className="flex size-full items-center justify-center text-white/70">
            <Loader2 className="size-6 animate-spin" aria-label="Loading profile photo" />
          </div>
        ) : visibleImage ? (
          <img
            src={visibleImage}
            alt={`${displayName} profile`}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-cyan-500/40 via-slate-700 to-slate-950 font-display text-4xl font-semibold text-white">
            {avatarInitials}
          </div>
        )}
        {uploadAvailable ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-x-0 bottom-0 flex min-h-12 items-center justify-center gap-1 bg-slate-950/75 px-2 text-xs font-semibold text-white opacity-100 backdrop-blur-sm transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            aria-label={visibleImage ? "Change profile photo" : "Upload profile photo"}
          >
            <Camera className="size-4" aria-hidden="true" />
            {visibleImage ? "Change" : "Upload"}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => void choosePhoto(event.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        {uploadAvailable ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="size-4" aria-hidden="true" />
            {visibleImage ? "Change photo" : "Upload from device"}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-200">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Private photo storage required
          </span>
        )}
        {photoUrl && uploadAvailable ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void removePhoto()}
          >
            {busy === "remove" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            Remove
          </Button>
        ) : null}
      </div>

      <p className="max-w-xs text-xs leading-5 text-slate-300">
        Upload directly from this device. ATHRECS does not use your Google profile picture.
      </p>

      {message ? (
        <p className="max-w-xs rounded-lg border border-white/15 bg-slate-950/45 px-3 py-2 text-xs leading-5 text-slate-100" role="status">
          {message}
        </p>
      ) : null}

      {editor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <section
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-photo-editor-title"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <h2 id="profile-photo-editor-title" className="font-display text-xl font-semibold text-fg">
                  Position your profile photo
                </h2>
                <p className="mt-1 text-sm text-muted">
                  The saved photo is square, compressed and stripped of the original file metadata.
                </p>
              </div>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted hover:bg-elevated hover:text-fg"
                onClick={closeEditor}
                aria-label="Close photo editor"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[18rem_1fr]">
              <div className="mx-auto overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-inner">
                <canvas
                  ref={previewCanvasRef}
                  width={288}
                  height={288}
                  className="block size-72 max-w-full"
                  aria-label="Profile photo crop preview"
                />
              </div>
              <div className="space-y-4">
                <RangeControl label="Move left or right" value={horizontal} onChange={setHorizontal} />
                <RangeControl label="Move up or down" value={vertical} onChange={setVertical} />
                <RangeControl
                  label="Zoom"
                  value={Math.round((zoom - 1) * 100)}
                  onChange={(value) => setZoom(1 + value / 100)}
                />
                <div className="rounded-xl border border-border bg-elevated p-3 text-xs leading-5 text-muted">
                  Your uploaded photo remains part of your private Athlete Account. It is not made
                  public with ordinary athlete results.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
              <Button type="button" variant="secondary" disabled={busy !== null} onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="button" disabled={busy !== null} onClick={() => void savePhoto()}>
                {busy === "upload" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-4" aria-hidden="true" />
                )}
                {busy === "upload" ? "Saving photo…" : "Save photo"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function RangeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-fg">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-current"
      />
    </label>
  );
}
