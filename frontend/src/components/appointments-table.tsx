'use client'
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, Pencil, TriangleAlertIcon} from "lucide-react";
import { LogAppointment } from "./log-appointment-modal"
import { parseISO, isToday, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';

// --- FIX: Update the Appointment type to include staff and service duration ---
type Appointment = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending_approval" | "pending_reschedule" | "confirmed" | "completed" | "cancelled" | "no_show";
  patient: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  service: {
    id: number;
    service_name: string;
    price: number;
    estimated_duration: number; // Add this
  } | null;
  staff: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
};

// --- FIX: Define the list of manual actions separately ---
const MANUAL_STATUS_OPTIONS: Appointment['status'][] = ["confirmed", "completed", "cancelled", "no_show"];

const DB_STATUSES = ["confirmed", "completed", "cancelled", "no_show" ] as const;

const filterTypes = [
  "All",
  "Today",
  "This Week",
  "This Month"
];

const formatStatusForDisplay = (status: Appointment['status']) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// --- FIX: Create robust, timezone-aware date/time formatters ---
const TZ = "Asia/Manila"; // Set your target timezone

const formatDate = (isoString: string | null | undefined) => {
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

export function AppointmentsTable({ patientId, userRole }: { patientId?: string | number, userRole?: string }) {
  const [alertError, setAlertError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");
  const [sortOption, setSortOption] = useState("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- FIX: Add the missing state declaration for the active tab ---
  const [activeTab, setActiveTab] = useState<"reserved" | "booked" | "completed" | "cancelled">("reserved");
  
  // --- NEW: State for the time slot dropdown ---
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // --- NEW: State to track if a reschedule has been initiated in the modal ---
  const [isRescheduleTriggered, setIsRescheduleTriggered] = useState(false);

  const rowsPerPage = 10;
  
  // --- FIX: Define fetchAppointments outside of useEffect using useCallback ---
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      setIsLoading(false);
      return;
    }
    try {
      let url = "/api/appointments";
      if (patientId) {
        url += `?patientId=${patientId}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) setAlertError('Failed to fetch appointments');
      const allAppointments: Appointment[] = await response.json();
      setAppointments(allAppointments);
    } catch (error) {
      setAlertError("Could not load appointment data.");
    } finally {
      setIsLoading(false);
    }
  }, [patientId]); // Dependency array for useCallback

  // --- FIX: useEffect now calls the function defined above ---
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Dependency array for useEffect

  const reservedAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'pending_approval' || appt.status === 'pending_reschedule'),
    [appointments]
  );
  const bookedAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'confirmed'),
    [appointments]
  );
  const completedAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'completed'),
    [appointments]
  );
  const cancelledAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'cancelled' || appt.status === 'no_show'),
    [appointments]
  );
  
  const statusClass = (status: Appointment['status']) => {
    switch (status) {
      case "confirmed": return "text-green-700 bg-green-100";
      case "pending_approval":
      case "pending_reschedule": return "text-blue-800 bg-blue-100";
      case "completed": return "text-gray-900 bg-green-300";
      case "cancelled": return "text-red-700 bg-red-300";
      case "no_show": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  // Filter function
  const filterData = (data: Appointment[]) => {
    const today = new Date();
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

  // Sort function
  const sortData = (data: Appointment[]) => {
    return data.sort((a, b) => {
      if (sortOption === "latest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // Latest first (descending)
      } else // "oldest"  
        return new Date(a.date).getTime() - new Date(b.date).getTime(); // Oldest first (ascending)
    });
  };

  const currentData = useMemo(() => {
    if (activeTab === 'reserved') return reservedAppointments;
    if (activeTab === 'booked') return bookedAppointments;
    if (activeTab === 'completed') return completedAppointments;
    if (activeTab === 'cancelled') return cancelledAppointments;
    return [];
  }, [activeTab, reservedAppointments, bookedAppointments, completedAppointments, cancelledAppointments]);

  const filtered = useMemo(() => filterData(currentData), [currentData, filterOption]);
  const sortedAppointments = useMemo(() => {
    const nowZ = toZonedTime(new Date(), TZ);
    let filtered = currentData.filter(appt => {
        if (!appt.start_time) return false;
        const apptDate = toZonedTime(parseISO(appt.start_time), TZ);
        if (filterOption === "Today") return isToday(apptDate);
        if (filterOption === "This Week") return isWithinInterval(apptDate, { start: startOfWeek(nowZ), end: endOfWeek(nowZ) });
        if (filterOption === "This Month") return isWithinInterval(apptDate, { start: startOfMonth(nowZ), end: endOfMonth(nowZ) });
        return true; // "All"
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "Name") return (a.patient?.lastName || '').localeCompare(b.patient?.lastName || '');
      if (sortOption === "Status") return a.status.localeCompare(b.status);
      // Default sort by date
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  }, [currentData, filterOption, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / rowsPerPage));
  const pagedData = sortedAppointments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleRowClick = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsRescheduleTriggered(false); // Reset reschedule mode when modal opens
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAppointment) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    // --- DEBUG: Log the state and payload before sending ---
    console.log("--- Frontend: Preparing to Save ---");
    console.log("isRescheduleTriggered:", isRescheduleTriggered);
    const payload = {
        start_time: selectedAppointment.start_time,
        end_time: selectedAppointment.end_time,
        status: selectedAppointment.status,
    };
    console.log("Payload to be sent:", payload);

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // --- FIX: Read the body ONCE as text, then parse it ---
      const responseText = await response.text();
      console.log("Raw server response text:", responseText);

      // Now, parse the text we've already read.
      const data = JSON.parse(responseText);

      if (!response.ok) {
        // If the response was not ok, the parsed data contains the error message.
        throw new Error(data.message || 'An unknown error occurred.');
      }

      // If the response was ok, the parsed data is our success object.
      const { appointment: savedAppt } = data;
      
      setAppointments(prev => {
        const indexToUpdate = prev.findIndex(a => a.id === savedAppt.id);
        if (indexToUpdate === -1) return [savedAppt, ...prev];
        const newAppointments = [...prev];
        newAppointments[indexToUpdate] = savedAppt;
        return newAppointments;
      });

    } catch (error) {
      console.error("Error saving appointment:", error);
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleTabChange = (tab: "reserved" | "booked" | "completed" | "cancelled") => {
    setActiveTab(tab);
    setPage(1);
  };

  // --- NEW: useEffect to fetch available slots when date or selected appointment changes ---
  useEffect(() => {
    if (!isModalOpen || !selectedAppointment || !selectedAppointment.staff || !selectedAppointment.service) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const { staff, service, start_time, id: appointmentId } = selectedAppointment;
      const date = start_time.split('T')[0];
      
      // --- FIX: Always have the current time available immediately ---
      const currentTime = format(toZonedTime(parseISO(start_time), TZ), "HH:mm");
      setAvailableSlots([currentTime]); // Set the current time immediately

      try {
        const apiUrl = `/api/availability/staff-slots?staffId=${staff.id}&date=${date}&serviceDuration=${service.estimated_duration}&appointmentIdToIgnore=${appointmentId}`;
        
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch slots');
        const fetchedSlots = await response.json();
        
        // Combine and sort the lists, ensuring no duplicates
        const allSlots = [...new Set([currentTime, ...fetchedSlots])].sort();
        setAvailableSlots(allSlots);

      } catch (error) {
        console.error("Error fetching available slots:", error);
        // If fetch fails, at least keep the current time as an option
        setAvailableSlots([currentTime]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedAppointment?.start_time, selectedAppointment?.id, isModalOpen]);

  // --- NEW: useEffect to automatically update status when a reschedule is triggered ---
  useEffect(() => {
    if (isRescheduleTriggered && selectedAppointment) {
      // When a time/date change happens, automatically set the status in the state
      setSelectedAppointment(prev => prev ? { ...prev, status: 'pending_reschedule' } : null);
    }
  }, [isRescheduleTriggered]);


  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-10 sm:py-12 md:py-16 space-y-8">
      {alertError && (
        <Alert className="bg-destructive dark:bg-destructive/60 text-md text-white w-md mx-auto">
          <TriangleAlertIcon />
          <AlertTitle className="font-medium text-left">{alertError}</AlertTitle>
          <AlertDescription className="text-white/80">Please try reloading the page or relogging.</AlertDescription>
        </Alert>
      )}
      {/* --- Table --- */}
      <section className="w-full max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto bg-blue-light p-4 sm:p-6 md:p-8 rounded-2xl shadow-md">
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
        {/* Filter by time period (All, Today, This Week, This Month) */}
        <Select value={filterOption} onValueChange={(value) => setFilterOption(value as any)}>
          <SelectTrigger className="bg-white">
            <Filter /><SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {filterTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Sort by date */}
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="bg-white">
            <ArrowUpDown />
            <SelectValue placeholder="Sort by Date" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        </div>
        
        {/* --- TAB DROPDOWN (All Screens) --- */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="min-w-[230px] flex justify-between items-center">
                {activeTab === "reserved" && "Reserved Appointments"}
                {activeTab === "booked" && "Booked Appointments"}
                {activeTab === "completed" && "Completed Appointments"}
                {activeTab === "cancelled" && "Cancelled Appointments"}
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-[230px]">
              <DropdownMenuItem onClick={() => handleTabChange("reserved")}>
                Reserved Appointments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTabChange("booked")}>
                Booked Appointments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTabChange("completed")}>
                Completed Appointments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTabChange("cancelled")}>
                Cancelled Appointments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

    
        {/* --- TABLE RENDER --- */}
        <div className="overflow-x-auto overflow-hidden rounded-2xl">
            <table className="w-full min-w-[350vw] sm:min-w-[160vw] md:min-w-[120vw] lg:min-w-[120vw] xl:min-w-full text-sm sm:text-base border border-blue-accent">
            <thead>
              <tr className="bg-blue-accent text-blue-dark font-semibold">
                <th className="p-3 border border-blue-accent">Date</th>
                <th className="p-3 border border-blue-accent">Time</th>
                <th className="p-3 border border-blue-accent">Patient</th>
                <th className="p-3 border border-blue-accent">Service</th>
                <th className="p-3 border border-blue-accent">Price</th>
                <th className="p-3 border border-blue-accent">Status</th>
                <th className="p-3 border border-blue-accent">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((appt) => (
                <tr
                  key={appt.id}
                  className="text-center bg-white hover:bg-blue-100"
                >
                  {/* --- FIX: Use new formatters and data structure --- */}
                  <td className="p-3 border border-blue-accent">{formatDate(appt.start_time)}</td>
                  <td className="p-3 border border-blue-accent">{formatTimeRange(appt.start_time, appt.end_time)}</td>
                  <td className="p-3 border border-blue-accent">{`${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`}</td>
                  <td className="p-3 border border-blue-accent">{appt.service?.service_name || 'N/A'}</td>
                  <td className="p-3 border border-blue-accent">{`₱${appt.service?.price?.toFixed(2) || '0.00'}`}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={`px-2 py-0.5 rounded-md ${statusClass(appt.status)}`}>{formatStatusForDisplay(appt.status)}</span>
                  </td>
                  <td className="p-3 border border-blue-accent">
                    <div className="flex items-center justify-center gap-2">
                      {/* Reschedule/Edit */}
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(appt);
                        }}
                        className={`bg-blue-light text-blue-primary hover:bg-blue-primary/40 hover:text-blue-dark border border-blue-primary cursor-pointer ${appt.status === "completed" ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={appt.status === "completed"}
                        title={appt.status === "completed" ? "Completed appointments cannot be edited." : ""}
                      >
                        <Pencil />Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 gap-3">
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-blue-dark font-medium">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* --- FIX: Update Edit Modal to include time slot logic --- */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setSelectedAppointment(null); }}>
        <DialogContent
        className={`
          w-full 
          sm:max-w-[90vw]    /* small phones */
          md:max-w-[70vw]    /* tablets */
          lg:max-w-[50vw]    /* laptops */
          xl:max-w-[40vw]    /* large desktops / MacBook 15 inch */
          max-h-[80vh] 
          overflow-y-auto 
          p-6 
          space-y-4 
          rounded-2xl`}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-dark">Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-3">
              {/* --- FIX: Change grid to 3 columns to accommodate End Time --- */}
              {/* --- NEW: Add the read-only End Time field --- */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <Input
                    type="date"
                    value={selectedAppointment.start_time.split('T')[0]}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      // Keep the existing time part for now, the useEffect will fetch new slots.
                      const timePart = selectedAppointment.start_time.split('T')[1] || '00:00:00.000Z';
                      const newStartTime = `${newDate}T${timePart}`;
                      setSelectedAppointment({ ...selectedAppointment, start_time: newStartTime });
                      setIsRescheduleTriggered(true); // Trigger reschedule mode
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <Select
                    value={selectedAppointment.start_time ? format(toZonedTime(parseISO(selectedAppointment.start_time), TZ), "HH:mm") : undefined}
                    onValueChange={(newTime) => {
                      if (!newTime) return;
                      const datePart = selectedAppointment.start_time.split('T')[0];
                      const newStartTime = new Date(`${datePart}T${newTime}:00`).toISOString();
                      const duration = selectedAppointment.service?.estimated_duration || 60;
                      const newEndTime = new Date(new Date(newStartTime).getTime() + duration * 60000).toISOString();
                      setSelectedAppointment({ ...selectedAppointment, start_time: newStartTime, end_time: newEndTime });
                      setIsRescheduleTriggered(true); // Trigger reschedule mode
                    }}
                    disabled={isLoadingSlots}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingSlots ? "Loading..." : "Select a time"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? (
                        availableSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>
                            {format(parseISO(`1970-01-01T${slot}:00`), 'h:mm a')}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>No available slots</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <Input
                    readOnly
                    value={selectedAppointment.end_time ? format(toZonedTime(parseISO(selectedAppointment.end_time), TZ), "h:mm a") : 'N/A'}
                    className="bg-gray-100"
                  />
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <Input readOnly value={`${selectedAppointment.patient?.firstName || ''} ${selectedAppointment.patient?.lastName || ''}`} />
              
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <Input readOnly value={selectedAppointment.service?.service_name || ''} />

              <label className="block text-sm font-medium text-gray-700">Status</label>
              {/* --- FIX: The Select component now uses the new dynamic logic --- */}
              <Select
                value={
                  // For pending_approval, show placeholder. Otherwise, show the real status.
                  selectedAppointment.status === 'pending_approval'
                    ? undefined
                    : selectedAppointment.status
                }
                onValueChange={(newStatus) => {
                  if (!newStatus) return;
                  setSelectedAppointment({ ...selectedAppointment, status: newStatus as Appointment['status'] });
                }}
                // Disable the dropdown if a reschedule has been triggered
                disabled={isRescheduleTriggered}
              >
                {/* --- FIX: Conditionally apply styling to remove the background for pending_approval --- */}
                <SelectTrigger className={
                  selectedAppointment.status === 'pending_approval'
                    ? '' // Use default styling when showing the placeholder
                    : statusClass(selectedAppointment.status)
                }>
                  <SelectValue placeholder="Select an action..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Conditionally render the list of options */}
                  {isRescheduleTriggered ? (
                    <SelectItem value="pending_reschedule">Pending Reschedule</SelectItem>
                  ) : (
                    MANUAL_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>{formatStatusForDisplay(status)}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>       
            </div>
          )}
          <DialogFooter>
            <div className="flex justify-between w-full items-center">
              {/* Left-aligned: Cancel */}
              <div className="flex gap-2">
                <Button onClick={() => { setIsModalOpen(false); setSelectedAppointment(null); }} variant="outline">
                  Cancel
                </Button>
              </div>

              {/* Right-aligned: Primary actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsLogDialogOpen(true)}
                  disabled={userRole === "staff"}
                  className={userRole === "staff" ? "opacity-50 cursor-not-allowed" : ""}
                  title={userRole === "staff" ? "Staff cannot log appointments." : ""}
                >
                  Log Appointment
                </Button>
                <Button onClick={handleSave} className="bg-blue-primary hover:bg-blue-600 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- FIX: Pass selectedAppointment data to the LogAppointment modal --- */}
      <LogAppointment
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        appointment={selectedAppointment}
        onCancelLog={() => {
          setIsLogDialogOpen(false);
        }}
        onLogSuccess={() => {
          setIsLogDialogOpen(false);
          setIsModalOpen(false);
          fetchAppointments(); // Re-fetch appointments to show updated status
        }}
      />
    </main>
  )
}