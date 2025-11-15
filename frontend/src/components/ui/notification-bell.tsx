'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/context/useNotificationContext';

interface NotificationBellProps {
  href: string;
}

export function NotificationBell({ href }: NotificationBellProps) {
    const { unreadCount } = useNotifications();

    return (
        <Link href={href} className="relative text-blue-light hover:text-white">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                </span>
            )}
        </Link>
    );
}