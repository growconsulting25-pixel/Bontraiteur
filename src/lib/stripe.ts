import "server-only";
import Stripe from "stripe";

/** Client Stripe, ou null tant que STRIPE_SECRET_KEY n'est pas configurée. */
let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
