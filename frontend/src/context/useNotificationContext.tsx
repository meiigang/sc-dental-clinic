'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  markAllAsReadInUI: () => void; // <-- Add this function type
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Ensure user is logged in before fetching
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return; // Stop if no user
      }

      try {
        // Fetch from your backend API endpoint.
        // This assumes your Next.js app can proxy requests to your Express backend.
        // You may need to configure rewrites in next.config.js or use the full backend URL.
        const response = await fetch('/api/notifications'); 
        
        if (!response.ok) {
          // Don't throw an error, just log it, so the app doesn't crash on a failed poll
          console.error('Failed to fetch notifications:', response.statusText);
          return;
        }

        const data: Notification[] = await response.json();
        
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);

      } catch (error) {
        console.error("Polling for notifications failed:", error);
      }
    };

    // 1. Fetch notifications immediately on component mount
    fetchNotifications();

    // 2. Set up an interval to poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000); // 30000 ms = 30 seconds

    // 3. Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [supabase]); // Re-run if the supabase client instance changes

  // NEW: Function to update the UI state directly
  const markAllAsReadInUI = () => {
    setNotifications(currentNotifications => 
      currentNotifications.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const value = { notifications, unreadCount, markAllAsReadInUI }; // <-- Add the new function to the context value

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