"use client";

import { useNotifications } from "@/context/useNotificationContext";
import { NotificationItem } from "@/components/ui/notification-item";

export default function NotificationsPage() {
  const { notifications } = useNotifications();

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary-dark-blue">
        Notifications
      </h1>
      <div className="max-w-4xl mx-auto space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              type={notification.type}
              data={notification.data}
              is_read={notification.is_read}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            You have no notifications.
          </p>
        )}
      </div>
    </main>
  );
}