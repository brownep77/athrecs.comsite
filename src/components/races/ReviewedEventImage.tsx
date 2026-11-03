import { reviewedEventImage } from "@/lib/athrecs/event-images";

export function ReviewedEventImage({ slug, date }: { slug: string; date?: string | null }) {
  const image = reviewedEventImage(slug, date);
  if (!image) return null;
  return (
    <figure className="my-5 max-w-3xl space-y-2">
      <img
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-xl"
      />
      <figcaption className="text-sm text-muted">
        {image.caption}{" "}
        <a href={image.sourceUrl} className="underline">
          Organiser’s event page
        </a>
      </figcaption>
    </figure>
  );
}
