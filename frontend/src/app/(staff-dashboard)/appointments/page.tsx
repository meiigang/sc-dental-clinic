"use client";

import { useState, useMemo } from "react";
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
import { LogAppointment } from "./log-appointment";

type Appt = {
  date: string; // YYYY-MM-DD (we'll accept both human strings and iso)
  time?: string; // legacy single time text (kept if present)
  startTime?: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  patient: string;
  service: string;
  status: string; // Confirmed | Completed | Reserved | Cancelled | PendingAcknowledgment
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

  // ---------- initial mock data ----------
  const [bookedAppointments, setBookedAppointments] = useState<Appt[]>(
    [
      { date: "2025-10-01", time: "09:00 AM", patient: "Juan Dela Cruz", service: "Dental Cleaning", status: "Confirmed", startTime: "09:00", endTime: "09:30" },
      { date: "2025-10-02", time: "02:00 PM", patient: "Maria Santos", service: "Consultation", status: "Confirmed", startTime: "14:00", endTime: "14:30" },
      { date: "2025-10-03", time: "10:30 AM", patient: "Carlos Reyes", service: "Tooth Extraction", status: "Completed", startTime: "10:30", endTime: "11:30" },
      { date: "2025-10-04", time: "01:00 PM", patient: "Ana Cruz", service: "Whitening", status: "Confirmed", startTime: "13:00", endTime: "13:30" },
      { date: "2025-10-05", time: "11:00 AM", patient: "John Lim", service: "Cleaning", status: "Confirmed", startTime: "11:00", endTime: "11:30" },
      { date: "2025-10-06", time: "04:00 PM", patient: "Sofia Tan", service: "Consultation", status: "Completed", startTime: "16:00", endTime: "16:30" },
      { date: "2025-10-07", time: "10:00 AM", patient: "Leo Gomez", service: "Tooth Extraction", status: "Confirmed", startTime: "10:00", endTime: "11:00" },
      { date: "2025-10-08", time: "09:30 AM", patient: "Ella Cruz", service: "Cleaning", status: "Confirmed", startTime: "09:30", endTime: "10:00" },
      { date: "2025-10-09", time: "03:00 PM", patient: "Ben Ramos", service: "Whitening", status: "Completed", startTime: "15:00", endTime: "15:30" },
      { date: "2025-10-10", time: "01:00 PM", patient: "Clara Sy", service: "Consultation", status: "Confirmed", startTime: "13:00", endTime: "13:45" },
    ] as Appt[]
  );

  const [reservedAppointments, setReservedAppointments] = useState<Appt[]>(
    [
      { date: "2025-10-16", time: "01:00 PM", patient: "Ana Cruz", service: "Whitening", status: "Reserved" },
      { date: "2025-10-17", time: "03:00 PM", patient: "Mark dela Peña", service: "Check-up", status: "Reserved" },
      { date: "2025-10-18", time: "11:30 AM", patient: "Lia Tan", service: "Consultation", status: "Reserved" },
    ] as Appt[]
  );

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
    return appt.time ?? "-";
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "text-green-700 bg-green-100 px-2 py-0.5 rounded-md";
      case "Reserved":
        return "text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-md";
      case "Pending Approval":
        return "text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md";
      case "Completed":
        return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md";
      case "Cancelled":
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

  let startTime = appt.startTime;
  let endTime = appt.endTime;

  // If missing, try to parse from legacy time
  if (!startTime && appt.time) {
    startTime = parseLegacyTime(appt.time);
    // Default duration: 30 mins
    const [hh, mm] = startTime.split(":").map(Number);
    const endDate = new Date(0, 0, 0, hh, mm + 30);
    endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  }

  setSelectedAppointment({ ...appt, startTime, endTime, index: globalIndex, type });
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
  const handleSave = () => {
    if (!selectedAppointment) return;
    const { index, type, ...updated } = selectedAppointment;

    // Basic validation: if start/end present ensure end > start
    if (updated.startTime && updated.endTime) {
      const s = parseTimeToMinutes(updated.startTime);
      const e = parseTimeToMinutes(updated.endTime);
      if (e <= s) {
        alert("End time must be after start time.");
        return;
      }
    }

    if (type === "booked") {
      setBookedAppointments((prev) => replaceInArray(prev, index, updated as Appt));
    } else {
      setReservedAppointments((prev) => replaceInArray(prev, index, updated as Appt));
    }

    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // send notification -> set status to Pending Approval (stay in reserved table)
  const handleSendNotification = () => {
    if (!selectedAppointment) return;
    const { index, type, ...updated } = selectedAppointment;
    // mark Pending Approval
    const apptUpdated: Appt = { ...(updated as Appt), status: "Pending Approval" };

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
  const handleOverrideConfirm = () => {
    if (!selectedAppointment) return;
    const { index, type, ...updated } = selectedAppointment;
    const apptUpdated: Appt = { ...(updated as Appt), status: "Confirmed" };

    if (type === "reserved") {
      // remove from reserved global index and add to booked
      const reservedIdx = index;
      const copy = [...reservedAppointments];
      copy.splice(reservedIdx, 1);
      setReservedAppointments(copy);
      setBookedAppointments((prev) => [apptUpdated, ...prev]);
    } else {
      setBookedAppointments((prev) => replaceInArray(prev, index, apptUpdated));
    }

    // TODO: call backend to update status immediately if required
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // simulate patient acknowledgment: find the reserved appointment (global index in reservedAppointments), move to booked with Confirmed
  const handleSimulateAcknowledge = (visibleIndex: number) => {
    const globalIdx = (reservedPage - 1) * rowsPerPage + visibleIndex;
    const appt = reservedAppointments[globalIdx];
    if (!appt) return;
    const apptUpdated: Appt = { ...appt, status: "Confirmed" };
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
                  <span className={statusClass(appt.status)}>{appt.status}</span>
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
                  onClick={() => handleRowClick(appt, i, "reserved")}
                >
                  <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                  <td className="p-3 border border-blue-accent">{appt.patient}</td>
                  <td className="p-3 border border-blue-accent">{appt.service}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={statusClass(appt.status)}>{appt.status}</span>
                  </td>
                  <td className="p-3 border border-blue-accent">
                    {appt.status === "Pending Approval" ? (
                      <Button onClick={() => handleSimulateAcknowledge(i)} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                        Acknowledge (simulate)
                      </Button>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <Button onClick={(e) => { e.stopPropagation(); setSelectedAppointment({ ...appt, index: globalIdx, type: "reserved" }); setIsModalOpen(true); }} className="bg-blue-primary text-white px-3 py-1 rounded-full text-sm">Edit</Button>

                      </div>
                    )}
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
              <Select value={selectedAppointment.status} onValueChange={(v) => setSelectedAppointment({ ...selectedAppointment, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["Reserved", "Pending Approval", "Confirmed", "Completed", "Cancelled"].map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
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
