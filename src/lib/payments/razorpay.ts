import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface CreateOrderParams {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder(params: CreateOrderParams) {
  return razorpay.orders.create(params);
}

export interface CreateSubscriptionParams {
  plan_id: string;
  customer_notify: boolean;
  total_count: number;
  notes?: Record<string, string>;
}

export async function createSubscription(params: CreateSubscriptionParams) {
  return razorpay.subscriptions.create(params);
}

export async function cancelSubscription(subscriptionId: string) {
  return razorpay.subscriptions.cancel(subscriptionId);
}

export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpay_signature;
}

export async function createPlan(
  amount: number,
  interval: number,
  interval_count: number
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (razorpay.plans as any).create({
    amount,
    currency: "INR",
    interval: interval === 1 ? "monthly" : "yearly",
    interval_count,
    item: {
      name: `BIZORA Plan - ₹${amount / 100}`,
      description: "BIZORA Business Operating System",
    },
  });
}

export async function fetchSubscription(subscriptionId: string) {
  return razorpay.subscriptions.fetch(subscriptionId);
}
