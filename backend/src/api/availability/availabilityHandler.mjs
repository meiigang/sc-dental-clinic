//PUT REQUEST
export default async function updateAvailabilityHandler(req, res) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({message: "Unauthorized access."})
    }

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


    console.log("Incoming request body:", JSON.stringify(req.body, null, 2));
    if(!staffId) {
        return res.status(400).json({message: "Unauthorized access."})
    }

    const { weekly, overrides } = req.body;

    //DATABASE TRANSACTION

    try {
        //1. Delete all previous availability for staff member
        await req.supabase
        .from("staff_weekly_availability")
        .delete()
        .eq("staff_id", staffId);

        await req.supabase
        .from("date_specific_hours_override")
        .delete()
        .eq("staff_id", staffId);

        //2. Insert new weekly availability
        if (weekly && weekly.length > 0){
            const weeklyToInsert = weekly.map(item => ({...item, staff_id: staffId}));
            const {error: weeklyError} = await req.supabase
            .from("staff_weekly_availability")
            .insert(weeklyToInsert);
            if (weeklyError) throw weeklyError;
        }
        
        //3. Insert new date-specific overrides, if there exists any
        if (overrides && overrides.length > 0) {
            const overridesToInsert = overrides.map(item => ({...item, staff_id: staffId}));
            const { error: overrideError } = await req.supabase
            .from("date_specific_hours_override")
            .insert(overridesToInsert);
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
        .select("day_of_week, start_time, end_time")
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