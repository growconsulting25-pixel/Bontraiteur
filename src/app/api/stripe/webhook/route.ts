import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Webhook Stripe : marque la facture « payée » quand le paiement est confirmé.
 * URL à déclarer dans Stripe : https://<site>/api/stripe/webhook
 * Événements : checkout.session.completed, checkout.session.async_payment_succeeded
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = getAdminSupabase();
  if (!stripe || !secret || !admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;
    if (invoiceId && session.payment_status === "paid") {
      const reference = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
      // Idempotent : ne met à jour qu'une facture pas encore payée.
      const { error } = await admin
        .from("invoices")
        .update({ status: "payee", paid_at: new Date().toISOString(), payment_reference: reference })
        .eq("id", invoiceId)
        .neq("status", "payee");
      if (error) {
        console.error("[stripe] Mise à jour de la facture impossible :", error.message);
        return NextResponse.json({ error: "db" }, { status: 500 }); // Stripe réessaiera
      }
    }
  }
  return NextResponse.json({ received: true });
}
