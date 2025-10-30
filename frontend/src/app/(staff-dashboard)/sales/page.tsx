'use client'

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;

type Appointment = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  patient: string;
  service: string;
  price: number;
  status: typeof DB_STATUSES[number];
};

const formatDisplayTime = (appt: Appointment) => {
  if (!appt.startTime || !appt.endTime) return "-";
  const to12 = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${mm.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${to12(appt.startTime)} - ${to12(appt.endTime)}`;
};

const statusClass = (status: Appointment['status']) => {
  switch (status) {
    case "completed":
      return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md";
    default:
      return "text-gray-500";
  }
};

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<"Weekly" | "Monthly" | "Annually">("Weekly");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return console.error("No auth token found");
      try {
        const res = await fetch("http://localhost:4000/api/appointments", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data: Appointment[] = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        alert("Could not load appointment data.");
      }
    };
    fetchAppointments();
  }, []);

  // ✅ Filter only completed appointments
  const completedAppointments = useMemo(
    () => appointments.filter((appt) => appt.status === "completed"),
    [appointments]
  );

  // ✅ Time-based filtering by tab
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return completedAppointments.filter((appt) => {
      const apptDate = new Date(appt.date);
      if (activeTab === "Weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return apptDate >= weekAgo && apptDate <= now;
      }
      if (activeTab === "Monthly") {
        return (
          apptDate.getMonth() === now.getMonth() &&
          apptDate.getFullYear() === now.getFullYear()
        );
      }
      return true; // Annually (All)
    });
  }, [completedAppointments, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / rowsPerPage));
  const pagedData = filteredAppointments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleTabChange = (tab: "Weekly" | "Monthly" | "Annually") => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <main className="w-full">
      <section className="sales-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Sales (Completed Appointments)</h1>

        {/* Tabs */}
        <div className="flex gap-3 m-6">
          {["Weekly", "Monthly", "Annually"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => handleTabChange(tab as any)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Table */}
        <table className="w-full max-w-6xl text-sm sm:text-base border border-blue-accent rounded-2xl overflow-hidden shadow">
          <thead>
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 border border-blue-accent">Date</th>
              <th className="p-3 border border-blue-accent">Time</th>
              <th className="p-3 border border-blue-accent">Patient</th>
              <th className="p-3 border border-blue-accent">Service</th>
              <th className="p-3 border border-blue-accent">Price</th>
              <th className="p-3 border border-blue-accent">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length > 0 ? (
              pagedData.map((appt) => (
                <tr key={appt.id} className="text-center bg-white hover:bg-blue-100 transition-colors">
                  <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                  <td className="p-3 border border-blue-accent">{appt.patient}</td>
                  <td className="p-3 border border-blue-accent">{appt.service}</td>
                  <td className="p-3 border border-blue-accent">₱{appt.price.toLocaleString()}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={statusClass(appt.status)}>Completed</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No completed appointments for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-3 w-full max-w-6xl">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-blue-dark font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Summary Section */}
        <div className="tab-content mt-12 w-full max-w-6xl text-left">
          <h2 className="text-2xl font-semibold mb-4">
            {activeTab} Sales Overview
          </h2>
          <p className="text-gray-600">
            Showing only completed appointments ({activeTab.toLowerCase()} view).
          </p>
        </div>
      </section>
    </main>
  );
}
