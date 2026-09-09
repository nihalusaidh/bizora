import { createClient } from "@/lib/supabase/client";

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY || "",
    });
    return subscription;
  } catch {
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch {
    // silently fail
  }
}

export async function savePushSubscription(
  businessId: string,
  subscription: PushSubscription
): Promise<void> {
  const supabase = createClient();
  const endpoint = subscription.endpoint;
  const keys = subscription.toJSON().keys;

  await supabase.from("push_subscriptions").upsert({
    business_id: businessId,
    endpoint,
    p256dh: keys?.p256dh || "",
    auth: keys?.auth || "",
  });
}
