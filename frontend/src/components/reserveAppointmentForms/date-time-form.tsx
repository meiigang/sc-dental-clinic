import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/useFormContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";

// FIX: Generate time slots as UTC strings
const timeSlots = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 15; // Start from 9:00 AM
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export default function DateTimeForm() {
  const { formValues, updateFormValues } = useFormContext<any>();
  const date = formValues.date ?? new Date();
  const selectedTime = formValues.selectedTime;

  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  // --- FIX: Add state for available workdays ---
  const [availableWorkdays, setAvailableWorkdays] = useState<number[]>([]);

  // --- FIX: Add useEffect to fetch available workdays ---
  useEffect(() => {
    const fetchAvailableWorkdays = async () => {
      try {
        const res = await fetch('/api/availability/available-workdays');
        if (!res.ok) throw new Error("Failed to fetch workdays");
        const data = await res.json();
        // Supabase DOW: 0=Sunday, 1=Monday...
        // JavaScript getDay(): 0=Sunday, 1=Monday...
        // The numbers match, so no conversion is needed.
        setAvailableWorkdays(data.availableDays);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAvailableWorkdays();
  }, []); // Runs only once on component mount

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const res = await fetch(`/api/availability/booked-dates?year=${year}&month=${month}`);
        if (!res.ok) throw new Error("Failed to fetch booked dates");
        const data = await res.json();
        // Ensure time part is stripped for accurate date comparison
        const dates = data.bookedDates.map((d: string) => {
            const dt = new Date(d);
            dt.setUTCHours(0, 0, 0, 0);
            return dt;
        });
        setBookedDates(dates);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBookedDates();
  }, [date]);

  useEffect(() => {
    if (!date) return;

    const fetchUnavailableSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        // NOTE: Using relative paths is better for production builds
        const res = await fetch(`/api/availability/unavailable-slots?date=${dateString}`);
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        setUnavailableSlots(data.unavailableSlots || []);
      } catch (error) {
        console.error(error);
        setUnavailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchUnavailableSlots();
  }, [date]);

  //disable past dates ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of today to make the whole day selectable

  // --- FIX: Define custom modifiers for styling ---
  const isBooked = (day: Date) => bookedDates.some(bookedDate => bookedDate.getTime() === day.getTime());

  const modifiers = {
    fullyBooked: (day: Date) => isBooked(day),
    //Update 'available' logic to check against workdays ---
    available: (day: Date) => {
      const dayOfWeek = day.getDay(); // 0 for Sunday, 1 for Monday, etc.
      return day >= today && !isBooked(day) && availableWorkdays.includes(dayOfWeek);
    },
  };

  const modifierClassNames = {
    // Style for fully booked dates (red background)
    fullyBooked: "bg-red-200 text-red-800 hover:bg-red-300 focus:bg-red-300 aria-selected:bg-red-400 aria-selected:text-white",
    // Style for available dates (green background)
    available: "bg-green-200 text-green-800 hover:bg-green-300 focus:bg-green-300 aria-selected:bg-green-400 aria-selected:text-white",
  };

  return (
    <div className="bg-blue-light rounded-xl p-12 overflow-x-auto">
      <p className="mb-4 text-xl font-bold text-blue-dark">Select Date and Preferred Time</p>
      <div className="flex items-start">
        <div className="bg-background rounded-lg p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={d => updateFormValues({ date: d, selectedTime: undefined })}
            defaultMonth={date}
            // Disable past dates and fully booked dates from being selected
            disabled={[{ before: today }, ...bookedDates]}
            showOutsideDays={false}
            // Apply the new modifiers and styles
            modifiers={modifiers}
            modifiersClassNames={modifierClassNames}
            className="p-0 [--cell-size:--spacing(10)]"
            formatters={{
              formatWeekdayName: date => date.toLocaleString('en-US', { weekday: 'short' })
            }}
          />
        </div>
        <div className="inset-y-0 gap-8 border-t h-90 md:w-48 md:border-t-0 md:border-l">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-6">
              {isLoadingSlots ? <p className="p-2 text-sm text-center">Loading...</p> :
                timeSlots.map(time => {
                  // `time` is a UTC-based string like "09:00".
                  // `unavailableSlots` from the backend is also a list of UTC-based strings.
                  const isBooked = unavailableSlots.includes(time);
                  
                  const [h, m] = time.split(":");
                  const hour = parseInt(h, 10);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  const formatted = `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;

                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => updateFormValues({ selectedTime: time })}
                      disabled={isBooked}
                      className="w-full shadow-none"
                    >
                      {formatted}
                    </Button>
                  );
                })}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t md:flex-row mt-6">
        <div className="flex items-center gap-2 text-sm">
          {date && selectedTime ? (
            <span>
              Your appointment reservation will be on{' '}
              <span className="font-medium">
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
              {' '}at <span className="font-medium">
                {selectedTime
                  ? (() => {
                      // --- FIX: Use the same simple formatting logic here ---
                      const [h, m] = selectedTime.split(":");
                      const hour = parseInt(h, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                      return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
                    })()
                  : ""}
              </span>.
            </span>
          ) : (
            <>Select a date and time for your reservation.</>
          )}
        </div>
      </div>
    </div>
  );
}