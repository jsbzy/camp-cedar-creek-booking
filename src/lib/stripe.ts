import Stripe from "stripe";

/**
 * Stripe is feature-flagged on STRIPE_SECRET_KEY. Until keys exist the app
 * keeps the direct-confirm demo flow; with keys set, bookings go through
 * Stripe Checkout and are confirmed by the webhook.
 */
export const isStripeEnabled = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY);

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set — check isStripeEnabled() first");
  }
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}
