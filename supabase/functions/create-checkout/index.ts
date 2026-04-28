import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-03-31.basil",
});

// Prix créés dynamiquement au premier appel, puis mis en cache
let cachedPrices: { monthly: string; yearly: string } | null = null;

async function getOrCreatePrices() {
  if (cachedPrices) return cachedPrices;

  // Chercher le produit existant
  const products = await stripe.products.list({ limit: 10 });
  let product = products.data.find(p => p.metadata?.app === "spellio");

  if (!product) {
    product = await stripe.products.create({
      name: "Spellio Premium",
      description: "Accès à l'Histoire Magique et aux fonctionnalités premium",
      metadata: { app: "spellio" },
    });
  }

  // Chercher les prix existants
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  let monthlyPrice = prices.data.find(p => p.recurring?.interval === "month");
  let yearlyPrice = prices.data.find(p => p.recurring?.interval === "year");

  if (!monthlyPrice) {
    monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 399,
      currency: "eur",
      recurring: { interval: "month" },
      metadata: { plan: "monthly" },
    });
  }

  if (!yearlyPrice) {
    yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 3990,
      currency: "eur",
      recurring: { interval: "year" },
      metadata: { plan: "yearly" },
    });
  }

  cachedPrices = { monthly: monthlyPrice.id, yearly: yearlyPrice.id };
  return cachedPrices;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { plan, userId, email, returnUrl } = await req.json();

    if (!plan || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "plan, userId et email requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prices = await getOrCreatePrices();
    const priceId = plan === "yearly" ? prices.yearly : prices.monthly;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl || "https://spellio.org"}?payment=success`,
      cancel_url: `${returnUrl || "https://spellio.org"}?payment=cancel`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
