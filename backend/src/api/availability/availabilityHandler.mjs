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
        const { data, error } = await req.supabase.rpc('get_unavailable_slots_for_date', {
            p_date: date
        });

        if (error) throw error;

        res.status(200).json({ unavailableSlots: data });

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