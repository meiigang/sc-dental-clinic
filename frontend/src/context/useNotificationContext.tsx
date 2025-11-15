'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Define the shape of a notification
interface Notification {
    id: number;
    type: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => void;
    markAllAsReadInUI: () => void;
    markOneAsRead: (id: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data: Notification[] = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const markAllAsReadInUI = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const markOneAsRead = (id: number) => {
        const notificationExists = notifications.some(n => n.id === id && !n.is_read);
        
        if (notificationExists) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAllAsReadInUI, markOneAsRead }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}