export async function getAppointmentLogHandler(req, res) {
    const supabase = req.supabase;
    const { id } = req.params; // The appointment ID

    if (!id) {
        return res.status(400).json({ message: "Appointment ID is required." });
    }

    try {
        // Fetch all tooth conditions associated with this specific appointment
        const { data: conditions, error } = await supabase
            .from('tooth_conditions')
            .select('tooth_number, condition, notes')
            .eq('appointment_id', id);

        if (error) throw error;

        // If no log is found, return an empty object
        if (!conditions || conditions.length === 0) {
            return res.status(200).json({});
        }

        // Process the flat array from the DB into the nested object format the frontend needs
        // e.g., { "11": { conditions: ["Decayed"], notes: "..." } }
        const dentalLog = conditions.reduce((acc, record) => {
            const { tooth_number, condition, notes } = record;

            if (!acc[tooth_number]) {
                acc[tooth_number] = {
                    conditions: [],
                    notes: ''
                };
            }

            // Add the condition if it's not just a placeholder for a note
            if (condition !== 'Note') {
                acc[tooth_number].conditions.push(condition);
            }

            // Assign the notes (they might be duplicated across records for the same tooth,
            // but this will just re-assign the same value).
            if (notes) {
                acc[tooth_number].notes = notes;
            }

            return acc;
        }, {});

        res.status(200).json(dentalLog);

    } catch (error) {
        console.error(`Error fetching log for appointment ${id}:`, error);
        res.status(500).json({ message: "Failed to fetch appointment log.", error: error.message });
    }
}