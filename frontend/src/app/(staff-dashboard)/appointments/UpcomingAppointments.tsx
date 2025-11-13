"use client";

import { useState, useEffect, useMemo } from "react";
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Define the types needed for this component
const DB_STATUSES = [
  "pending_approval",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

type Appt = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  patient: string;
  service: string;
  price?: number;
  status: typeof DB_STATUSES[number];
};

export default function UpcomingAppointments() {
  const [sortOption, setSortOption] = useState("Date");
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      try {
        // --- FIX: Use the correct relative path for the API call ---
        const response = await fetch("/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch appointments");

        const upcomingAppointments: Appt[] = await response.json();

        // The backend now sends only upcoming appointments, so no client-side filtering is needed here.
        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const formatDisplayTime = (appt: Appt) => {
    if (!appt.startTime || !appt.endTime) return "-";
    const to12 = (t: string) => {
      const [hh, mm] = t.split(":").map(Number);
      const ampm = hh >= 12 ? "PM" : "AM";
      const hour12 = hh % 12 === 0 ? 12 : hh % 12;
      return `${hour12}:${mm.toString().padStart(2, "0")} ${ampm}`;
    };
    return `${to12(appt.startTime)} - ${to12(appt.endTime)}`;
  };

  const formatStatusForDisplay = (status: Appt["status"]) => {
    switch (status) {
      case "pending_approval":
        return "Pending Approval";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "no_show":
        return "No Show";
      default:
        return "Unknown";
    }
  };

  const statusClass = (status: Appt["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-700 bg-green-100 px-2 py-0.5 rounded-md";
      case "pending_approval":
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

  // Apply filter and sort (date) to the confirmed appointments — use Asia/Manila timezone
  const visibleAppointments = useMemo(() => {
    const TZ = "Asia/Manila";
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

    const inThisMonth = (a: Appt) => {
      const d = toDateOnlyStr(a);
      return d.startsWith(monthPrefix);
    };

    const isTodayAppt = (a: Appt) => toDateOnlyStr(a) === todayStr;

    let filtered = appointments.filter((a) => {
      if (filterOption === "Today") return isTodayAppt(a);
      if (filterOption === "This Week") return inThisWeek(a);
      if (filterOption === "This Month") return inThisMonth(a);
      return true; // "All"
    });

    filtered.sort((a, b) => {
      const da = parseISO(a.date);
      const db = parseISO(b.date);
      const za = toZonedTime(da, TZ).getTime();
      const zb = toZonedTime(db, TZ).getTime();
      return sortAsc ? za - zb : zb - za;
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
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    Loading appointments...
                  </td>
                </tr>
              ) : visibleAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    No upcoming appointments found.
                  </td>
                </tr>
              ) : (
                visibleAppointments.map((appt) => (
                  <tr key={appt.id} className="bg-white text-center">
                    <td className="p-3 border border-blue-accent">
                      {new Date(appt.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border border-blue-accent">
                      {formatDisplayTime(appt)}
                    </td>
                    <td className="p-3 border border-blue-accent">{appt.patient}</td>
                    <td className="p-3 border border-blue-accent">{appt.service}</td>
                    <td className="p-3 border border-blue-accent">
                      {typeof appt.price === "number" ? appt.price.toFixed(2) : "-"}
                    </td>
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
