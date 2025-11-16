"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { CalendarArrowUp, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// 1. --- FIX: Add 'pending_reschedule' to the list of statuses ---
const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show", "pending_reschedule"] as const;
type ApptStatus = typeof DB_STATUSES[number];

// --- FIX: Add original_start_time to the Appt type ---
type Appt = {
  id: number;
  start_time: string;
  end_time: string;
  original_start_time?: string | null; // This can be null
  status: ApptStatus;
  service: { service_name: string; price: number; };
  staff: { first_name: string; last_name: string; };
};

// Helper to format DB status for display
const formatStatusForDisplay = (status: ApptStatus) => {
  // --- ADDITION: Handle the new status display ---
  if (status === 'pending_reschedule') return 'Pending Clinic Reschedule';
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper for status color-coding
const statusClass = (status: ApptStatus) => {
  switch (status) {
    case "confirmed": return "text-green-700 bg-green-100";
    // --- ADDITION: Add styling for the new status ---
    case "pending_reschedule": return "text-blue-800 bg-blue-100";
    case "pending_approval": return "text-yellow-800 bg-yellow-100";
    case "completed": return "text-blue-700 bg-blue-100";
    case "no_show": return "text-gray-700 bg-gray-200";
    case "cancelled": return "text-red-700 bg-red-100";
    default: return "text-gray-700 bg-gray-100";
  }
};

// --- FIX: Create robust, timezone-aware date/time formatters ---
const formatDate = (isoString: string | null | undefined) => {
  if (!isoString) return "Invalid Date";
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (isoString: string | null | undefined) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatTimeRange = (startIso: string, endIso: string) => {
  if (!startIso || !endIso) return "-";
  return `${formatTime(startIso)} - ${formatTime(endIso)}`;
};

export default function PatientAppointmentsTable() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the patient-initiated reschedule modal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appt | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('09:00');

  // --- NEW: State for the confirmation modal ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<Appt | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        // --- FIX: Use relative path for API calls ---
        const response = await fetch("/api/appointments/my-appointments", {
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

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [appointments]);

  // This handler opens the patient-initiated reschedule modal
  const handleRescheduleClick = (appt: Appt) => {
    setSelectedAppointment(appt);
    
    // --- FIX: Correctly initialize date/time state from the ISO string ---
    const apptDate = new Date(appt.start_time);
    // Format to YYYY-MM-DD for the <input type="date">
    const year = apptDate.getFullYear();
    const month = String(apptDate.getMonth() + 1).padStart(2, '0');
    const day = String(apptDate.getDate()).padStart(2, '0');
    setNewDate(`${year}-${month}-${day}`);

    // Format to HH:MM for the <select>
    const hours = String(apptDate.getHours()).padStart(2, '0');
    const minutes = String(apptDate.getMinutes()).padStart(2, '0');
    setNewTime(`${hours}:${minutes}`);

    setIsRescheduleModalOpen(true);
  }

  // --- FIX: Implement the actual API call for patient-initiated reschedule ---
  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !selectedAppointment.service) return;

    // Construct the new start time as an ISO string
    const newStartDateTime = new Date(`${newDate}T${newTime}:00`);
    
    // Calculate the duration of the original appointment in milliseconds
    const originalDuration = new Date(selectedAppointment.end_time).getTime() - new Date(selectedAppointment.start_time).getTime();
    
    // Calculate the new end time by adding the original duration to the new start time
    const newEndDateTime = new Date(newStartDateTime.getTime() + originalDuration);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
        const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                start_time: newStartDateTime.toISOString(),
                end_time: newEndDateTime.toISOString(),
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to request reschedule.');
        }

        const { appointment: updatedAppt } = await res.json();

        // Update the UI with the new 'pending_reschedule' status
        setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
        setIsRescheduleModalOpen(false);
        alert("Your reschedule request has been sent to the clinic for approval.");

    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
  }

  // 3. --- NEW: Handlers for confirming or declining a dentist-initiated reschedule ---
  const handleConfirmReschedule = async (appointmentId: number) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/confirm-reschedule`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to confirm.');
      const { appointment: updatedAppt } = await res.json();
      setAppointments(prev => prev.map(appt => appt.id === appointmentId ? updatedAppt : appt));
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  // --- FIX: This handler now CANCELS the appointment entirely ---
  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/decline-reschedule`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel appointment.');
      const { appointment: updatedAppt } = await res.json();
      setAppointments(prev => prev.map(appt => appt.id === appointmentId ? updatedAppt : appt));
      setIsConfirmModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const formatTimeLabel = (time24h: string) => {
    const date = new Date(`1970-01-01T${time24h}:00`);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // --- FIX: Dynamically generate time slots at 15-minute intervals ---
  const timeSlots = useMemo(() => {
    const slots = [];
    // Loop from 9 AM (9) to 5 PM (17)
    for (let h = 9; h <= 17; h++) {
      // Loop for each 15-minute interval in the hour
      for (let m = 0; m < 60; m += 15) {
        // Stop if we've gone past 5:00 PM
        if (h === 17 && m > 0) continue;

        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        const timeValue = `${hour}:${minute}`;
        slots.push({ value: timeValue, label: formatTimeLabel(timeValue) });
      }
    }
    return slots;
  }, []);


  return (
    <div className="w-full bg-blue-light p-6 rounded-2xl shadow-md">
      <div className="max-h-[480px] overflow-y-auto rounded-lg border border-blue-accent">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Time</th>
              <th className="p-3 text-center">Service</th>
              <th className="p-3 text-center">Price</th>
              <th className="p-3 text-center">Dentist</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-8">Loading your appointments...</td></tr>
            ) : sortedAppointments.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8">You have no appointments scheduled.</td></tr>
            ) : (
              sortedAppointments.map(appt => (
                <tr key={appt.id} className="bg-white text-center border-b border-blue-accent">
                  {/* --- FIX: Use the new timezone-aware formatters --- */}
                  <td className="p-3">{formatDate(appt.start_time)}</td>
                  <td className="p-3">{formatTimeRange(appt.start_time, appt.end_time)}</td>
                  {/* --- FIX: Use optional chaining for nested properties --- */}
                  <td className="p-3">{appt.service?.service_name ?? 'N/A'}</td>
                  <td className="p-3">{`₱${appt.service?.price ?? 0}`}</td>
                  <td className="p-3">{`Dr. ${appt.staff?.last_name ?? 'N/A'}`}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(appt.status)}`}>
                      {formatStatusForDisplay(appt.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* 4. --- NEW: Conditional UI for actions --- */}
                      {appt.status === 'pending_reschedule' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-dark text-blue-dark hover:bg-blue-100"
                          onClick={() => {
                            setAppointmentToConfirm(appt);
                            setIsConfirmModalOpen(true);
                          }}
                        >
                          Review Request
                        </Button>
                      ) : appt.status === 'confirmed' ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRescheduleClick(appt)}
                        >
                          <CalendarArrowUp className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Confirmation Modal for Dentist-Initiated Reschedule --- */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-4xl p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-dark">Reschedule Request</DialogTitle>
            <DialogDescription className="flex items-start gap-2 pt-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>The clinic has proposed a new time for your appointment. Please review and respond.</span>
            </DialogDescription>
          </DialogHeader>
          {appointmentToConfirm && (
            <div className="space-y-6 py-4">
              {/* Original Details */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-500 mb-2">Original Appointment</h4>
                {/* --- FIX: Use timezone-aware formatters --- */}
                <p className="text-lg text-gray-800">{formatDate(appointmentToConfirm.original_start_time)}</p>
                <p className="text-lg text-gray-800 font-light">{formatTime(appointmentToConfirm.original_start_time)}</p>
              </div>
              {/* New Proposed Details */}
              <div className="p-4 border-2 border-blue-accent rounded-lg bg-white">
                <h4 className="font-semibold text-blue-dark mb-2">New Proposed Time</h4>
                {/* --- FIX: Use timezone-aware formatters --- */}
                <p className="text-xl font-bold text-blue-dark">{formatDate(appointmentToConfirm.start_time)}</p>
                <p className="text-xl font-bold text-blue-dark">{formatTime(appointmentToConfirm.start_time)}</p>
              </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="destructive"
              onClick={() => appointmentToConfirm && handleCancelAppointment(appointmentToConfirm.id)}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Appointment
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!appointmentToConfirm) return;
                setIsConfirmModalOpen(false);
                handleRescheduleClick(appointmentToConfirm); // Open the other modal
              }}
            >
              <CalendarArrowUp className="mr-2 h-4 w-4" /> Request New Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- This is the existing modal for patient-initiated reschedules. It remains unchanged. --- */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-bold text-blue-dark">Reschedule Appointment</DialogTitle>
            </DialogHeader>

            {selectedAppointment && (
            <form onSubmit={handleSubmitReschedule}>
              <div className="flex flex-col md:flex-row gap-8 p-6">
                <div className="md:w-5/12">
                    <div className="border border-gray-200 rounded-xl shadow-lg p-4 bg-white flex justify-center items-center h-full min-h-[300px]">
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-blue-dark mb-2">Select New Date</h4>
                            <input 
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="p-2 border border-blue-accent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <p className="text-sm text-gray-500 mt-2">Selected: {new Date(newDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div className="md:w-7/12 space-y-8 py-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-dark">Original Appointment Details</h3>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm text-gray-600 font-medium">Date</label>
                            <input 
                                value={formatDate(selectedAppointment.start_time)}
                                readOnly
                                className="col-span-2 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm text-gray-600 font-medium">Time</label>
                            <div className="col-span-2 flex gap-2">
                                <input 
                                    value={formatTime(selectedAppointment.start_time)}
                                    readOnly
                                    className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 text-center"
                                />
                                <span className="text-gray-500 self-center">-</span>
                                <input 
                                    value={formatTime(selectedAppointment.end_time)}
                                    readOnly
                                    className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 text-center"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold text-blue-dark">Rescheduled Appointment Details</h3>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="newDate" className="text-sm text-gray-600 font-medium">Date</label>
                            <input
                                id="newDate"
                                value={formatDate(newDate)}
                                readOnly
                                className="col-span-2 p-2 border border-blue-accent rounded-lg text-sm font-medium text-blue-dark bg-white"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="newTime" className="text-sm text-gray-600 font-medium">Time</label>
                            <select 
                                id="newTime"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="col-span-2 p-2 border border-blue-accent rounded-lg text-sm font-medium text-blue-dark appearance-none bg-white focus:ring-2 focus:ring-blue-500"
                            >
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>
                                        {slot.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 bg-gray-50 p-6 border-t rounded-b-2xl">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsRescheduleModalOpen(false)}
                    className="rounded-full px-6 font-semibold"
                >
                  Cancel Appointment
                </Button>
                <Button 
                    type="submit" 
                    className="bg-blue-dark hover:bg-blue-700 text-white rounded-full px-6 font-semibold transition-colors"
                >
                    Request to Reschedule Appointment
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}