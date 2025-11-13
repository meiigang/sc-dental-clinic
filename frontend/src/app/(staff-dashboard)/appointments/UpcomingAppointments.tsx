"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUpDown } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isToday,
  startOfMonth,
  endOfMonth,
} from "date-fns";

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
  status: typeof DB_STATUSES[number];
};

export default function UpcomingAppointments() {
  const [filterOption, setFilterOption] = useState("All");
  const [sortOption, setSortOption] = useState("Date");
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from the backend when the component mounts
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

  // Helper function to format time for display
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

  // Memoized function to filter and sort the appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Apply filter
    const now = new Date();
    if (filterOption === "This Week") {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      filtered = filtered.filter((a) =>
        isWithinInterval(new Date(a.date), { start, end })
      );
    } else if (filterOption === "Today") {
      filtered = filtered.filter((a) => isToday(new Date(a.date)));
    } else if (filterOption === "This Month") {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      filtered = filtered.filter((a) =>
        isWithinInterval(new Date(a.date), { start, end })
      );
    }

    // Apply sort
    if (sortOption === "Date") {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortOption === "Name") {
      filtered.sort((a, b) => a.patient.localeCompare(b.patient));
    } else if (sortOption === "Service") {
      filtered.sort((a, b) => a.service.localeCompare(b.service));
    }

    return filtered;
  }, [appointments, filterOption, sortOption]);

  return (
    <div className="max-w-6xl mx-auto bg-blue-light p-6 rounded-3xl shadow-md">
      {/* Header + Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-dark">
          Upcoming Appointments
        </h2>

        <div className="flex gap-4">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6">
                <Filter className="h-4 w-4" />
                {filterOption}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterOption("This Week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("Today")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("This Month")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("All")}>
                All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6">
                <ArrowUpDown className="h-4 w-4" />
                Sort by {sortOption}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("Date")}>
                Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("Service")}>
                Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table with Scroll Limit */}
      <div className="overflow-x-auto">
        <div className="max-h-[480px] overflow-y-auto rounded-2xl border border-blue-accent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-accent text-blue-dark font-semibold sticky top-0">
                <th className="p-3 border border-blue-accent text-center">
                  Date
                </th>
                <th className="p-3 border border-blue-accent text-center">
                  Time
                </th>
                <th className="p-3 border border-blue-accent text-center">
                  Patient
                </th>
                <th className="p-3 border border-blue-accent text-center">
                  Service
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAndSortedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    No upcoming appointments found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedAppointments.map((appt) => (
                  <tr key={appt.id} className="bg-white text-center">
                    <td className="p-3 border border-blue-accent">
                      {new Date(appt.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 border border-blue-accent">
                      {formatDisplayTime(appt)}
                    </td>
                    <td className="p-3 border border-blue-accent">
                      {appt.patient}
                    </td>
                    <td className="p-3 border border-blue-accent">
                      {appt.service}
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
