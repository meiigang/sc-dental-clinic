'use client';

import { useNotifications } from '@/context/useNotificationContext';
import { NotificationItem } from '@/components/ui/notification-item';
import { useEffect } from 'react';

export default function NotificationsPage() {
    // Destructure the new function from the context
    const { notifications, markAllAsReadInUI } = useNotifications();

    // This effect now runs only ONCE when the component mounts
    useEffect(() => {
        const markAllOnBackend = async () => {
            // Find unread notifications from the current state
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            
            // If there's nothing to update, do nothing
            if (unreadIds.length === 0) return;

            try {
                // Send requests to mark them as read on the backend
                await Promise.all(
                    unreadIds.map(id => fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }))
                );

                // Manually update the UI state immediately without a re-fetch
                markAllAsReadInUI();

            } catch (error) {
                console.error("Failed to mark notifications as read:", error);
            }
        };

        // A small delay can be helpful to ensure the initial state is loaded
        const timer = setTimeout(markAllOnBackend, 500);
        return () => clearTimeout(timer);

    // The empty dependency array [] ensures this effect runs only once.
    }, []); 

    return (
        <main className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary-dark-blue">Notifications</h1>
            <div className="max-w-4xl mx-auto space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            type={notification.type}
                            data={notification.data}
                            is_read={notification.is_read}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-10">You have no notifications.</p>
                )}
            </div>
        </main>
    );
}