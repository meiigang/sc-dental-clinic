"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {CalendarArrowUp} from "lucide-react";


// Define the types needed for this component
const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;
type ApptStatus = typeof DB_STATUSES[number];

type Appt = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  service: string;
  price: number;
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

// Helper to convert 24h time string (e.g., "14:30") to 12h time label (e.g., "2:30PM")
const formatTimeLabel = (time24h: string | undefined): string => {
    if (!time24h) return "Time Slot";
    const [hh, mm] = time24h.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${mm.toString().padStart(2, "0")}${ampm}`;
}

export default function PatientAppointmentsTable() {
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appt | null>(null);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState<string>('09:00');

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

    const formatTimeOnly = (time: string | undefined) => {
    if (!time) return "-";
    const [hh, mm] = time.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${mm.toString().padStart(2, "0")}${ampm}`;
  }

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments]);

  // Handler to open the modal and set the selected appointment
  const handleRescheduleClick = (appt: Appt) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
    setNewDate(appt.date);
    setNewTime(appt.startTime || '09:00');
  }

  const handleSubmitReschedule = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAppointment) return;
      console.log(`Rescheduling appointment ID ${selectedAppointment.id} to Date: ${newDate}, Time: ${newTime}`);
      // Close modal and perform API call here in a real application
      setIsModalOpen(false);
  }

  // Memoized list of time slots for the dropdown, ensuring the current time is included
  const timeSlots = useMemo(() => {
    // --- UPDATED STANDARD SLOTS (9:00 to 16:30 in 30-minute intervals) ---
    const slots24h = [
        "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "12:00", "12:30", 
        "13:00", "13:30", "14:00", "14:30", 
        "15:00", "15:30", "16:00", "16:30", 
    ];

    const standardSlots = slots24h.map(value => ({ 
        value, 
        label: formatTimeLabel(value) 
    }));
    
    if (selectedAppointment && selectedAppointment.startTime) {
        const originalTimeValue = selectedAppointment.startTime;
        
        // Check if the original time is already in the standard slots by value
        const isStandardSlot = standardSlots.some(slot => slot.value === originalTimeValue);
        
        // If not a standard slot, dynamically add it to the top of the list
        if (!isStandardSlot) {
            const originalTimeLabel = formatTimeLabel(originalTimeValue) + ' (Current)';
            return [{ value: originalTimeValue, label: originalTimeLabel }, ...standardSlots];
        }
    }
    
    // If it is a standard slot, or no appointment is selected, return the standard list
    return standardSlots;
  }, [selectedAppointment]);

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
              <tr><td colSpan={5} className="text-center p-8">Loading your appointments...</td></tr>
            ) : sortedAppointments.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-8">You have no appointments scheduled.</td></tr>
            ) : (
              sortedAppointments.map(appt => (
                <tr key={appt.id} className="bg-white text-center border-b border-blue-accent">
                  <td className="p-3">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3">{formatDisplayTime(appt)}</td>
                  <td className="p-3">{appt.service}</td>
                  <td className="p-3">{appt.price}</td>
                  <td className="p-3">{appt.dentist}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(appt.status)}`}>
                      {formatStatusForDisplay(appt.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRescheduleClick(appt);
                          }}
                        >
                          <CalendarArrowUp className="w-4 h-4" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal Implementation --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl font-bold text-blue-dark">Reschedule Appointment</DialogTitle>
            </DialogHeader>

            {selectedAppointment && (
            <form onSubmit={handleSubmitReschedule}>
              <div className="flex flex-col md:flex-row gap-8 p-6">
                {/* Left Column: Calendar (Wider on mobile, 5/12 on desktop) */}
                <div className="md:w-5/12">
                    {/* Calendar Placeholder - In a real app, you would use <Calendar /> here */}
                    <div className="border border-gray-200 rounded-xl shadow-lg p-4 bg-white flex justify-center items-center h-full min-h-[300px]">
                        {/* Placeholder for shadcn Calendar component */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-blue-dark mb-2">Select New Date</h4>
                            {/* Simple date input to mimic selection for front-end logic */}
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

                {/* Right Column: Details and Form (5/12 on mobile, 7/12 on desktop) */}
                <div className="md:w-7/12 space-y-8 py-2">
                    
                    {/* Original Details (Read-only) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-dark">Original Appointment Details</h3>
                        
                        {/* Original Date */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm text-gray-600 font-medium">Date</label>
                            <input 
                                value={new Date(selectedAppointment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                                readOnly
                                className="col-span-2 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800"
                            />
                        </div>
                        
                        {/* Original Start/End Time */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm text-gray-600 font-medium">Time</label>
                            <div className="col-span-2 flex gap-2">
                                <input 
                                    value={formatTimeLabel(selectedAppointment.startTime)}
                                    readOnly
                                    className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 text-center"
                                />
                                <span className="text-gray-500 self-center">-</span>
                                <input 
                                    value={formatTimeLabel(selectedAppointment.endTime)}
                                    readOnly
                                    className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 text-center"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Reschedule Form (Inputs) */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold text-blue-dark">Rescheduled Appointment Details</h3>
                        
                        {/* New Date (Selected from Calendar Placeholder) */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="newDate" className="text-sm text-gray-600 font-medium">Date</label>
                            <input
                                id="newDate"
                                value={new Date(newDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                                readOnly
                                className="col-span-2 p-2 border border-blue-accent rounded-lg text-sm font-medium text-blue-dark bg-white"
                            />
                        </div>
                        
                        {/* New Time Selection (Uses dynamic list including current time) */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor="newTime" className="text-sm text-gray-600 font-medium">Time</label>
                            <select 
                                id="newTime"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="col-span-2 p-2 border border-blue-accent rounded-lg text-sm font-medium text-blue-dark appearance-none bg-white focus:ring-2 focus:ring-blue-500"
                            >
                                {/* 3. This maps over the dynamic list generated below */}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 bg-gray-50 p-6 border-t rounded-b-2xl">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
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
      {/* --- End Modal Implementation --- */}

    </div>
  );
}