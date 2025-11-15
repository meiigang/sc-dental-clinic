"use client";

import { useEffect } from "react";
import { useNotifications } from "@/context/useNotificationContext";
import { NotificationItem } from "@/components/ui/notification-item";

export default function StaffNotifications() {
  const { notifications } = useNotifications();

  return (
    <main>
      <div className="notifs-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark mb-8">
          Notifications
        </h1>
        <div className="max-w-4xl w-full mx-auto space-y-4 px-4">
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
      </div>
    </main>
  );
}