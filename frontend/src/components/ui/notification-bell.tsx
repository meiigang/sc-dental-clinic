'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/context/useNotificationContext';

export function NotificationBell() {
    const { unreadCount } = useNotifications();

    return (
        <Link href="/notifications" className="relative flex items-center">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                </span>
            )}
        </Link>
    );
}