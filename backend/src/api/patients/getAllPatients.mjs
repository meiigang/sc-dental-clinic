export async function getAllPatientsHandler(req, res) {
    const { data, error } = await req.supabase
        .from("patients")
        .select(`
            id,
            user_id,
            users (
                lastName,
                firstName,
                middleName
            )
        `);
    if (error) {
        return res.status(500).json({ message: "Failed to fetch patients.", error });
    }
    // Map to flatten the user info for frontend
    const mapped = (data || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        last_name: p.users?.lastName || "",
        first_name: p.users?.firstName || "",
        middle_name: p.users?.middleName || ""
    }));
    console.log("Retrieved patients from database:", mapped);
    return res.status(200).json({ patients: mapped });
}