// --- PUT ---
// For a staff member to update their own availability.
export default async function updateAvailabilityHandler(req, res) {
    const userId = req.user?.id;
    if(!userId) {
        return res.status(401).json({message: "Unauthorized access."})
    }

    try {
        const { data: staffRecord, error: staffError } = await req.supabase
                .from("staff") 
                .select("id") 
                .eq("user_id", userId)
                .single();

        if (staffError || !staffRecord) throw new Error("Staff record not found for this user.");
    
        const staffId = staffRecord.id;
        const { weekly, overrides } = req.body;

        await req.supabase.from("staff_weekly_availability").delete().eq("staff_id", staffId);
        await req.supabase.from("date_specific_hours_override").delete().eq("staff_id", staffId);

        if (weekly && weekly.length > 0){
            const weeklyToInsert = weekly.map(item => ({...item, staff_id: staffId}));
            const {error: weeklyError} = await req.supabase.from("staff_weekly_availability").insert(weeklyToInsert);
            if (weeklyError) throw weeklyError;
        }
        
        if (overrides && overrides.length > 0) {
            const overridesToInsert = overrides.map(item => ({...item, staff_id: staffId}));
            const { error: overrideError } = await req.supabase.from("date_specific_hours_override").insert(overridesToInsert);
            if (overrideError) throw overrideError;
        }

        res.status(200).json({message:"Availability updated successfully."})
        
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Failed to update availability.", error: error.message });
    }
}

// --- GET (for Staff) ---
// For a logged-in staff member to get their own availability settings.
export async function getAvailabilityHandler(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    try {
        const { data: staffRecord, error: staffError } = await req.supabase
            .from("staff")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (staffError || !staffRecord) throw new Error("Staff record not found for this user.");
        const staffId = staffRecord.id;

        const { data: weekly, error: weeklyError } = await req.supabase
            .from("staff_weekly_availability")
            .select("*")
            .eq("staff_id", staffId);
        if (weeklyError) throw weeklyError;

        const { data: overrides, error: overrideError } = await req.supabase
            .from("date_specific_hours_override")
            .select("*")
            .eq("staff_id", staffId);
        if (overrideError) throw overrideError;

        res.status(200).json({ weekly, overrides });

    } catch (error) {
        console.error("Error fetching staff availability:", error);
        res.status(500).json({ message: "Failed to fetch availability.", error: error.message });
    }
}

// --- GET (for Patients) ---
// For a patient to get all unavailable time slots for a specific date.
export async function getUnavailableSlotsHandler(req, res) {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ message: "Date query parameter is required." });
    }

    try {
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();

        // 1. Check for a date-specific override for the given date.
        const { data: override, error: overrideError } = await req.supabase
            .from('date_specific_hours_override')
            .select('start_time, end_time, is_unavailable')
            .eq('override_date', date); // Use the correct 'override_date' column

        if (overrideError) throw overrideError;

        let availableSlots = [];

        if (override && override.length > 0) {
            // An override exists for this date.
            const dayOverride = override[0];
            if (!dayOverride.is_unavailable) {
                availableSlots.push({ start_time: dayOverride.start_time, end_time: dayOverride.end_time });
            }
        } else {
            // 2. No override found, so fall back to the general weekly availability.
            const { data: weekly, error: weeklyError } = await req.supabase
                .from('staff_weekly_availability')
                .select('start_time, end_time')
                .eq('day_of_the_week', dayOfWeek);
            
            if (weeklyError) throw weeklyError;
            if (weekly) {
                availableSlots = weekly;
            }
        }

        // --- FIX: Query appointments using a date range on the 'start_time' column ---
        // 3. Get appointments that are already booked for that day.
        const requestedDateObj = new Date(date);
        const nextDayDateObj = new Date(requestedDateObj);
        nextDayDateObj.setDate(requestedDateObj.getDate() + 1);
        const nextDayString = nextDayDateObj.toISOString().split('T')[0]; // e.g., '2025-11-19'

        const { data: bookedAppointments, error: appointmentsError } = await req.supabase
            .from('appointments')
            .select('start_time, end_time')
            // Filter where start_time is on or after the beginning of the requested date
            .gte('start_time', date) 
            // And where start_time is before the beginning of the next day
            .lt('start_time', nextDayString)
            .in('status', ['confirmed', 'pending_approval']);
        
        if (appointmentsError) throw appointmentsError;
        // --- END OF FIX ---

        // 4. Calculate all unavailable slots by combining the above information.
        const allPossibleSlots = Array.from({ length: 37 }, (_, i) => {
            const totalMinutes = 9 * 60 + i * 15;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        });

        const isSlotAvailable = (slot) => {
            return availableSlots.some(avail => slot >= avail.start_time && slot < avail.end_time);
        };

        const isSlotBooked = (slot) => {
            // Convert appointment start/end times to HH:MM format for comparison
            const clinicTimeZone = 'Asia/Manila';
            return bookedAppointments.some(appt => {
                const apptStart = new Date(appt.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone });
                const apptEnd = new Date(appt.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone });
                return slot >= apptStart && slot < apptEnd;
            });
        };

        const unavailableSlots = allPossibleSlots.filter(slot => !isSlotAvailable(slot) || isSlotBooked(slot));
        
        res.status(200).json({ unavailableSlots });

    } catch (error) {
        console.error("Error fetching unavailable slots:", error);
        res.status(500).json({ message: "Failed to fetch time slots.", error: error.message });
    }
}

// --- GET (for Patients) ---
// For a patient to see which dates in a month are fully booked.
export async function getBookedDatesHandler(req, res) {
    const p_month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const p_year = parseInt(req.query.year) || new Date().getFullYear();

    try {
        const { data, error } = await req.supabase.rpc('get_fully_booked_dates', {
            p_year,
            p_month
        });

        if (error) throw error;
        
        const bookedDates = data.map(item => item.booked_date);
        res.status(200).json({ bookedDates });

    } catch (error) {
        console.error("Error fetching booked dates:", error);
        res.status(500).json({ message: "Failed to fetch booked dates.", error: error.message });
    }
}

// For a patient to get the general days of the week the clinic is open.
export async function getAvailableWorkdaysHandler(req, res) {
    try {
        // --- FIX: Removed the incorrect .eq('is_available', true) filter ---
        const { data, error } = await req.supabase
            .from('staff_weekly_availability')
            .select('day_of_the_week');

        if (error) throw error;

        // Create a Set to get unique day numbers, then convert back to an array
        const availableDays = [...new Set(data.map(item => item.day_of_the_week))];

        res.status(200).json({ availableDays });
    } catch (error) {
        console.error("Error fetching available workdays:", error);
        res.status(500).json({ message: "Failed to fetch available workdays." });
    }
}