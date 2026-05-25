import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/site/Section";
import { useState } from "react";
import { toast } from "sonner";
import { postAction } from "@/lib/api";
import { useSiteData } from "@/hooks/use-site-data";
import { breadcrumbSchema, seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      ...seo({
        title: "Contact Van Appiah | Website en marketing Amsterdam-Noord",
        description:
          "Neem contact op met Van Appiah voor een website, webshop, branding of marketingtraject in Amsterdam-Noord en omgeving.",
        path: "/contact",
        keywords: ["contact Van Appiah", "website laten maken Amsterdam Noord", "marketing bureau Amsterdam Noord"],
        jsonLd: breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]),
      }).meta,
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSiteData();
  const bg = data?.bedrijfsgegevens;
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    telefoonnummer: "",
    onderwerp: "",
    bericht: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.voornaam.trim() || !form.email.trim() || !form.bericht.trim()) {
      toast.error("Vul voornaam, e-mail en je bericht in.");
      return;
    }
    setSubmitting(true);
    try {
      await postAction({ action: "submitMessage", data: form });
      toast.success("Bedankt, je bericht is verzonden.");
      setSent(true);
    } catch {
      toast.error("Versturen lukte niet. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  const emails = [bg?.email_1, bg?.email_2, bg?.email_3].filter(Boolean) as string[];
  const openingstijden = [bg?.openingstijd_1, bg?.openingstijd_2, bg?.openingstijd_3].filter(Boolean) as string[];
  const online = [
    bg?.website && { label: "Website", value: bg.website, href: hrefFor(bg.website) },
    bg?.instagram && { label: "Instagram", value: bg.instagram, href: hrefFor(bg.instagram) },
    bg?.tiktok && { label: "TikTok", value: bg.tiktok, href: hrefFor(bg.tiktok) },
    bg?.linkedin && { label: "LinkedIn", value: bg.linkedin, href: hrefFor(bg.linkedin) },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <>
      <Section className="pt-12 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          Laten we samen<br />iets bouwen.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Vertel ons over uw website, webshop, branding of marketingvraag. Wij reageren binnen een werkdag.
        </p>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 rounded-[1.75rem] sm:rounded-[2rem] border border-border p-6 sm:p-8 md:p-10">
            {sent ? (
              <div className="py-16 sm:py-20 text-center">
                <div className="size-12 mx-auto rounded-full bg-foreground text-background grid place-items-center">✓</div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">Bericht verzonden</h3>
                <p className="mt-2 text-muted-foreground">Wij nemen zo snel mogelijk contact met u op.</p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ voornaam: "", achternaam: "", email: "", telefoonnummer: "", onderwerp: "", bericht: "" });
                  }}
                  className="mt-6 text-sm underline text-muted-foreground hover:text-foreground"
                >
                  Nieuw bericht versturen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Voornaam" value={form.voornaam} onChange={(v) => update("voornaam", v)} required />
                  <Field label="Achternaam" value={form.achternaam} onChange={(v) => update("achternaam", v)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="E-mail" type="email" value={form.email} onChange={(v) => update("email", v)} required />
                  <Field label="Telefoon" value={form.telefoonnummer} onChange={(v) => update("telefoonnummer", v)} />
                </div>
                <Field label="Onderwerp" value={form.onderwerp} onChange={(v) => update("onderwerp", v)} />
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Bericht
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.bericht}
                    onChange={(e) => update("bericht", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
                    placeholder="Vertel iets over uw project…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Versturen…" : "Bericht versturen →"}
                </button>
              </form>
            )}
          </div>

          <aside className="md:col-span-2 space-y-4">
            {emails.map((e) => (
              <InfoCard key={e} label="E-mail" value={e} href={`mailto:${e}`} />
            ))}
            {bg?.telefoonnummer && (
              <InfoCard label="Telefoon" value={bg.telefoonnummer} href={`tel:${bg.telefoonnummer.replace(/\s/g, "")}`} />
            )}
            {bg?.adres && <InfoCard label="Adres" value={bg.adres} />}
            {online.map((item) => (
              <InfoCard key={item.label} label={item.label} value={item.value} href={item.href} />
            ))}
            {openingstijden.length > 0 && (
              <div className="rounded-3xl border border-border p-6">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Openingstijden</p>
                <ul className="mt-3 space-y-1">
                  {openingstijden.map((o) => (
                    <li key={o} className="text-sm">{o}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-3xl border border-border p-6 bg-surface">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Reactietijd</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">&lt; 24 uur</p>
              <p className="mt-2 text-sm text-muted-foreground">Op werkdagen reageren wij doorgaans binnen enkele uren.</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
        {label}
        {!required && <span className="ml-1 text-muted-foreground/60 normal-case">(optioneel)</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
      />
    </div>
  );
}

function InfoCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-base sm:text-lg font-medium break-words">{value}</p>
    </>
  );
  return href ? (
    <a href={href} className="block rounded-3xl border border-border p-6 hover:bg-surface transition-colors">{content}</a>
  ) : (
    <div className="rounded-3xl border border-border p-6">{content}</div>
  );
}

function hrefFor(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
