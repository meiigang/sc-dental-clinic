"use client";

import { useState, useEffect, useMemo } from "react";
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isWithinInterval,
} from "date-fns";
import { toZonedTime, format } from "date-fns-tz";

// --- FIX: Update the Appt type to match the actual API response ---
type Appt = {
  id: number;
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
  const [filterOption, setFilterOption] = useState("All");
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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
        if (!response.ok) throw new Error("Failed to fetch appointments");

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

    let filtered = appointments.filter((appt) => {
      // --- FIX: Use the correct 'start_time' property ---
      if (!appt.start_time) return false;
      const apptDate = toZonedTime(parseISO(appt.start_time), TZ);

      if (filterOption === "Today") return isToday(apptDate);
      if (filterOption === "This Week") {
        const weekStart = startOfWeek(nowZ);
        const weekEnd = endOfWeek(nowZ);
        return isWithinInterval(apptDate, { start: weekStart, end: weekEnd });
      }
      if (filterOption === "This Month") {
        const monthStart = startOfMonth(nowZ);
        const monthEnd = endOfMonth(nowZ);
        return isWithinInterval(apptDate, { start: monthStart, end: monthEnd });
      }
      return true; // "All"
    });

    // --- FIX: Sort using the correct 'start_time' property ---
    filtered.sort((a, b) => {
      const timeA = parseISO(a.start_time).getTime();
      const timeB = parseISO(b.start_time).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

    return filtered;
  }, [appointments, filterOption, sortAsc]);

  return (
    <div className="max-w-6xl mx-auto bg-blue-light p-6 rounded-3xl shadow-md">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-dark">Upcoming Appointments</h2>

        <div className="flex items-center gap-3">
          {/* Filter select: This Week, This Month, All */}
          <label className="text-sm text-gray-600">
            Filter:
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value as any)}
              className="ml-2 px-2 py-1 rounded-md border bg-blue-accent text-blue-dark text-sm"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="All">All</option>
            </select>
          </label>

          {/* Sort by date toggle */}
          <button
            onClick={() => setSortAsc((s) => !s)}
            className="ml-2 px-3 py-1 rounded-md border bg-white text-sm"
            aria-label="Toggle sort order"
          >
            Sort: Date {sortAsc ? "↑" : "↓"}
          </button>
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
