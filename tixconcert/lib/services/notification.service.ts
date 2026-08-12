import { getDBValue, mutate } from "@/lib/db";
import type { AppNotification } from "@/lib/types";
import { genId } from "@/lib/utils";

export function getUserNotifications(userId: string): AppNotification[] {
  return getDBValue()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(userId: string): number {
  if (!userId) return 0;
  return getDBValue().notifications.filter((n) => n.userId === userId && !n.read)
    .length;
}

export function markNotificationRead(id: string) {
  return mutate((db) => {
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  });
}

export function markAllNotificationsRead(userId: string) {
  return mutate((db) => {
    for (const n of db.notifications) {
      if (n.userId === userId) n.read = true;
    }
  });
}

export function deleteNotification(id: string) {
  return mutate((db) => {
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) db.notifications.splice(idx, 1);
  });
}

export function pushNotification(
  userId: string,
  data: { title: string; message: string; type: AppNotification["type"] }
) {
  return mutate((db) => {
    db.notifications.unshift({
      id: genId("ntf"),
      userId,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
}
