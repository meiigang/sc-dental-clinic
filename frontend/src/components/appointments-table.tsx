'use client'
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
import { TriangleAlertIcon } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, CalendarArrowUp, ChevronDown} from "lucide-react";
import { LogAppointment } from "./log-appointment-modal"

// Define  database statuses
const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;

// Define appointment type
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

const formatStatusForDisplay = (status: Appointment['status']) => {
  switch (status) {
    case "pending_approval": return "Pending Approval";
    case "confirmed": return "Confirmed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    case "no_show": return "No Show";
    default: return "Unknown";
  }
};

// --- FIX: Add patientId to the component's props ---
export function AppointmentsTable({ patientId }: { patientId?: string | number }) {
  const [alertError, setAlertError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("This Week");
  const [sortOption, setSortOption] = useState("Date");
  const [isLoading, setIsLoading] = useState(true);
  const [bookedPage, setBookedPage] = useState(1);
  const [reservedPage, setReservedPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<
    (Appointment & { index: number; type: "booked" | "reserved" | "completed" | "cancelled" }) | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reserved" | "booked" | "completed" | "cancelled">("reserved");
  const rowsPerPage = 10;
  
  // Fetch data from the backend when the component mounts or patientId changes
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      try {
        // --- FIX: Build the URL dynamically based on whether patientId is present ---
        let url = "/api/appointments";
        if (patientId) {
          url += `?patientId=${patientId}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // --- END OF FIX ---

        if (!response.ok) throw new Error('Failed to fetch appointments');
        const allAppointments: Appointment[] = await response.json();
        setAppointments(allAppointments);
      } catch (error) {
        console.error(error);
        setAlertError("Could not load appointment data.");
      }
    };
    fetchAppointments();
  }, [patientId]); // --- FIX: Add patientId to the dependency array ---

  // 1. Memoize appointments into their respective tab categories
  const reservedAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'pending_approval'),
    [appointments]
  );
  const bookedAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'confirmed'),
    [appointments]
  );
  const completedAppointments = useMemo(
    () => appointments.filter(appt => ['completed'].includes(appt.status)),
    [appointments]
  );
    const cancelledAppointments = useMemo(
    () => appointments.filter(appt => appt.status === 'cancelled','no_show'),
    [appointments]
  );
  
  // Helper function to display time into 12-hour format
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
    return [...data].sort((a, b) => {
      if (sortOption === "Name") return a.patient.localeCompare(b.patient);
      if (sortOption === "Status") return a.status.localeCompare(b.status);
      if (sortOption === "Date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });
  };

  // 2. Determine which dataset to use based on the active tab
  const currentData = useMemo(() => {
    if (activeTab === 'reserved') return reservedAppointments;
    if (activeTab === 'booked') return bookedAppointments;
    if (activeTab === 'completed') return completedAppointments;
    if (activeTab === 'cancelled') return cancelledAppointments;
    return [];
  }, [activeTab, reservedAppointments, bookedAppointments, completedAppointments, cancelledAppointments]);

  const filtered = useMemo(() => filterData(currentData), [currentData, filterOption]);
  const sortedAppointments = useMemo(
    () => sortData(filtered),
    [filtered, sortOption]
  );


  // 3. Update pagination to be based on the final sorted data
  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / rowsPerPage));
  const pagedData = sortedAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  
  const handleRowClick = (appt: Appointment, visibleIndex: number, type: "booked" | "reserved" | "completed" | "cancelled") => {
    const globalIndex = (page - 1) * rowsPerPage + visibleIndex;
    setSelectedAppointment({ ...appt, index: globalIndex, type });
    setIsModalOpen(true);
  };

  const replaceInArray = (arr: Appointment[], idx: number, updated: Appointment) => {
    const copy = [...arr];
    copy[idx] = updated;
    return copy;
  };

  // save changes (edit modal)
  const handleSave = async () => {
    if (!selectedAppointment) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    // --- FIX: Determine which endpoint to call ---
    const { id, date, startTime, endTime, status } = selectedAppointment;
    
    // Find the original appointment to compare against
    const originalAppointment = appointments.find(a => a.id === id);
    
    // Check if date or time has been changed
    const isRescheduled = originalAppointment && (
        originalAppointment.date !== date ||
        originalAppointment.startTime !== startTime ||
        originalAppointment.endTime !== endTime
    );

    let endpoint = `/api/appointments/${id}`;
    let payload: any = {};

    if (isRescheduled) {
        // If date/time changed, use the full update handler
        endpoint = `/api/appointments/${id}`;
        payload = {
            start_time: `${date}T${startTime}:00`,
            end_time: `${date}T${endTime}:00`,
            status: status,
        };
    } else {
        // If ONLY the status (or other minor details) changed, use the new status handler
        endpoint = `/api/appointments/${id}/status`;
        payload = { status: status };
    }
    // --- END OF FIX ---

    if (status === 'cancelled') {
      if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
        return;
      }
    }

    try {
      const response = await fetch(endpoint, { // Use the determined endpoint
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload) // Send the correct payload for the endpoint
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes');
      }

      const { appointment: savedAppt } = await response.json();

      // 2. Update the main appointments list. This will automatically refilter the tabs.
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

 const handleCompleteNow = async () => {
    if (!selectedAppointment) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    try {
      // --- FIX: Use relative path for API calls ---
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete appointment');
      }

      const { appointment: updatedAppt } = await response.json();

      // Update the main appointments list. This will automatically move the item to the 'Completed' tab.
      setAppointments(prev => {
        const indexToUpdate = prev.findIndex(a => a.id === updatedAppt.id);
        if (indexToUpdate === -1) return prev;
        const newAppointments = [...prev];
        newAppointments[indexToUpdate] = updatedAppt;
        return newAppointments;
      });

    } catch (error) {
      console.error("Error completing appointment:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
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
    const apptUpdated: Appointment = { ...(updated as Appointment), status: "pending_approval" };

    // Update the main list, which will cause the appointment to move to the correct tab
    setAppointments(prev => replaceInArray(prev, prev.findIndex(a => a.id === apptUpdated.id), apptUpdated));

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
      // --- FIX: Use relative path for API calls ---
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
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

      // Update the main appointments list. This will automatically move the item to the 'Booked' tab.
      setAppointments(prev => {
        const indexToUpdate = prev.findIndex(a => a.id === updatedAppt.id);
        if (indexToUpdate === -1) return prev; // Should not happen
        const newAppointments = [...prev];
        newAppointments[indexToUpdate] = updatedAppt;
        return newAppointments;
      });

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
    const globalIdx = (page - 1) * rowsPerPage + visibleIndex;
    const appt = sortedAppointments[globalIdx]; // Get from the currently visible sorted list
    if (!appt) return;
    const apptUpdated: Appointment = { ...appt, status: "confirmed" };
    
    // Update the main list
    setAppointments(prev => {
      const indexToUpdate = prev.findIndex(a => a.id === apptUpdated.id);
      if (indexToUpdate === -1) return prev;
      const newAppointments = [...prev];
      newAppointments[indexToUpdate] = apptUpdated;
      return newAppointments;
    });
    // TODO: notify backend that patient acknowledged
  };

  // opens Log Appointment dialog
  const handleLogAppointment = () => {
    setIsLogDialogOpen(true);
  };

  const handleTabChange = (tab: "reserved" | "booked" | "completed" | "cancelled") => {
    setActiveTab(tab);
    setPage(1); // Reset to the first page whenever a tab is changed
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-10 sm:py-12 md:py-16 lg:py-20 space-y-8">
      {alertError && (
        <Alert className='bg-destructive dark:bg-destructive/60 text-md text-white w-md mx-auto'>
          <TriangleAlertIcon />
          <AlertTitle className="font-medium text-left">Your appointment data failed to load.</AlertTitle>
          <AlertDescription className='text-white/80'>Please try reloading the page or relogging.</AlertDescription>
        </Alert>
      )}
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

      {/* --- Table --- */}
      <section className="w-full max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto bg-blue-light p-4 sm:p-6 md:p-8 rounded-2xl shadow-md">
        {/* --- TAB BUTTONS --- */}
        <div className="mb-6">
          {/* Large screens: show buttons */}
          <div className="hidden lg:flex gap-3 mb-6">
            <Button
              variant={activeTab === "reserved" ? "default" : "outline"}
              onClick={() => handleTabChange("reserved")}
            >
              Reserved Appointments
            </Button>
            <Button
              variant={activeTab === "booked" ? "default" : "outline"}
              onClick={() => handleTabChange("booked")}
            >
              Booked Appointments
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              onClick={() => handleTabChange("completed")}
            >
              Completed Appointments
            </Button>
            <Button
              variant={activeTab === "cancelled" ? "default" : "outline"}
              onClick={() => handleTabChange("cancelled")}
            >
              Cancelled Appointments
            </Button>
          </div>

          {/* Small screens: hamburger menu */}
          <div className="block lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full flex justify-between items-center">
                  {activeTab === "reserved" && "Reserved"}
                  {activeTab === "booked" && "Booked"}
                  {activeTab === "completed" && "Completed"}
                  {activeTab === "cancelled" && "Cancelled"}
                  <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
        </div>
    
        {/* --- TABLE RENDER --- */}
        <div className="overflow-x-auto">
            <table className="w-full min-w-[350vw] sm:min-w-[160vw] md:min-w-[120vw] lg:min-w-full xl:min-w-full text-sm sm:text-base border border-blue-accent rounded-2xl">
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
              {pagedData.map((appt, index) => (
                <tr
                  key={appt.id}
                  className="text-center bg-white hover:bg-blue-100 cursor-pointer"
                  onClick={() => handleRowClick(appt, index, activeTab)}
                >
                  <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                  <td className="p-3 border border-blue-accent">{appt.patient}</td>
                  <td className="p-3 border border-blue-accent">{appt.service}</td>
                  <td className="p-3 border border-blue-accent">{appt.price}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={statusClass(appt.status)}>{formatStatusForDisplay(appt.status)}</span>
                  </td>
                  <td className="p-3 border border-blue-accent">
                    <div className="flex items-center justify-center gap-2">
                      {/* Reschedule */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(appt, index, activeTab);
                        }}
                      >
                        <CalendarArrowUp className="w-4 h-4" />
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

      {/* --- Edit Modal (staff-only) --- */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setSelectedAppointment(null); }}>
        <DialogContent
        className="
          w-full 
          sm:max-w-[90vw]    /* small phones */
          md:max-w-[70vw]    /* tablets */
          lg:max-w-[50vw]    /* laptops */
          xl:max-w-[40vw]    /* large desktops / MacBook 15 inch */
          max-h-[80vh] 
          overflow-y-auto 
          p-6 
          space-y-4 
          rounded-2xl"
        >

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

              {/* New Status Dropdown inside the form */}
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Select
                value={selectedAppointment.status}
                onValueChange={(newStatus) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    status: newStatus as Appointment['status'],
                  })
                }
              >
                <SelectTrigger className={statusClass(selectedAppointment.status)}>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {DB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatusForDisplay(status)}
                    </SelectItem>
                  ))}
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
                <Button variant="secondary" onClick={handleLogAppointment}>
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
  )
}