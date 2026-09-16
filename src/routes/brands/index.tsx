import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PartnerArea,
  PartnerHeader,
  PartnerError,
  LoadingPartners,
  inputClass,
  panelClass,
} from "@/components/partners/PartnerUI";
import { getPublicPartnerships } from "@/lib/athrecs/partnerships-api";
import { BRAND_CATEGORIES } from "@/lib/athrecs/partnerships";

export const Route = createFileRoute("/brands/")({
  head: () => ({
    meta: [
      { title: "Brands & Partners | ATHRECS" },
      {
        name: "description",
        content:
          "Give your brand more exposure through athletes and influencers. Explore sponsorships, ambassador roles and product partnerships across sport.",
      },
    ],
  }),
  component: () => (
    <PartnerArea>
      <BrandDirectory />
    </PartnerArea>
  ),
});
function BrandDirectory() {
  const [category, setCategory] = useState("");
  const directory = useQuery({
    queryKey: ["partners", "public"],
    queryFn: () => getPublicPartnerships(),
  });
  const brands =
    directory.data?.brands.filter((brand) => !category || brand.category === category) ?? [];
  return (
    <>
      <PartnerHeader
        title="Give your brand more exposure"
        description="Connect with athletes and influencers who can bring your brand to new audiences. Build partnerships through sponsorship, authentic content, ambassador roles and product experiences."
      />
      <section className="grid gap-4 md:grid-cols-3" aria-label="Partnership pathways">
        <article className={panelClass}>
          <h2 className="text-lg font-semibold">For brands</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Reach relevant sporting communities through athletes, influencers and clubs. Register
            your company and propose opportunities.
          </p>
          <Link
            to="/brands/register"
            className="mt-4 inline-block font-semibold text-accent hover:underline"
          >
            Register your brand →
          </Link>
        </article>
        <article className={panelClass}>
          <h2 className="text-lg font-semibold">For athletes & influencers</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Turn your sporting story and audience into brand partnerships. Share your interests and
            a public profile for review.
          </p>
          <Link
            to="/sponsorship"
            search={{ kind: "creator" }}
            className="mt-4 inline-block font-semibold text-accent hover:underline"
          >
            Share your partnership interests →
          </Link>
        </article>
        <article className={panelClass}>
          <h2 className="text-lg font-semibold">For races & organisers</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Connect brands with race-day audiences through event sponsorship, product experiences
            and community partnerships.
          </p>
          <a
            href="https://www.runrecs.com/sponsorship"
            className="mt-4 inline-block font-semibold text-accent hover:underline"
          >
            Race sponsorship on RunRecs →
          </a>
        </article>
      </section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full sm:w-64">
          <label htmlFor="brand-category" className="text-sm font-semibold">
            Product category
          </label>
          <select
            id="brand-category"
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {Object.entries(BRAND_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Button asChild>
          <Link to="/brands/register">
            Register your brand <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <PartnerError error={directory.error} />
      {directory.isLoading ? <LoadingPartners /> : null}
      {directory.data && !brands.length ? (
        <section className={`${panelClass} py-12 text-center`}>
          <Building2 className="mx-auto size-8 text-accent" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold">
            {category ? "No approved brands in this category yet" : "Brand registration is open"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Approved company profiles will appear here. Register your company to introduce your
            products and propose athlete or club opportunities.
          </p>
        </section>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {brands.map((brand) => (
          <article key={brand.id} className={panelClass}>
            <p className="text-sm font-medium text-accent">{BRAND_CATEGORIES[brand.category]}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">{brand.name}</h2>
            <p className="mt-2 text-sm text-muted">Business identity checked</p>
            <p className="mt-4 whitespace-pre-wrap break-words">{brand.description}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="font-semibold">Sports</dt>
                <dd className="text-muted">{brand.sports}</dd>
              </div>
              <div>
                <dt className="font-semibold">Markets</dt>
                <dd className="text-muted">{brand.markets}</dd>
              </div>
            </dl>
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Company website <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
      <p className="text-sm text-muted">
        A company identity check confirms the business and its representative. It does not certify
        products or imply an athlete endorsement.
      </p>
    </>
  );
}
