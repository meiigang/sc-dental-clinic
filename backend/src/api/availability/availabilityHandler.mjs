//PUT REQUEST
export default async function updateAvailabilityHandler(req, res) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({message: "Unauthorized access."})
    }

    try { // FIX: The try block should start here
        //Look up staff ID from UUID
        const { data: staffRecord, error: staffError } = await req.supabase
                .from("staff") 
                .select("id") 
                .eq("user_id", userId)
                .single();

        if (staffError || !staffRecord) {
            throw new Error("Staff record not found for this user.");
        }
    
        const staffId = staffRecord.id;
        const { weekly, overrides } = req.body;

        //1. Delete all previous availability for staff member
        await req.supabase.from("staff_weekly_availability").delete().eq("staff_id", staffId);
        await req.supabase.from("date_specific_hours_override").delete().eq("staff_id", staffId);

        //2. Insert new weekly availability
        if (weekly && weekly.length > 0){
            const weeklyToInsert = weekly.map(item => ({...item, staff_id: staffId}));
            const {error: weeklyError} = await req.supabase.from("staff_weekly_availability").insert(weeklyToInsert);
            if (weeklyError) throw weeklyError;
        }
        
        //3. Insert new date-specific overrides
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

//GET REQUEST
export async function getAvailabilityHandler(req, res) {
    const userId =  req.user?.id;
    if (!userId){
        return res.status(401).json({message: "Unauthorized access."})
    }

    try {
        // --- FIX: Also need to look up the staff ID here ---
        const { data: staffRecord, error: staffError } = await req.supabase
            .from("staff")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (staffError || !staffRecord) {
            throw new Error("Staff record not found for this user.");
        }

        const staffId = staffRecord.id; // The correct bigint ID

        //1. Fetch weekly availability
        const { data: weekly, error: weeklyError } = await req.supabase
        .from("staff_weekly_availability")
        .select("day_of_the_week, start_time, end_time")
        .eq("staff_id", staffId); // Use the correct ID

        if (weeklyError) throw weeklyError;

        //2. Fetch date-specific overrides
        const { data: overrides, error: overridesError} = await req.supabase
        .from("date_specific_hours_override")
        .select("override_date, start_time, end_time, is_unavailable")
        .eq("staff_id", staffId) // Use the correct ID

        if (overridesError) throw overridesError;

        //3. Send datasets back to client
        res.status(200).json({weekly, overrides});

    } catch (error){
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "Failed to fetch availability.", error: error.message });
    }
}

// Handler to get fully booked dates for a given month
export async function getBookedDatesHandler(req, res) {
    // Get month and year from query params, default to current month/year
    const p_month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const p_year = parseInt(req.query.year) || new Date().getFullYear();

    try {
        // Call the Supabase RPC function
        const { data, error } = await req.supabase.rpc('get_fully_booked_dates', {
            p_year,
            p_month
        });

        if (error) throw error;

        // The RPC returns an array of objects like [{ booked_date: '2025-10-28' }]
        // We need to extract just the date strings.
        const bookedDates = data.map(item => item.booked_date);

        res.status(200).json({ bookedDates });

    } catch (error) {
        console.error("Error fetching booked dates:", error);
        res.status(500).json({ message: "Failed to fetch booked dates.", error: error.message });
    }
}


// REVISED: Handler to get unavailable time slots for a specific date
export async function getUnavailableSlotsHandler(req, res) {
    const { date } = req.query; // Expects date in 'YYYY-MM-DD' format
    if (!date) {
        return res.status(400).json({ message: "Date query parameter is required." });
    }

    try {
        const selectedDate = new Date(date + 'T00:00:00Z');
        const dayOfWeek = selectedDate.getUTCDay();

        // --- Step 1: Get all possible working slots for the given day ---
        const { data: weeklySlots, error: weeklyError } = await req.supabase
            .from('staff_weekly_availability')
            .select('start_time, end_time')
            .eq('day_of_the_week', dayOfWeek);

        if (weeklyError) throw weeklyError;
        
        // This creates a Set of all 15-minute slots the clinic is open, e.g., {'09:00', '09:15', ...}
        const openSlots = new Set();
        weeklySlots.forEach(slot => {
            const [startH, startM] = slot.start_time.split(':').map(Number);
            const [endH, endM] = slot.end_time.split(':').map(Number);
            
            let current = new Date();
            current.setUTCHours(startH, startM, 0, 0);
            const end = new Date();
            end.setUTCHours(endH, endM, 0, 0);

            while(current < end) {
                const hours = current.getUTCHours().toString().padStart(2, '0');
                const minutes = current.getUTCMinutes().toString().padStart(2, '0');
                openSlots.add(`${hours}:${minutes}`);
                current.setUTCMinutes(current.getUTCMinutes() + 15);
            }
        });

        // --- Step 2: Get all slots that are already booked ---
        const { data: appointments, error: apptError } = await req.supabase
            .from('appointments')
            .select('start_time, end_time')
            .gte('start_time', `${date}T00:00:00.000Z`)
            .lte('start_time', `${date}T23:59:59.999Z`);

        if (apptError) throw apptError;

        const bookedSlots = new Set();
        appointments.forEach(appt => {
            let current = new Date(appt.start_time);
            const end = new Date(appt.end_time);
            while (current < end) {
                const hours = current.getUTCHours().toString().padStart(2, '0');
                const minutes = current.getUTCMinutes().toString().padStart(2, '0');
                bookedSlots.add(`${hours}:${minutes}`);
                current.setUTCMinutes(current.getUTCMinutes() + 15);
            }
        });

        // --- Step 3: Determine unavailable slots ---
        // A slot is unavailable if it's NOT in the openSlots set OR it's in the bookedSlots set.
        // We will return a list of all slots that should be disabled.
        const allPossibleSlots = Array.from({ length: 48 }, (_, i) => { // 48 slots in a 12-hour day (9am-9pm)
            const totalMinutes = i * 15;
            const hour = Math.floor(totalMinutes / 60) + 9;
            const minute = totalMinutes % 60;
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        });

        const unavailableSlots = allPossibleSlots.filter(slot => {
            return !openSlots.has(slot) || bookedSlots.has(slot);
        });

        res.status(200).json({ unavailableSlots });

    } catch (error) {
        console.error("Error fetching unavailable slots:", error);
        res.status(500).json({ message: "Failed to fetch time slots.", error: error.message });
    }
}