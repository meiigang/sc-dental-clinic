export async function getStaffHandler(req, res) {
    const supabase = req.supabase;
    const { data, error } = await supabase
        .from('staff')
        .select(`
            id,
            created_at,
            user:users (
                id,
                email,
                firstName,
                middleName,
                lastName,
                nameSuffix,
                contactNumber,
                role,
                profile_picture,
                active
            )
        `);

    if (error) return res.status(400).json({ message: "Failed to fetch staff", error: error.message });

    // Flatten user object for frontend
    const staffList = data.map(s => ({
        id: s.user.id,
        firstName: s.user.firstName,
        middleName: s.user.middleName,
        lastName: s.user.lastName,
        nameSuffix: s.user.nameSuffix,
        email: s.user.email,
        contactNumber: s.user.contactNumber,
        active: s.user.active,
        profile_picture: s.user.profile_picture,
    }));

    return res.status(200).json(staffList);
}