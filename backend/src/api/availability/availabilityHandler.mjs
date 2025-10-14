export default async function availabilityHandler(req, res) {
    const staffId = req.user?.id;

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