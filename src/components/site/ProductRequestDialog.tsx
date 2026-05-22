import { useState } from "react";
import { toast } from "sonner";
import { postAction, getProductId, type ProductItem } from "@/lib/api";

type Props = {
  product: ProductItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductRequestDialog({ product, open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    bedrijfsnaam: "",
    adres: "",
    telefoonnummer: "",
    email: "",
    extra_informatie: "",
  });

  if (!open) return null;

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.voornaam.trim() || !form.email.trim()) {
      toast.error("Vul je voornaam en e-mail in.");
      return;
    }
    setSubmitting(true);
    try {
      await postAction({
        action: "submitProductRequest",
        data: {
          product_id: getProductId(product),
          product_titel: String(product.titel || ""),
          ...form,
        },
      });
      toast.success("Je aanvraag is ontvangen.");
      onOpenChange(false);
    } catch {
      toast.error("Versturen lukte niet. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={() => !submitting && onOpenChange(false)}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background border border-border p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Aanvraag</p>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">{product.titel}</h3>
            <p className="mt-1 text-sm text-muted-foreground">We nemen binnen 24 uur contact met je op.</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-9 rounded-full hover:bg-surface grid place-items-center"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <DialogField label="Voornaam" value={form.voornaam} onChange={(v) => update("voornaam", v)} required />
            <DialogField label="Achternaam" value={form.achternaam} onChange={(v) => update("achternaam", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <DialogField label="E-mail" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <DialogField label="Telefoon" value={form.telefoonnummer} onChange={(v) => update("telefoonnummer", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <DialogField label="Bedrijfsnaam" value={form.bedrijfsnaam} onChange={(v) => update("bedrijfsnaam", v)} />
            <DialogField label="Adres" value={form.adres} onChange={(v) => update("adres", v)} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Extra informatie
            </label>
            <textarea
              rows={3}
              value={form.extra_informatie}
              onChange={(e) => update("extra_informatie", e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
              placeholder="Vertel kort waar je het voor wilt gebruiken…"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Versturen…" : "Aanvraag versturen →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DialogField({
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
