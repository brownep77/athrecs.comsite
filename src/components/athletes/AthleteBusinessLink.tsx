import { severinMokakeBusiness, severinMokakeCareer } from "@/data/severin-mokake";

export function AthleteBusinessLink({ slug }: { slug: string }) {
  if (slug !== severinMokakeCareer.slug) return null;
  return (
    <p className="text-sm">
      <a
        href={severinMokakeBusiness.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-4"
      >
        {severinMokakeBusiness.label} · www.bastraining.co
      </a>
    </p>
  );
}
