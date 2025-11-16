export async function updateUserStatusHandler(req, res) {
    const supabase = req.supabase;
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const { error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", id);

    if (error) {
        return res.status(500).json({ message: "Failed to update status", error: error.message });
    }

    return res.status(200).json({ message: "Status updated successfully" });
}