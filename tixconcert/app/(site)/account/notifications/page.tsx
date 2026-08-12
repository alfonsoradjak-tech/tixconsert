"use client";

import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDB } from "@/lib/db";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/services/notification.service";
import { relativeTime, cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

function iconFor(type: AppNotification["type"]) {
  switch (type) {
    case "success":
      return "bg-emerald-500/15 text-emerald-400";
    case "warning":
      return "bg-amber-500/15 text-amber-400";
    case "danger":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-neon-500/15 text-neon-400";
  }
}

export default function NotificationsPage() {
  useDB();
  const session = useAuthStore((s) => s.session);
  if (!session) return null;

  const notifications = getUserNotifications(session.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-black">
          Notifications
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
              {unread}
            </span>
          )}
        </h2>
        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllNotificationsRead(session.id)}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "flex items-start gap-3 p-4 transition-all",
                !n.read && "border-brand-500/40 bg-brand-500/[0.04]"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  iconFor(n.type)
                )}
              >
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{n.title}</p>
                  <span className="shrink-0 text-[10px] text-muted">
                    {relativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{n.message}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-[10px] font-bold uppercase tracking-wide text-brand-300 hover:underline"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-muted transition-colors hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={BellOff}
            title="No notifications"
            description="Pembaruan tentang tiket dan konser favoritmu akan muncul di sini."
          />
        </Card>
      )}
    </div>
  );
}
