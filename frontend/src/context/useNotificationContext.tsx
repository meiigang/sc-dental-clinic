'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of a notification
interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: string;
  data: any;
  is_read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsReadInUI: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      // --- FIX: Use your custom JWT for authentication ---
      // 1. Check for the token in both localStorage and sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // 2. If no token is found, the user is not logged in. Stop.
      if (!token) {
        console.warn("[NotificationContext] No auth token found. User is not logged in.");
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // 3. If a token is found, proceed with the API call.
      try {
        const response = await fetch('/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }); 
        
        if (!response.ok) {
          console.error('[NotificationContext] Failed to fetch notifications:', response.status, response.statusText);
          return;
        }

        const data: Notification[] = await response.json();
        console.log("[NotificationContext] SUCCESS: Data received from backend:", data);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);

      } catch (error) {
        console.error("[NotificationContext] CRITICAL: The fetch call itself failed.", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }, []); // The dependency array is now empty as we no longer depend on the supabase client instance here.

  const markAllAsReadInUI = () => {
    setNotifications(currentNotifications => 
      currentNotifications.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const value = { notifications, unreadCount, markAllAsReadInUI };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}