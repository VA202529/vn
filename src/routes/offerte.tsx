import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Section, Eyebrow } from "@/components/site/Section";
import { postAction } from "@/lib/api";
import { useSiteData } from "@/hooks/use-site-data";

export const Route = createFileRoute("/offerte")({
  head: () => ({
    meta: [
      { title: "Offerte aanvragen — Van Appiah" },
      { name: "description", content: "Vraag eenvoudig een vrijblijvende offerte aan voor uw project." },
    ],
  }),
  component: OffertePage,
});

const diensten = [
  "Website",
  "Webshop",
  "Admin dashboard",
  "Automatisering",
  "Maatwerk applicatie",
  "Grafisch ontwerp & branding",
  "Anders",
];

function OffertePage() {
  const { data } = useSiteData();
  const productenOpts = (data?.producten ?? []).map((p) => p.titel).filter(Boolean) as string[];
  const allOpts = Array.from(new Set([...diensten, ...productenOpts]));

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    bedrijfsnaam: "",
    adres: "",
    telefoonnummer: "",
    email: "",
    gewenste_dienst: "",
    budget: "",
    beschrijving_project: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.voornaam.trim() ||
      !form.email.trim() ||
      !form.gewenste_dienst.trim() ||
      !form.beschrijving_project.trim()
    ) {
      toast.error("Vul de verplichte velden in.");
      return;
    }
    setSubmitting(true);
    try {
      await postAction({ action: "submitQuote", data: form });
      toast.success("Je offerteaanvraag is ontvangen.");
      setSent(true);
    } catch {
      toast.error("Versturen lukte niet. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Section className="pt-12 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Eyebrow>Offerte</Eyebrow>
        <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          Vraag een<br />vrijblijvende offerte aan.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Vul het formulier in en we sturen je binnen één werkdag een gerichte offerte op maat.
        </p>
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-border p-6 sm:p-8 md:p-10 max-w-3xl">
          {sent ? (
            <div className="py-16 sm:py-20 text-center">
              <div className="size-12 mx-auto rounded-full bg-foreground text-background grid place-items-center">✓</div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">Aanvraag verzonden</h3>
              <p className="mt-2 text-muted-foreground">We nemen zo snel mogelijk contact met u op.</p>
              <Link to="/" className="mt-6 inline-block text-sm underline text-muted-foreground hover:text-foreground">
                Terug naar home
              </Link>
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
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Bedrijfsnaam" value={form.bedrijfsnaam} onChange={(v) => update("bedrijfsnaam", v)} />
                <Field label="Adres" value={form.adres} onChange={(v) => update("adres", v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Gewenste dienst
                  </label>
                  <select
                    required
                    value={form.gewenste_dienst}
                    onChange={(e) => update("gewenste_dienst", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                  >
                    <option value="">Maak een keuze…</option>
                    {allOpts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Budget <span className="ml-1 text-muted-foreground/60 normal-case">(optioneel)</span>
                  </label>
                  <select
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                  >
                    <option value="">Maak een keuze…</option>
                    <option value="< €500">Minder dan €500</option>
                    <option value="€500 - €1500">€500 – €1.500</option>
                    <option value="€1500 - €5000">€1.500 – €5.000</option>
                    <option value="€5000+">€5.000 of meer</option>
                    <option value="Onbekend">Nog onbekend</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                  Beschrijving van het project
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.beschrijving_project}
                  onChange={(e) => update("beschrijving_project", e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
                  placeholder="Wat wilt u bereiken? Welke functionaliteiten? Welke termijn?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Versturen…" : "Offerte aanvragen →"}
              </button>
            </form>
          )}
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
