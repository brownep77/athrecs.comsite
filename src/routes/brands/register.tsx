import {
  formText,
  usePartnerAccount,
  useRefreshPartners,
} from "@/components/partners/partner-hooks";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  PartnerArea,
  PartnerHeader,
  PartnerSignIn,
  PartnerError,
  PartnerStatus,
  LoadingPartners,
  Field,
  SelectField,
  Declaration,
  panelClass,
} from "@/components/partners/PartnerUI";
import { saveBrandRegistration } from "@/lib/athrecs/partnerships-api";
import { BRAND_CATEGORIES, brandSchema } from "@/lib/athrecs/partnerships";

export const Route = createFileRoute("/brands/register")({
  head: () => ({
    meta: [{ title: "Register your brand | ATHRECS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <PartnerArea>
      <BrandRegistration />
    </PartnerArea>
  ),
});
function BrandRegistration() {
  const { user, isPending, query } = usePartnerAccount();
  const refresh = useRefreshPartners();
  const save = useMutation({
    mutationFn: (form: FormData) =>
      saveBrandRegistration({
        data: brandSchema.parse({
          name: formText(form, "name"),
          website: formText(form, "website"),
          category: formText(form, "category"),
          description: formText(form, "description"),
          sports: formText(form, "sports"),
          markets: formText(form, "markets"),
          contactName: formText(form, "contactName"),
          contactRole: formText(form, "contactRole"),
          declaration: form.get("declaration") === "on",
        }),
      }),
    onSuccess: refresh,
  });
  const brand = query.data?.brand;
  return (
    <>
      <PartnerHeader
        title="Register your brand"
        description="Grow your brand's exposure through athletes, influencers and sporting communities. Introduce your company and the partnerships you want to build. Our team checks your business and authority before publication."
      />
      {isPending || query.isLoading ? (
        <LoadingPartners />
      ) : !user ? (
        <PartnerSignIn path="/brands/register" />
      ) : query.isError ? (
        <PartnerError error={query.error} />
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          {brand ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{brand.name}</h2>
                <PartnerStatus status={brand.status} />
              </div>
              {brand.review_note ? (
                <p className="mt-3 text-sm text-muted">{brand.review_note}</p>
              ) : null}
              <p className="mt-3 text-sm text-muted">
                Changes return your registration to review. Your public profile and opportunities
                are hidden until it is approved again.
              </p>
            </section>
          ) : null}
          {!query.data?.emailVerified ? (
            <p className="rounded-lg bg-elevated p-4 text-sm">
              A verified email is required to register. Sign in with Google or verify your account
              email.
            </p>
          ) : null}
          {save.isSuccess ? (
            <div role="status" className="rounded-lg bg-accent-soft p-4">
              <p className="font-semibold">Registration submitted for review.</p>
              <Link to="/brands/manage" className="mt-2 inline-block text-accent underline">
                Open your brand dashboard
              </Link>
            </div>
          ) : null}
          <form
            key={brand?.revision ?? "new"}
            className={`${panelClass} space-y-5`}
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(new FormData(e.currentTarget));
            }}
          >
            <Field label="Company or brand name" name="name" value={brand?.name} max={120} />
            <Field
              label="Official website"
              name="website"
              type="url"
              value={brand?.website}
              max={1000}
              hint="Use your company's https:// website."
            />
            <SelectField
              label="Primary product category"
              name="category"
              value={brand?.category ?? "sportswear"}
              options={BRAND_CATEGORIES}
            />
            <Field
              label="About your company"
              name="description"
              value={brand?.description}
              min={20}
              max={1500}
              multiline
              hint="This description becomes public after approval. Use factual descriptions of your products."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Sports you support" name="sports" value={brand?.sports} />
              <Field label="Countries or markets" name="markets" value={brand?.markets} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" name="contactName" value={brand?.contact_name} max={120} />
              <Field
                label="Your role in the company"
                name="contactRole"
                value={brand?.contact_role}
                max={120}
              />
            </div>
            <p className="text-sm text-muted">
              Your account email and representative details are private to you and AthRecs
              reviewers.
            </p>
            <Declaration>
              I am authorised to represent this company, the information is accurate, and I have
              read the{" "}
              <Link to="/privacy" className="text-accent underline">
                privacy notice
              </Link>
              . I understand that registration does not grant permission to use an athlete's name or
              image in advertising.
            </Declaration>
            <PartnerError error={save.error} />
            <Button
              type="submit"
              disabled={
                save.isPending || !query.data?.emailVerified || brand?.status === "suspended"
              }
            >
              {save.isPending ? "Submitting…" : "Submit for review"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
