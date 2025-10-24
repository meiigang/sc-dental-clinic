export async function getAllPatientsHandler(req, res) {
    const { data, error } = await req.supabase
        .from("patients")
        .select(`
            id,
            user_id,
            users (
                lastName,
                firstName,
                middleName,
                role,
                profile_picture
            )
        `);
    if (error) {
        return res.status(500).json({ message: "Failed to fetch patients.", error });
    }
    // Map to flatten the user info for frontend
    const mapped = (data || [])
      // Filter to only users with "patient" role
      .filter((p => p.users?.role === "patient"))
      .map ((p) => ({
        id: p.id,
        user_id: p.user_id,
        last_name: p.users?.lastName || "",
        first_name: p.users?.firstName || "",
        middle_name: p.users?.middleName || "",
        role: p.users?.role || "",
        profile_picture: p.users?.profile_picture || ""
    }));
    console.log("Retrieved patients from database:", mapped);
    return res.status(200).json({ patients: mapped });
}