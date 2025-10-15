"use client";

import { useState, useEffect, useMemo } from "react";

// Define the types needed for this component
const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;
type ApptStatus = typeof DB_STATUSES[number];

type Appt = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  service: string;
  dentist: string;
  status: ApptStatus;
};

// Helper to format DB status for display
const formatStatusForDisplay = (status: ApptStatus) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper for status color-coding
const statusClass = (status: ApptStatus) => {
  switch (status) {
    case "confirmed": return "text-green-700 bg-green-100";
    case "pending_approval": return "text-yellow-800 bg-yellow-100";
    case "completed": return "text-blue-700 bg-blue-100";
    case "no_show": return "text-gray-700 bg-gray-200";
    case "cancelled": return "text-red-700 bg-red-100";
    default: return "text-gray-700 bg-gray-100";
  }
};

export default function PatientAppointmentsTable() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:4000/api/appointments/my-appointments", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data: Appt[] = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
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

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments]);

  return (
    <div className="w-full bg-blue-light p-6 rounded-2xl shadow-md">
      <div className="max-h-[480px] overflow-y-auto rounded-lg border border-blue-accent">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Time</th>
              <th className="p-3 text-center">Service</th>
              <th className="p-3 text-center">Dentist</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center p-8">Loading your appointments...</td></tr>
            ) : sortedAppointments.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-8">You have no appointments scheduled.</td></tr>
            ) : (
              sortedAppointments.map(appt => (
                <tr key={appt.id} className="bg-white text-center border-b border-blue-accent">
                  <td className="p-3">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3">{formatDisplayTime(appt)}</td>
                  <td className="p-3">{appt.service}</td>
                  <td className="p-3">{appt.dentist}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(appt.status)}`}>
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
  );
}