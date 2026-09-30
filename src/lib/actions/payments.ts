"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { getUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/env";
import { portalHref } from "@/i18n/portal-routes";
import type { InvoiceRow } from "@/lib/supabase/types";

/**
 * « Payer en ligne » : crée une session Stripe Checkout pour une facture.
 * La facture est relue AVEC la session de l'utilisateur : la RLS garantit
 * qu'il a le droit de la voir (direction / comptabilité de l'organisation).
 * Le montant vient toujours de la base, jamais du navigateur.
 */
export async function payInvoice(formData: FormData) {
  const locale = formData.get("locale") === "en" ? "en" : "fr";
  const invoicesPage = portalHref("invoices", locale);
  const stripe = getStripe();
  const user = await getUser();
  if (!stripe || !user) redirect(`${invoicesPage}?paiement=indisponible`);

  const supabase = await createSessionClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, organization_id, number, amount_cents, currency, status")
    .eq("id", String(formData.get("invoiceId")))
    .maybeSingle();
  const invoice = data as Pick<InvoiceRow, "id" | "organization_id" | "number" | "amount_cents" | "currency" | "status"> | null;
  if (!invoice || !["a_payer", "en_retard"].includes(invoice.status) || invoice.amount_cents <= 0) {
    redirect(invoicesPage);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: locale === "en" ? "en" : "fr-CA",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: invoice.amount_cents,
          product_data: { name: `Bon Traiteur — ${locale === "en" ? "Invoice" : "Facture"} ${invoice.number}` },
        },
      },
    ],
    metadata: { invoice_id: invoice.id, organization_id: invoice.organization_id },
    payment_intent_data: { metadata: { invoice_id: invoice.id } },
    success_url: `${siteUrl()}${invoicesPage}?paiement=succes`,
    cancel_url: `${siteUrl()}${invoicesPage}?paiement=annule`,
  });

  redirect(session.url ?? invoicesPage);
}
