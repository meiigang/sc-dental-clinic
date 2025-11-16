export async function getPatientChartHistory(req, res) {
    const supabase = req.supabase;
    const { id } = req.params; // Patient ID from the URL

    if (!id) {
        return res.status(400).json({ message: "Patient ID is required." });
    }

    try {
        // Step 1: Find the patient's main dental record ID.
        // This links the patient to their chart entries.
        const { data: record, error: recordError } = await supabase
            .from('dental_records')
            .select('id')
            .eq('patient_id', id)
            .single();

        // If a patient has never had an appointment logged, they won't have a record.
        // This is normal, so we return an empty array.
        if (recordError && recordError.code === 'PGRST116') { // 'PGRST116' means no rows found
            return res.status(200).json([]);
        }
        if (recordError) throw recordError;


        // Step 2: Use the record ID to fetch all associated tooth conditions.
        // We also fetch related appointment and service details for context.
        const { data: conditions, error: conditionsError } = await supabase
            .from('tooth_conditions')
            .select(`
                tooth_number,
                condition,
                notes,
                created_at,
                appointment:appointments ( start_time, service:services (service_name) )
            `)
            .eq('record_id', record.id)
            .order('created_at', { ascending: false }); // Show most recent first

        if (conditionsError) throw conditionsError;

        res.status(200).json(conditions);

    } catch (error) {
        console.error("Error fetching patient chart history:", error);
        res.status(500).json({ message: "Failed to fetch patient chart history.", error: error.message });
    }
}