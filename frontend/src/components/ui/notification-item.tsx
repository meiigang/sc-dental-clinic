import { CheckCircle, XCircle, Clock, AlertTriangle, CalendarPlus } from 'lucide-react';

interface NotificationItemProps {
    type: string;
    data: any;
    is_read: boolean;
}

// Helper to format dates consistently
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
});

const NOTIFICATION_CONFIG = {
    APPOINTMENT_CONFIRMED: {
        icon: <CheckCircle className="h-6 w-6 text-white" />,
        bgColor: 'bg-green-500',
        containerClasses: 'bg-green-100 border-green-200',
        text: (data: any) => `Your appointment on ${formatDate(data.date)} has been confirmed.`
    },
    APPOINTMENT_CANCELLED: {
        icon: <XCircle className="h-6 w-6 text-white" />,
        bgColor: 'bg-red-500',
        containerClasses: 'bg-red-100 border-red-200',
        text: (data: any) => `Your appointment on ${formatDate(data.date)} has been cancelled.`
    },
    APPOINTMENT_RESCHEDULED: {
        icon: <Clock className="h-6 w-6 text-white" />,
        bgColor: 'bg-blue-500',
        containerClasses: 'bg-blue-100 border-blue-200',
        text: (data: any) => `The clinic has proposed a new time for your appointment: ${formatDate(data.date)}. Please review.`
    },
    APPOINTMENT_PENDING: {
        icon: <Clock className="h-6 w-6 text-white" />,
        bgColor: 'bg-yellow-500',
        containerClasses: 'bg-yellow-100 border-yellow-200',
        text: (data: any) => `Your appointment request for ${formatDate(data.date)} is pending approval.`
    },
    NEW_BOOKING_REQUEST: {
        icon: <CalendarPlus className="h-6 w-6 text-white" />,
        bgColor: 'bg-indigo-500',
        containerClasses: 'bg-indigo-100 border-indigo-200',
        text: (data: any) => `New booking request for ${formatDate(data.date)}.`
    },
    DEFAULT: {
        icon: <AlertTriangle className="h-6 w-6 text-white" />,
        bgColor: 'bg-gray-500',
        containerClasses: 'bg-gray-100 border-gray-200',
        text: (data: any) => `You have a new notification.`
    }
};

export function NotificationItem({ type, data, is_read }: NotificationItemProps) {
    const config = NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG] || NOTIFICATION_CONFIG.DEFAULT;

    return (
        <div className={`flex items-center p-4 rounded-lg border ${config.containerClasses} ${!is_read ? 'font-semibold' : 'opacity-70'}`}>
            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center mr-4`}>
                {config.icon}
            </div>
            <p>{config.text(data)}</p>
        </div>
    );
}