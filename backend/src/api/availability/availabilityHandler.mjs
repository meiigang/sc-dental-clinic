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
            .eq('override_date', date);

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

        // 3. Get appointments that are already booked for that day.
        const requestedDateObj = new Date(date);
        const nextDayDateObj = new Date(requestedDateObj);
        nextDayDateObj.setDate(requestedDateObj.getDate() + 1);
        const nextDayString = nextDayDateObj.toISOString().split('T')[0];

        const { data: bookedAppointments, error: appointmentsError } = await req.supabase
            .from('appointments')
            .select('start_time, end_time')
            .gte('start_time', date) 
            .lt('start_time', nextDayString)
            .in('status', ['confirmed', 'pending_approval']);
        
        if (appointmentsError) throw appointmentsError;

        // 4. Calculate all unavailable slots.
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
        const { data, error } = await req.supabase
            .from('staff_weekly_availability')
            .select('day_of_the_week');

        if (error) throw error;

        const availableDays = [...new Set(data.map(item => item.day_of_the_week))];

        res.status(200).json({ availableDays });
    } catch (error) {
        console.error("Error fetching available workdays:", error);
        res.status(500).json({ message: "Failed to fetch available workdays." });
    }
}

// --- GET (for Staff Rescheduling) ---
// A new, more robust handler for getting available slots for a specific staff member on a specific day.
export async function getStaffAvailabilityForDate(req, res) {
    const { staffId, date, serviceDuration, appointmentIdToIgnore } = req.query;

    if (!staffId || !date || !serviceDuration) {
        return res.status(400).json({ message: "staffId, date, and serviceDuration are required." });
    }

    try {
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay(); // 0 (Sun) - 6 (Sat)
        const durationMinutes = parseInt(serviceDuration, 10);

        // 1. Determine the staff's working hours for the given date.
        let workingHours = null;
        const { data: override, error: overrideError } = await req.supabase
            .from('date_specific_hours_override')
            .select('start_time, end_time, is_unavailable')
            .eq('staff_id', staffId)
            .eq('override_date', date)
            .single();

        if (overrideError && overrideError.code !== 'PGRST116') throw overrideError; // Ignore 'no rows' error

        if (override) {
            if (override.is_unavailable) return res.status(200).json([]); // Day off
            workingHours = { start: override.start_time, end: override.end_time };
        } else {
            const { data: weekly, error: weeklyError } = await req.supabase
                .from('staff_weekly_availability')
                .select('start_time, end_time')
                .eq('staff_id', staffId)
                .eq('day_of_the_week', dayOfWeek)
                .single();
            
            if (weeklyError && weeklyError.code !== 'PGRST116') throw weeklyError;
            if (weekly) {
                workingHours = { start: weekly.start_time, end: weekly.end_time };
            }
        }

        if (!workingHours) return res.status(200).json([]); // Not scheduled to work

        // 2. Get all existing appointments for that staff on that day.
        const dayStart = `${date}T00:00:00.000Z`;
        const dayEnd = `${date}T23:59:59.999Z`;

        // --- FIX: Build the query first, then execute it ---
        let appointmentsQuery = req.supabase
            .from('appointments')
            .select('id, start_time, end_time')
            .eq('staff_id', staffId)
            .gte('start_time', dayStart)
            .lte('start_time', dayEnd)
            .in('status', ['confirmed', 'pending_approval', 'pending_reschedule']);

        if (appointmentIdToIgnore) {
            appointmentsQuery = appointmentsQuery.not('id', 'eq', appointmentIdToIgnore);
        }

        const { data: appointments, error: appointmentsError } = await appointmentsQuery;
        
        if (appointmentsError) throw appointmentsError;

        // 3. Generate all possible slots and filter out conflicts.
        const availableSlots = [];
        const slotStart = new Date(`${date}T${workingHours.start}`);
        const dayEndTime = new Date(`${date}T${workingHours.end}`);

        while (slotStart < dayEndTime) {
            const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
            if (slotEnd > dayEndTime) break;

            const isBooked = appointments.some(appt => {
                const apptStart = new Date(appt.start_time);
                const apptEnd = new Date(appt.end_time);
                // Check for overlap: (SlotStart < ApptEnd) and (SlotEnd > ApptStart)
                return slotStart < apptEnd && slotEnd > apptStart;
            });

            if (!isBooked) {
                availableSlots.push(slotStart.toTimeString().substring(0, 5)); // Format as HH:MM
            }

            slotStart.setMinutes(slotStart.getMinutes() + 15); // Move to the next 15-min interval
        }

        res.status(200).json(availableSlots);

    } catch (error) {
        console.error("Error fetching staff availability:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}

// --- GET (for Shared Availability) ---
// For fetching the shared availability of the dentist (assuming only one dentist's record)
export async function getSharedAvailabilityHandler(req, res) {
    try {
        // Find the dentist's staff record
        const { data: dentistStaff, error: staffError } = await req.supabase
            .from("staff")
            .select("id")
            .single(); // Only one dentist

        if (staffError || !dentistStaff) {
            return res.status(404).json({ message: "Dentist staff record not found." });
        }

        const staffId = dentistStaff.id;

        // Fetch weekly availability
        const { data: weekly, error: weeklyError } = await req.supabase
            .from("staff_weekly_availability")
            .select("*")
            .eq("staff_id", staffId);

        if (weeklyError) throw weeklyError;

        // Fetch date-specific overrides
        const { data: overrides, error: overrideError } = await req.supabase
            .from("date_specific_hours_override")
            .select("*")
            .eq("staff_id", staffId);

        if (overrideError) throw overrideError;

        res.status(200).json({ weekly, overrides });
    } catch (error) {
        console.error("Error fetching shared staff availability:", error);
        res.status(500).json({ message: "Failed to fetch shared staff availability.", error: error.message });
    }
}