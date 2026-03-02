// lib/paymob.ts

// These come from your .env file — never hardcode them here
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!;
const PAYMOB_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID!);
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET!;

// Paymob's base URL — all API calls go here
const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

// ─── Step 1: Get an auth token from Paymob ───────────────────────────────────
// Every time we want to do anything with Paymob, we first need to
// authenticate and get a short-lived token. This function does that.
async function getAuthToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Paymob auth failed: ${data.message}`);
  }

  return data.token;
}

// ─── Step 2: Register an order with Paymob ───────────────────────────────────
// Before charging a user, Paymob needs to know about the order.
// Amount is in the SMALLEST currency unit — so for EGP, it's piasters.
// 100 EGP = 10000 piasters. Always multiply by 100.
async function registerOrder(
  authToken: string,
  amountInPiasters: number,
  bookingId: string
): Promise<number> {
  const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false, // this is a digital product, no delivery
      amount_cents: amountInPiasters,
      currency: "EGP",
      merchant_order_id: bookingId, // ties the Paymob order to your booking
      items: [], // we keep this empty for simplicity
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Paymob order registration failed: ${data.message}`);
  }

  return data.id; // this is Paymob's order ID
}

// ─── Step 3: Get a payment key ────────────────────────────────────────────────
// This is the key that unlocks the payment iframe for a specific user.
// It expires in 1 hour.
async function getPaymentKey(
  authToken: string,
  paymobOrderId: number,
  amountInPiasters: number,
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }
): Promise<string> {
  const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountInPiasters,
      expiration: 3600, // 1 hour in seconds
      order_id: paymobOrderId,
      currency: "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
      billing_data: {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phone,
        // Paymob requires these fields but they don't apply to us
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "NA",
        state: "NA",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Paymob payment key failed: ${data.message}`);
  }

  return data.token;
}

// ─── Main function your app will actually call ────────────────────────────────
// This chains all 3 steps above and returns the iframe URL
// that you show to the user so they can enter their card details.
export async function createPaymobPayment({
  amountEGP,       // the price in Egyptian pounds e.g. 500
  bookingId,       // your internal booking ID
  user,            // the student paying
}: {
  amountEGP: number;
  bookingId: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}): Promise<string> {
  const amountInPiasters = amountEGP * 100;

  const authToken = await getAuthToken();
  const paymobOrderId = await registerOrder(authToken, amountInPiasters, bookingId);
  const paymentKey = await getPaymentKey(authToken, paymobOrderId, amountInPiasters, user);

  // This is the URL you redirect your user to for payment
  return `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
}

// ─── HMAC verification ────────────────────────────────────────────────────────
// When Paymob sends you a webhook (a notification that payment succeeded),
// you need to verify it's really from Paymob and not a scammer faking it.
// This function does that verification.
export function getHmacSecret(): string {
  return PAYMOB_HMAC_SECRET;
}