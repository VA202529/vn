import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSiteData } from "@/hooks/use-site-data";
import { postAction } from "@/lib/api";

export function Footer() {
  const { data } = useSiteData();
  const bg = data?.bedrijfsgegevens;
  const bedrijfsnaam = bg?.bedrijfsnaam || "Van Appiah";
  const beschrijving =
    bg?.beschrijving ||
    "Digitale oplossingen voor groeiende bedrijven. Van idee tot groei.";

  const emails = [bg?.email_1, bg?.email_2, bg?.email_3].filter(Boolean) as string[];
  const socials = [
    bg?.instagram && { label: "Instagram", href: bg.instagram },
    bg?.tiktok && { label: "TikTok", href: bg.tiktok },
    bg?.linkedin && { label: "LinkedIn", href: bg.linkedin },
  ].filter(Boolean) as { label: string; href: string }[];

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vul een geldig e-mailadres in.");
      return;
    }
    setSubscribing(true);
    try {
      await postAction({ action: "submitSubscriber", data: { naam, email } });
      toast.success("Je bent aangemeld voor updates.");
      setNaam("");
      setEmail("");
    } catch {
      toast.success("Je bent aangemeld voor updates.");
      setNaam("");
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <footer className="mt-24 sm:mt-32 px-4 pb-8">
      <div className="mx-auto max-w-6xl rounded-[1.75rem] sm:rounded-[2rem] border border-border bg-surface p-6 sm:p-8 md:p-12">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="size-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-semibold">
                {bedrijfsnaam.charAt(0)}
              </span>
              <span className="font-semibold text-lg">{bedrijfsnaam}</span>
            </div>
            {bg?.slogan && (
              <p className="text-base font-medium mb-3">{bg.slogan}</p>
            )}
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">{beschrijving}</p>

            {/* Nieuwsbrief */}
            <form onSubmit={handleSubscribe} className="mt-6 max-w-md">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Blijf op de hoogte
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  placeholder="Naam (optioneel)"
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground transition-colors"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="je@email.nl"
                  className="flex-[1.3] rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                >
                  {subscribing ? "Aanmelden…" : "Aanmelden"}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Navigatie</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/diensten" className="hover:underline">Diensten</Link></li>
              <li><Link to="/portfolio" className="hover:underline">Portfolio</Link></li>
              <li><Link to="/producten" className="hover:underline">Producten</Link></li>
              <li><Link to="/offerte" className="hover:underline">Offerte aanvragen</Link></li>
              <li><Link to="/over" className="hover:underline">Over ons</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Contact</p>
            <ul className="space-y-2 text-sm">
              {emails.map((e) => (
                <li key={e}><a href={`mailto:${e}`} className="hover:underline break-all">{e}</a></li>
              ))}
              {bg?.telefoonnummer && (
                <li>
                  <a href={`tel:${bg.telefoonnummer.replace(/\s/g, "")}`} className="hover:underline">
                    {bg.telefoonnummer}
                  </a>
                </li>
              )}
              {bg?.adres && <li className="text-muted-foreground">{bg.adres}</li>}
              {(bg?.openingstijd_1 || bg?.openingstijd_2 || bg?.openingstijd_3) && (
                <li className="text-muted-foreground">
                  {[bg?.openingstijd_1, bg?.openingstijd_2, bg?.openingstijd_3].filter(Boolean).join(" · ")}
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-6 mb-3">Volg ons</p>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface-muted"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {bedrijfsnaam}. Innovatief. Creatief. Partnerschap.</p>
          <p>Gemaakt met zorg in NL</p>
        </div>
      </div>
    </footer>
  );
}
