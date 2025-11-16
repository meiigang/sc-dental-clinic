export async function registerStaffHandler(req, res) {
    const supabase = req.supabase;
    const {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        suffix,
        contact_number,
        role,
        profile_picture
    } = req.body;

    // 1. Create user
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
            email,
            password, // hash in production!
            firstName: first_name,
            middleName: middle_name,
            lastName: last_name,
            nameSuffix: suffix === "NONE_VALUE" ? null : suffix,
            contactNumber: contact_number,
            role,
            profile_picture: profile_picture ?? null
        }])
        .select('id')
        .single();

    if (userError || !user) {
        return res.status(400).json({ message: "Failed to create user", error: userError?.message });
    }

    // 2. Create staff record
    const { data: staff, error: staffError } = await supabase
        .from('staff')
        .insert([{ user_id: user.id }])
        .select('id')
        .single();

    if (staffError || !staff) {
        return res.status(400).json({ message: "Failed to create staff record", error: staffError?.message });
    }

    return res.status(201).json({ user, staff });
}