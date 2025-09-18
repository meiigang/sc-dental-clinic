export async function getPatientByIdHandler(req, res) {
    const { id } = req.params;
    const { data, error } = await req.supabase
        .from("patients")
        .select(`
            id,
            user_id,
            users (
                lastName,
                firstName,
                middleName,
                email,
                contactNumber
            )
        `)
        .eq("id", id)
        .single();
    if (error || !data) {
        return res.status(404).json({ message: "Patient not found." });
    }
    return res.status(200).json({
        id: data.id,
        user_id: data.user_id,
        last_name: data.users?.lastName || "",
        first_name: data.users?.firstName || "",
        middle_name: data.users?.middleName || "",
        email: data.users?.email || "",
        contact_number: data.users?.contactNumber || ""
    });
}