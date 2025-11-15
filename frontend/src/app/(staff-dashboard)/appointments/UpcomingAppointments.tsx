"use client";

import { useState, useEffect, useMemo } from "react"
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday, // --- FIX: Import isToday ---
  isWithinInterval, // --- FIX: Import isWithinInterval ---
  format,
} from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Filter, ArrowUpDown, TriangleAlertIcon, ArrowUpRight } from "lucide-react"
import { toZonedTime } from "date-fns-tz"

// Define the types needed for this component
const DB_STATUSES = [
  "pending_approval",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

// --- FIX: Update the Appt type to match the actual API response ---
type Appt = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  service: {
    service_name: string;
    price: number;
  };
  status:
    | "pending_approval"
    | "pending_reschedule"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";
};

// --- FIX: Create robust, timezone-aware date/time formatters ---
const TZ = "Asia/Manila"; // Set your target timezone

const formatDate = (isoString: string) => {
  if (!isoString) return "Invalid Date";
  const zonedDate = toZonedTime(parseISO(isoString), TZ);
  return format(zonedDate, "MMM dd, yyyy");
};

const formatTimeRange = (startIso: string, endIso: string) => {
  if (!startIso || !endIso) return "-";
  const formatSingleTime = (iso: string) => {
    const zonedDate = toZonedTime(parseISO(iso), TZ);
    return format(zonedDate, "h:mm a");
  };
  return `${formatSingleTime(startIso)} - ${formatSingleTime(endIso)}`;
};

export default function UpcomingAppointments() {
  const [alertError, setAlertError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("latest");
  const [filterOption, setFilterOption] = useState("Today");
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) setAlertError("Your appointment data failed to load.");

        // --- FIX: The fetched data now correctly matches the Appt type ---
        const upcomingAppointments: Appt[] = await response.json();
        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const formatStatusForDisplay = (status: Appt["status"]) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const statusClass = (status: Appt["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-700 bg-green-100 px-2 py-0.5 rounded-md";
      case "pending_approval":
      case "pending_reschedule":
        return "text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-md";
      case "completed":
        // --- FIX: Added a distinct style for completed for clarity ---
        return "text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md";
      case "no_show":
        return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md";
      case "cancelled":
        return "text-red-700 bg-red-100 px-2 py-0.5 rounded-md";
      default:
        return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md";
    }
  };

  const visibleAppointments = useMemo(() => {
    const nowZ = toZonedTime(new Date(), TZ);

    const todayStr = format(nowZ, "yyyy-MM-dd");
    const weekStartStr = format(startOfWeek(nowZ), "yyyy-MM-dd");
    const weekEndStr = format(endOfWeek(nowZ), "yyyy-MM-dd");
    const monthPrefix = format(nowZ, "yyyy-MM");

    const toDateOnlyStr = (a: Appt) => {
      // parse whatever the backend gives (date-only or full ISO), convert to Manila tz, then format date-only
      const parsed = parseISO(a.date);
      const zoned = toZonedTime(parsed, TZ);
      return format(zoned, "yyyy-MM-dd");
    };

    const inThisWeek = (a: Appt) => {
      const today = new Date();
      const weekLater = new Date(today);
      weekLater.setDate(today.getDate() + 7);
      const appointmentDate = new Date(a.date);
      return appointmentDate >= today && appointmentDate <= weekLater;
    };

    const isTodayAppt = (a: Appt) => toDateOnlyStr(a) === todayStr;

    let filtered = appointments.filter((a) => {
      if (filterOption === "Today") {
        return isTodayAppt(a);
      }
      if (filterOption === "This Week") {
        return inThisWeek(a);
      }
      return true;
    });

    // --- FIX: Sort using the correct 'start_time' property ---
    filtered.sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      if (sortOption === "latest") {
        return timeB - timeA; // Latest first (descending)
      } else { // "oldest"
        return timeA - timeB; // Oldest first (ascending)
      }
    });
    return filtered;
  }, [appointments, filterOption, sortOption]);
  return (
    <div>
      {alertError && (
        <Alert className="bg-destructive dark:bg-destructive/60 text-md text-white w-full mx-auto mt-4">
          <TriangleAlertIcon className="h-4 w-4" />
          <AlertTitle>{alertError}</AlertTitle>
          <AlertDescription className="text-white/80">Please try reloading the page or relogging.</AlertDescription>
        </Alert>
      )}
      <div className="w-full mx-auto bg-blue-light mt-4 p-6 rounded-2xl shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            {/* Filter by Time Period (this week, this month, all) */}
            <Select value={filterOption} onValueChange={(value) => setFilterOption(value as any)}>
              <SelectTrigger className="bg-white">
                <Filter />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort by date */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="bg-white">
                <ArrowUpDown />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/staff-dashboard/appointments">
            <Button><ArrowUpRight />View All Appointments</Button>
          </Link>
        </div>

      </div>
      <div className="overflow-x-auto">
        <div className="max-h-[480px] overflow-y-auto rounded-2xl border border-blue-accent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-accent text-blue-dark font-semibold sticky top-0">
                <th className="p-3 border border-blue-accent text-center">Date</th>
                <th className="p-3 border border-blue-accent text-center">Time</th>
                <th className="p-3 border border-blue-accent text-center">Patient</th>
                <th className="p-3 border border-blue-accent text-center">Service</th>
                <th className="p-3 border border-blue-accent text-center">Price</th>
                <th className="p-3 border border-blue-accent text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-4">Loading appointments...</td></tr>
              ) : visibleAppointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">No upcoming appointments found for the selected filter.</td></tr>
              ) : (
                visibleAppointments.map((appt) => (
                  <tr key={appt.id} className="bg-white text-center">
                    {/* --- FIX: Use the new formatters and correct data properties --- */}
                    <td className="p-3 border border-blue-accent">{formatDate(appt.start_time)}</td>
                    <td className="p-3 border border-blue-accent">{formatTimeRange(appt.start_time, appt.end_time)}</td>
                    <td className="p-3 border border-blue-accent">{`${appt.patient?.firstName ?? ''} ${appt.patient?.lastName ?? ''}`}</td>
                    <td className="p-3 border border-blue-accent">{appt.service?.service_name ?? 'N/A'}</td>
                    <td className="p-3 border border-blue-accent">{`₱${appt.service?.price?.toFixed(2) ?? '0.00'}`}</td>
                    <td className="p-3 border border-blue-accent">
                      <span className={statusClass(appt.status)}>
                        {formatStatusForDisplay(appt.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
