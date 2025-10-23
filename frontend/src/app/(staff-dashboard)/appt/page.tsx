"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { LogAppointment } from "@/components/log-appointment-modal";

// Define  database statuses
const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;

//Define appointment type
type Appt = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  patient: string;
  service: string;
  status: typeof DB_STATUSES[number];
};

// --- NEW HELPER: To make DB statuses look nice in the UI ---
const formatStatusForDisplay = (status: Appt['status']) => {
  switch (status) {
    case "pending_approval": return "Pending Approval";
    case "confirmed": return "Confirmed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    case "no_show": return "No Show";
    default: return "Unknown";
  }
};

export default function AppointmentsPage() {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");
  const [sortOption, setSortOption] = useState("Date");
  const [bookedPage, setBookedPage] = useState(1);
  const [reservedPage, setReservedPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<
    (Appt & { index: number; type: "booked" | "reserved" }) | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;


  // ---------- initial data ----------
  const [bookedAppointments, setBookedAppointments] = useState<Appt[]>([]);
  const [reservedAppointments, setReservedAppointments] = useState<Appt[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/appointments", {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const allAppointments: Appt[] = await response.json();
        
        // Separate appointments based on correct database statuses
        const booked = allAppointments.filter(a => ['confirmed', 'completed', 'cancelled', 'no_show'].includes(a.status));
        const reserved = allAppointments.filter(a => a.status === 'pending_approval');

        setBookedAppointments(booked);
        setReservedAppointments(reserved);

      } catch (error) {
        console.error(error);
        alert("Could not load appointment data.");
      }
    };

    fetchAppointments();
  }, []);

  // ---------- helpers ----------
  const formatDisplayTime = (appt: Appt) => {
    if (appt.startTime && appt.endTime) {
      // convert "HH:MM" to 12-hour
      const to12 = (t: string) => {
        const [hh, mm] = t.split(":").map(Number);
        const ampm = hh >= 12 ? "PM" : "AM";
        const hour12 = hh % 12 === 0 ? 12 : hh % 12;
        const m = mm.toString().padStart(2, "0");
        return `${hour12}:${m} ${ampm}`;
      };
      return `${to12(appt.startTime)} - ${to12(appt.endTime)}`;
    }
    // FIX: The 'time' property does not exist. Return a placeholder if start/end times are missing.
    return "-";
  };

  const statusClass = (status: Appt['status']) => {
    // FIX: Use correct database statuses for styling
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

  // ---------- filter & sort ----------
  const filterData = (data: Appt[]) => {
    const today = new Date("2025-10-10");
    if (filterOption === "Today") return data.filter((d) => d.date === today.toISOString().split("T")[0]);
    if (filterOption === "This Week") {
      const weekLater = new Date(today);
      weekLater.setDate(today.getDate() + 7);
      return data.filter((d) => {
        const date = new Date(d.date);
        return date >= today && date <= weekLater;
      });
    }
    if (filterOption === "This Month") return data.filter((d) => new Date(d.date).getMonth() === today.getMonth());
    return data;
  };

  const sortData = (data: Appt[]) => {
    return [...data].sort((a, b) => {
      if (sortOption === "Name") return a.patient.localeCompare(b.patient);
      if (sortOption === "Status") return a.status.localeCompare(b.status);
      if (sortOption === "Date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });
  };

  // Helper: parse "09:00 AM" to "09:00"
const parseLegacyTime = (timeStr?: string) => {
  if (!timeStr) return "";
  const [time, period] = timeStr.split(" ");
  let [hh, mm] = time.split(":").map(Number);
  if (period === "PM" && hh !== 12) hh += 12;
  if (period === "AM" && hh === 12) hh = 0;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

  const bookedFilteredSorted = useMemo(() => sortData(filterData(bookedAppointments)), [bookedAppointments, filterOption, sortOption]);
  const reservedFilteredSorted = useMemo(() => sortData(filterData(reservedAppointments)), [reservedAppointments, filterOption, sortOption]);

  // pagination slices
  const bookedTotalPages = Math.max(1, Math.ceil(bookedFilteredSorted.length / rowsPerPage));
  const reservedTotalPages = Math.max(1, Math.ceil(reservedFilteredSorted.length / rowsPerPage));
  const bookedData = bookedFilteredSorted.slice((bookedPage - 1) * rowsPerPage, bookedPage * rowsPerPage);
  const reservedData = reservedFilteredSorted.slice((reservedPage - 1) * rowsPerPage, reservedPage * rowsPerPage);

  // ---------- actions ----------
  // compute global index for item clicked (so replacing works)
const handleRowClick = (appt: Appt, visibleIndex: number, type: "booked" | "reserved") => {
  const globalIndex =
    type === "booked"
      ? (bookedPage - 1) * rowsPerPage + visibleIndex
      : (reservedPage - 1) * rowsPerPage + visibleIndex;
  setSelectedAppointment({ ...appt, index: globalIndex, type });
  setIsModalOpen(true);
};

  const replaceInArray = (arr: Appt[], idx: number, updated: Appt) => {
    const copy = [...arr];
    copy[idx] = updated;
    return copy;
  };

  // move from reserved -> booked (on confirm)
  const moveReservedToBooked = (reservedIdx: number, updatedAppt: Appt) => {
    // remove from reserved list (global index)
    const copyReserved = [...reservedAppointments];
    copyReserved.splice(reservedIdx, 1);
    setReservedAppointments(copyReserved);

    // push to booked
    setBookedAppointments((prev) => [updatedAppt, ...prev]);
  };

  // save changes (edit modal)
  const handleSave = async () => {
    if (!selectedAppointment) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    // We only need the appointment data itself, not the old index or type
    const { index, type, ...updatedAppt } = selectedAppointment;

    try {
        // 1. Call the backend to save the changes
        const response = await fetch(`http://localhost:4000/api/appointments/${updatedAppt.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedAppt)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save changes');
        }

        const { appointment: savedAppt } = await response.json();

        // 2. Remove the appointment from BOTH lists using its ID.
        // This is safer and handles all cases.
        setBookedAppointments(prev => prev.filter(appt => appt.id !== savedAppt.id));
        setReservedAppointments(prev => prev.filter(appt => appt.id !== savedAppt.id));

        // 3. Add the saved appointment (returned from the backend) to the correct new list.
        if (savedAppt.status === 'pending_approval') {
            setReservedAppointments(prev => [savedAppt, ...prev]);
        } else {
            setBookedAppointments(prev => [savedAppt, ...prev]);
        }

    } catch (error) {
        console.error("Error saving appointment:", error);
        if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    }
  };

  // send notification -> set status to Pending Approval (stay in reserved table)
  const handleSendNotification = () => {
    if (!selectedAppointment) return;
    const { index, type, ...updated } = selectedAppointment;
    // mark PendingAcknowledgment
    const apptUpdated: Appt = { ...(updated as Appt), status: "pending_approval" };

    if (type === "reserved") {
      setReservedAppointments((prev) => replaceInArray(prev, index, apptUpdated));
    } else {
      // if staff tries sending on a booked appt, update in booked table
      setBookedAppointments((prev) => replaceInArray(prev, index, apptUpdated));
    }

    // TODO: call backend notify endpoint here
    // e.g. await api.post('/notify', { appt: apptUpdated })

    setIsModalOpen(false);
    setSelectedAppointment(null);
    alert("Notification sent (frontend simulation). Patient must acknowledge to finalize.");
  };

  // override & confirm now: move to booked (if from reserved) or mark confirmed (if booked)
  const handleOverrideConfirm = async () => {
    if (!selectedAppointment) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    try {
        const response = await fetch(`http://localhost:4000/api/appointments/${selectedAppointment.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // FIX: Send the correct 'confirmed' status to the backend
            body: JSON.stringify({ status: 'confirmed' })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to confirm appointment');
        }

        const { appointment: updatedAppt } = await response.json();

        // Update UI state after successful backend call
        const { index, type } = selectedAppointment;
        if (type === "reserved") {
            // Remove from reserved list
            const copy = [...reservedAppointments];
            copy.splice(index, 1);
            setReservedAppointments(copy);
            // Add to booked list
            setBookedAppointments((prev) => [{ ...updatedAppt, status: 'confirmed' }, ...prev]);
        } else {
            // Update in booked list
            setBookedAppointments((prev) => replaceInArray(prev, index, { ...updatedAppt, status: 'confirmed' }));
        }

    } catch (error) {
        console.error("Error confirming appointment:", error);
        if (error instanceof Error) {
            alert(`Error: ${error.message}`);
        } else {
            alert(`An unknown error occurred.`);
        }
    } finally {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    }
  };

  // simulate patient acknowledgment: find the reserved appointment (global index in reservedAppointments), move to booked with Confirmed
  const handleSimulateAcknowledge = (visibleIndex: number) => {
    const globalIdx = (reservedPage - 1) * rowsPerPage + visibleIndex;
    const appt = reservedAppointments[globalIdx];
    if (!appt) return;
    const apptUpdated: Appt = { ...appt, status: "confirmed" };
    moveReservedToBooked(globalIdx, apptUpdated);
    // TODO: notify backend that patient acknowledged
  };

  // opens Log Appointment dialog
  const handleLogAppointment = () => {
    setIsLogDialogOpen(true);
  };

  // helper to parse "HH:MM" to minutes
  const parseTimeToMinutes = (t?: string) => {
    if (!t) return 0;
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };

  // ---------- render ----------
  return (
    <main className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 py-8 space-y-16">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-dark text-center">Appointments</h1>

      {/* Filter + Sort */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6 py-2">
              <Filter className="h-4 w-4" /> {filterOption}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["All", "Today", "This Week", "This Month"].map((opt) => (
              <DropdownMenuItem key={opt} onClick={() => { setFilterOption(opt); setBookedPage(1); setReservedPage(1); }}>
                {opt}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-primary text-white flex items-center gap-2 rounded-full px-6 py-2">
              <ArrowUpDown className="h-4 w-4" /> Sort by {sortOption}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {["Date", "Name", "Status"].map((opt) => (
              <DropdownMenuItem key={opt} onClick={() => { setSortOption(opt); setBookedPage(1); setReservedPage(1); }}>
                {opt}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- Booked --- */}
      <section className="max-w-6xl mx-auto bg-blue-light p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-dark mb-4">Booked Appointments</h2>
        <table className="w-full text-sm sm:text-base border border-blue-accent rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 border border-blue-accent">Date</th>
              <th className="p-3 border border-blue-accent">Time</th>
              <th className="p-3 border border-blue-accent">Patient</th>
              <th className="p-3 border border-blue-accent">Service</th>
              <th className="p-3 border border-blue-accent">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookedData.map((appt, i) => (
              <tr
                key={i}
                className="text-center bg-white hover:bg-blue-100 cursor-pointer"
                onClick={() => handleRowClick(appt, i, "booked")}
              >
                <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                <td className="p-3 border border-blue-accent">{appt.patient}</td>
                <td className="p-3 border border-blue-accent">{appt.service}</td>
                <td className="p-3 border border-blue-accent">
                  <span className={statusClass(appt.status)}>{formatStatusForDisplay(appt.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-3">
          <Button variant="outline" size="icon" onClick={() => setBookedPage((p) => Math.max(1, p - 1))} disabled={bookedPage === 1} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-blue-dark font-medium">Page {bookedPage} of {bookedTotalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setBookedPage((p) => Math.min(bookedTotalPages, p + 1))} disabled={bookedPage === bookedTotalPages} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* --- Reserved --- */}
      <section className="max-w-6xl mx-auto bg-blue-light p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-dark mb-4">Reserved Appointments</h2>
        <table className="w-full text-sm sm:text-base border border-blue-accent rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 border border-blue-accent">Date</th>
              <th className="p-3 border border-blue-accent">Time</th>
              <th className="p-3 border border-blue-accent">Patient</th>
              <th className="p-3 border border-blue-accent">Service</th>
              <th className="p-3 border border-blue-accent">Status</th>
              <th className="p-3 border border-blue-accent">Action</th>
            </tr>
          </thead>
          <tbody>
            {reservedData.map((appt, i) => {
              const globalIdx = (reservedPage - 1) * rowsPerPage + i;
              return (
                <tr
                  key={i}
                  className="text-center bg-white hover:bg-blue-100 cursor-pointer"
                  // This onClick now handles everything for the row
                  onClick={() => handleRowClick(appt, i, "reserved")}
                >
                  <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                  <td className="p-3 border border-blue-accent">{appt.patient}</td>
                  <td className="p-3 border border-blue-accent">{appt.service}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={statusClass(appt.status)}>{formatStatusForDisplay(appt.status)}</span>
                  </td>
                  <td className="p-3 border border-blue-accent">
                    {/* FIX: Remove the specific onClick from the button. */}
                    {/* The button now acts as a visual indicator, and the row's onClick will handle opening the modal. */}
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                      Acknowledge
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-3">
          <Button variant="outline" size="icon" onClick={() => setReservedPage((p) => Math.max(1, p - 1))} disabled={reservedPage === 1} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-blue-dark font-medium">Page {reservedPage} of {reservedTotalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setReservedPage((p) => Math.min(reservedTotalPages, p + 1))} disabled={reservedPage === reservedTotalPages} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* --- Edit Modal (staff-only) --- */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setSelectedAppointment(null); }}>
        <DialogContent className="max-w-[50vw] max-h-[80vh] overflow-y-auto p-6 space-y-4 rounded-2xl">

          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-3">
              {/* Date */}
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <Input
                type="date"
                value={selectedAppointment.date}
                onChange={(e) => setSelectedAppointment({ ...selectedAppointment, date: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <Input
                    type="time"
                    value={selectedAppointment.startTime ?? ""}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <Input
                    type="time"
                    value={selectedAppointment.endTime ?? ""}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, endTime: e.target.value })}
                  />
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <Input value={selectedAppointment.patient} onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patient: e.target.value })} />

              <label className="block text-sm font-medium text-gray-700">Service</label>
              <Input value={selectedAppointment.service} onChange={(e) => setSelectedAppointment({ ...selectedAppointment, service: e.target.value })} />

              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Select 
                value={selectedAppointment.status} 
                onValueChange={(v: Appt['status']) => setSelectedAppointment({ ...selectedAppointment, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {/* FIX: Use the correct DB statuses for the dropdown */}
                  {DB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatusForDisplay(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-500">
                Tip: To require patient acknowledgement before finalizing, choose <strong>Send Notification</strong>. Or choose <strong>Override & Confirm Now</strong> to finalize immediately.
              </div>
              <Button onClick={handleLogAppointment}>Log Appointment</Button>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-blue-primary text-white">Save</Button>

              <Button onClick={() => { /* Send notification */ handleSendNotification(); }} className="bg-orange-500 text-white">
                Send Notification
              </Button>

              <Button onClick={() => { /* Override confirm now */ handleOverrideConfirm(); }} className="bg-green-600 text-white">
                Override & Confirm Now
              </Button>

              <Button onClick={() => { setIsModalOpen(false); setSelectedAppointment(null); }} variant="outline">Cancel</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Appointment Dialog */}
      <LogAppointment
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        // exits both modals
        onCancelLog={() => {
          setIsLogDialogOpen(false);
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
