'use client'
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { TriangleAlertIcon } from "lucide-react";
import { format } from "date-fns";

// --- TYPE DEFINITIONS ---
type TimeSlot = { from: string; to: string };

// This is the structure your backend sends/receives for the weekly schedule
type WeeklySlot = {
  day_of_the_week: number;
  start_time: string;
  end_time: string;
};

// This is the structure your UI uses for the weekly schedule
type WeeklyAvailability = {
    [day: string]: TimeSlot[];
};

// This is the structure for overrides
type DateSlot = { date: Date; slots: TimeSlot[] };

// --- HELPER FUNCTIONS (Your existing helpers are great) ---
function formatDate(date: Date) {
    return format(date, "MMM d, yyyy");
}

const days = [
    { key: "SUN", label: "Sunday" }, { key: "MON", label: "Monday" }, { key: "TUE", label: "Tuesday" },
    { key: "WED", label: "Wednesday" }, { key: "THU", label: "Thursday" }, { key: "FRI", label: "Friday" },
    { key: "SAT", label: "Saturday" },
];

const dayKeyToNumber: {[key: string]: number} = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
const numberToDayKey: { [key: number]: string } = { 0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT" };

const defaultTimes: WeeklyAvailability = { SUN: [], MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [] };

function isWeeklyAvailabilityEqual(a: WeeklyAvailability, b: WeeklyAvailability) {
  return Object.keys(a).every(day =>
    a[day].length === b[day].length &&
    a[day].every((slot, i) => slot.from === b[day][i]?.from && slot.to === b[day][i]?.to)
  );
}

function isDateSpecificEqual(a: DateSlot[], b: DateSlot[]) {
  if (a.length !== b.length) return false;
  const sortByDate = (arr: DateSlot[]) => [...arr].sort((x, y) => x.date.getTime() - y.date.getTime());
  const aa = sortByDate(a), bb = sortByDate(b);
  return aa.every((slot, i) =>
    slot.date.getTime() === bb[i].date.getTime() &&
    slot.slots.length === bb[i].slots.length &&
    slot.slots.every((s, j) => s.from === bb[i].slots[j].from && s.to === bb[i].slots[j].to)
  );
}

// --- COMPONENT ---
export default function AvailabilityInputs() {
  // State for alert errors
  const [alertError, setAlertError] = useState<string | null>(null);
  // States for the UI
  const [availability, setAvailability] = useState<WeeklyAvailability>({ ...defaultTimes });
  const [dateSpecific, setDateSpecific] = useState<DateSlot[]>([]);
  // States for dirty checking
  const [initialAvailability, setInitialAvailability] = useState<WeeklyAvailability>({ ...defaultTimes });
  const [initialDateSpecific, setInitialDateSpecific] = useState<DateSlot[]>([]);
  // UI control states
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateSlots, setDateSlots] = useState<TimeSlot[]>([{ from: "09:00", to: "17:00" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/availability", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch availability data.");
        
        const data = await response.json();

        // --- FIX: Create a deep copy to prevent mutation across renders ---
        // This creates a new object with new, empty arrays for each day.
        const newWeeklyData: WeeklyAvailability = Object.fromEntries(
          Object.keys(defaultTimes).map(day => [day, []])
        );
        // --- END OF FIX ---

        if (data.weekly) {
          data.weekly.forEach((item: WeeklySlot) => {
            const dayKey = numberToDayKey[item.day_of_the_week];
            if (dayKey) {
              newWeeklyData[dayKey].push({ from: item.start_time, to: item.end_time });
            }
          });
        }

        const newOverridesData = data.overrides ? data.overrides.map((item: any) => {
          const [year, month, day] = item.override_date.split('-').map(Number);
          return {
            date: new Date(year, month - 1, day),
            slots: item.is_unavailable ? [] : [{ from: item.start_time, to: item.end_time }]
          };
        }) : [];

        setAvailability(newWeeklyData);
        setDateSpecific(newOverridesData);
        setInitialAvailability(newWeeklyData);
        setInitialDateSpecific(newOverridesData);

      } catch (error) {
        setAlertError("Your availability data failed to load.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  // Dirty state calculation (your existing logic is correct)
  const isDirty =
    !isWeeklyAvailabilityEqual(availability, initialAvailability) ||
    !isDateSpecificEqual(dateSpecific, initialDateSpecific);

  // Backend call to save data (your existing logic is correct)
  const handleSaveAvailability = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token){
      alert("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    const weeklyPayload = Object.entries(availability)
      .flatMap(([dayKey, slots]) => 
        slots.map(slot => ({
          day_of_the_week: dayKeyToNumber[dayKey],
          start_time: slot.from,
          end_time: slot.to,
        }))
      );

    const overridesPayload = dateSpecific.map( ds => ({
      override_date: format(ds.date, "yyyy-MM-dd"),
      start_time: ds.slots[0]?.from || null,
      end_time: ds.slots[0]?.to || null,
      is_unavailable: ds.slots.length === 0,
    }));

    try {
      const response = await fetch("http://localhost:4000/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ weekly: weeklyPayload, overrides: overridesPayload }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save availability.");
      }

      setInitialAvailability(availability);
      setInitialDateSpecific(dateSpecific);
      alert("Availability updated successfully!");

    } catch (error) {
      console.error("Error saving availability:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Handlers (Your existing handlers are correct) ---
  const handleApplyDateSlot = () => {
    if (!selectedDate) return;
    setDateSpecific(prev => [
      ...prev.filter(ds => format(ds.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")),
      { date: selectedDate, slots: [...dateSlots] }
    ]);
    setDateDialogOpen(false);
    setSelectedDate(undefined);
    setDateSlots([{ from: "09:00", to: "17:00" }]);
  };
  const handleRemoveDateSlot = (date: Date) => { setDateSpecific(prev => prev.filter(ds => format(ds.date, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd"))); };
  const handleAddDateSlot = () => { setDateSlots(prev => [...prev, { from: "09:00", to: "17:00" }]); };
  const handleRemoveDateSlotField = (idx: number) => { setDateSlots(prev => prev.filter((_, i) => i !== idx)); };
  const handleChangeDateSlot = (idx: number, field: "from" | "to", value: string) => { setDateSlots(prev => prev.map((slot, i) => i === idx ? { ...slot, [field]: value } : slot)); };
  const handleAddSlot = (day: string) => { setAvailability((prev) => ({ ...prev, [day]: [...prev[day], { from: "09:00", to: "17:00" }] })); };
  const handleRemoveSlot = (day: string, idx: number) => { setAvailability((prev) => ({ ...prev, [day]: prev[day].filter((_, i) => i !== idx) })); };
  const handleChange = (day: string, idx: number, field: "from" | "to", value: string) => { setAvailability((prev) => ({ ...prev, [day]: prev[day].map((slot, i) => i === idx ? { ...slot, [field]: value } : slot) })); };
  const getDayLabel = (key: string) => { if (key === "T2") return "T"; if (key === "S2") return "S"; return key; };

  // --- RENDER ---
  if (isLoading) {
    return <div className="text-center p-8">Loading your availability...</div>
  }

  return (
    <div>
      {alertError && (
        <Alert className="bg-destructive dark:bg-destructive/60 text-md text-white w-full mx-auto mt-4">
          <TriangleAlertIcon size={30} />
          <AlertTitle>{alertError}</AlertTitle>
          <AlertDescription className="text-white/80">Please try reloading the page or relogging.</AlertDescription>
        </Alert>
      )}
      <div className="bg-blue-light p-8 rounded-2xl grid-cols-1 md:grid-cols-2 gap-24 mt-4 w-full h-full mx-auto grid shadow-md">
        {/* Weekly hours column */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-lg text-blue-dark">Weekly hours</span>
          </div>
          <span className="text-sm text-blue-primary">Set your usual weekly availability</span>
          <div className="flex flex-col gap-2 mt-4">
            {days.map((day, dIdx) => (
              <div
                key={day.key}
                className={`flex gap-4 ${availability[day.key].length > 1 ? 'items-start' : 'items-center'}`}
              >
                {/* Day label */}
                <span className="bg-blue-accent p-2 w-16 min-w-16 max-w-16 h-8 flex items-center justify-center shrink-0 rounded-lg font-medium text-blue-dark text-base select-none">
                  {getDayLabel(day.key)}
                </span>
                {/* Time slots or Unavailable */}
                {availability[day.key].length === 0 ? (
                  <span className="text-sm text-muted-foreground italic">Unavailable</span>
                ) : (
                  <div className="flex flex-1 flex-col gap-1">
                    {availability[day.key].map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.from}
                          onChange={e => handleChange(day.key, idx, "from", e.target.value)}
                          className="bg-background w-31"
                        />
                        <span className="mx-1">-</span>
                        <Input
                          type="time"
                          value={slot.to}
                          onChange={e => handleChange(day.key, idx, "to", e.target.value)}
                          className="bg-background w-31"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(day.key, idx)}
                          className="text-muted-foreground hover:bg-blue-accent hover:text-blue-dark"
                          aria-label="Remove time slot"
                        >
                          <X size={18} />
                        </Button>
                        {/* Only show + for last slot */}
                        {idx === availability[day.key].length - 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleAddSlot(day.key)}
                            className="text-blue-primary hover:bg-blue-accent hover:text-blue-dark"
                            aria-label="Add time slot"
                          >
                            <Plus size={18} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Add button if unavailable */}
                {availability[day.key].length === 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddSlot(day.key)}
                    className="text-blue-primary hover:bg-blue-accent hover:text-blue-dark"
                    aria-label="Add time slot"
                  >
                    <Plus size={18} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Date-specific hours column */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-lg text-blue-dark">Date-specific hours</span>
            {/* Add Availability Dialog */}
            <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="text-blue-primary border-blue-primary hover:bg-blue-100 hover:text-blue-dark px-3 py-1 h-8" onClick={() => setDateDialogOpen(true)}>
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-dark text-lg font-bold">Select the date you want to set specific hours</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-16">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setDateSlots([{ from: "09:00", to: "17:00" }]);
                      }}
                      className="rounded-md border"
                      initialFocus
                    />
                    {selectedDate && (
                      <div className="flex flex-col gap-2">
                        {dateSlots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={slot.from}
                              onChange={e => handleChangeDateSlot(idx, "from", e.target.value)}
                              className="w-31"
                            />
                            <span className="mx-1">-</span>
                            <Input
                              type="time"
                              value={slot.to}
                              onChange={e => handleChangeDateSlot(idx, "to", e.target.value)}
                              className="w-31"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveDateSlotField(idx)}
                              className="text-muted-foreground hover:text-blue-dark"
                              aria-label="Remove time slot"
                            >
                              <X size={18} />
                            </Button>
                            {/* Only show + for last slot */}
                            {idx === dateSlots.length - 1 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={handleAddDateSlot}
                                className="text-blue-primary hover:text-blue-dark"
                                aria-label="Add time slot"
                              >
                                <Plus size={18} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setDateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-primary text-white hover:bg-blue-dark"
                      onClick={handleApplyDateSlot}
                      disabled={!selectedDate}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <span className="text-sm text-blue-primary">Set availability for specific days</span>
          {/* List of date-specific hours */}
          <div className="mt-4 flex flex-col gap-2 grow">
            {dateSpecific.length === 0 && (
              <span className="text-sm text-muted-foreground italic">No date-specific hours set</span>
            )}
            {dateSpecific
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((ds, idx) => (
                <div key={idx} className="flex items-center gap-10 bg-muted rounded-lg px-4 py-2">
                  <span className="text-sm min-w-20">{formatDate(ds.date)}</span>
                  <div className="flex gap-2 flex-wrap">
                    {ds.slots.map((slot, sidx) => {
                      // Convert 'HH:mm' to 12-hour format with am/pm
                      const parseTime = (t: string) => {
                        const [h, m] = t.split(":");
                        const date = new Date();
                        date.setHours(Number(h), Number(m), 0, 0);
                        return format(date, "hh:mm a");
                      };
                      return (
                        <span key={sidx} className="bg-blue-accent text-blue-dark text-sm px-3 py-1 rounded">
                          {parseTime(slot.from)} – {parseTime(slot.to)}
                        </span>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveDateSlot(ds.date)}
                    className="ml-auto text-muted-foreground"
                    aria-label="Remove date-specific slot"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
          </div>
          {isDirty && (
            <div className="flex justify-end mt-8 gap-4">
              <Button
                variant="outline"
                className="text-blue-primary border-blue-primary hover:bg-blue-100 hover:text-blue-dark"
                onClick={() => {setShowCancelModal(true)}}
              >
                Discard changes
              </Button>
              <Button
                className="bg-blue-primary text-white hover:bg-blue-dark"
                onClick={handleSaveAvailability}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Update availability"}
              </Button>
            </div>
          )}
          {/* Cancel Confirmation Modal */}
          <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent className="w-2xl">
              <DialogHeader>
                <DialogTitle>Discard changes?</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to discard all unsaved changes?</div>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button variant="outline" className="hover:bg-gray-200" onClick={() => setShowCancelModal(false)}>
                  {"No, keep editing"}
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-700 text-white"
                  onClick={() => {
                    setAvailability(initialAvailability);
                    setDateSpecific(initialDateSpecific);
                    setShowCancelModal(false);
                  }}
                >
                  {"Yes, discard changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
