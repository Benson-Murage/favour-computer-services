// Foundation for future Web Push. Wiring only — do not enable messaging yet.
// When ready, implement:
//   1. server: store subscription in `push_subscriptions` table
//   2. server: send via VAPID / provider of choice
//   3. client: call `subscribeToPush(vapidPublicKey)` after user gesture.

export type PushSupport =
  | { supported: false; reason: string }
  | { supported: true; permission: NotificationPermission };

export function detectPushSupport(): PushSupport {
  if (typeof window === "undefined") return { supported: false, reason: "ssr" };
  if (!("serviceWorker" in navigator)) return { supported: false, reason: "no-sw" };
  if (!("PushManager" in window)) return { supported: false, reason: "no-push" };
  if (!("Notification" in window)) return { supported: false, reason: "no-notification" };
  return { supported: true, permission: Notification.permission };
}

// Placeholder — call once VAPID keys and server endpoint exist.
export async function subscribeToPush(_vapidPublicKey: string): Promise<PushSubscription | null> {
  return null;
}
