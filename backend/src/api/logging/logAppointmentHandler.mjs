export async function logAppointmentHandler(req, res) {
    const supabase = req.supabase;
    const {
        appointmentId,
        patientId,
        dentalLog, // { "11": { conditions: ["Decayed"], notes: "Slight discoloration." }, "24": { ... } }
        invoiceData // { invoiceDate, items: [...], subtotal, ... }
    } = req.body;

    // --- Input Validation ---
    if (!appointmentId || !patientId || !dentalLog || !invoiceData) {
        return res.status(400).json({ message: "Missing required logging data." });
    }

    try {
        //1. Find or Create Dental Record for the patient ---
        let { data: dentalRecord, error: recordError } = await supabase
            .from('dental_records')
            .select('id')
            .eq('patient_id', patientId)
            .single();

        if (recordError && recordError.code !== 'PGRST116') { // PGRST116 = no rows found
            throw recordError;
        }

        // If no record exists, create one.
        if (!dentalRecord) {
            const { data: newRecord, error: newRecordError } = await supabase
                .from('dental_records')
                .insert({ patient_id: patientId })
                .select('id')
                .single();
            if (newRecordError) throw newRecordError;
            dentalRecord = newRecord;
        }

        // --- 2. Insert all Tooth Conditions ---
        const toothConditionsToInsert = [];
        for (const toothNumber in dentalLog) {
            const { conditions, notes } = dentalLog[toothNumber];
            
            // Add an entry for each condition checkbox
            conditions.forEach(condition => {
                toothConditionsToInsert.push({
                    record_id: dentalRecord.id,
                    appointment_id: appointmentId,
                    tooth_number: parseInt(toothNumber, 10),
                    condition: condition,
                    notes: notes || null // Only add notes to the first condition entry to avoid duplication
                });
            });

            // If there are notes but no conditions, add a "note-only" entry
            if (conditions.length === 0 && notes) {
                 toothConditionsToInsert.push({
                    record_id: dentalRecord.id,
                    appointment_id: appointmentId,
                    tooth_number: parseInt(toothNumber, 10),
                    condition: 'Note', // Use a special condition type for notes
                    notes: notes
                });
            }
        }

        if (toothConditionsToInsert.length > 0) {
            const { error: conditionsError } = await supabase
                .from('tooth_conditions')
                .insert(toothConditionsToInsert);
            if (conditionsError) throw conditionsError;
        }

        // --- 3. Create the Invoice ---
        const { data: newInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                appointment_id: appointmentId,
                invoice_date: invoiceData.invoiceDate,
                subtotal: invoiceData.subtotal,
                tax_amount: invoiceData.taxAmount,
                discount_amount: invoiceData.discountAmount,
                total_amount: invoiceData.totalAmount,
                mode_of_payment: invoiceData.modeOfPayment,
                // Add other payment fields if they exist
            })
            .select('id')
            .single();
        
        if (invoiceError) throw invoiceError;

        // --- 4. Insert Invoice Items ---
        const invoiceItemsToInsert = invoiceData.items.map(item => ({
            invoice_id: newInvoice.id,
            service_id: item.service_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        if (invoiceItemsToInsert.length > 0) {
            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItemsToInsert);
            if (itemsError) throw itemsError;
        }

        // --- 5. (Optional but Recommended) Update Appointment Status ---
        await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', appointmentId);


        res.status(201).json({ message: "Appointment logged successfully." });

    } catch (error) {
        console.error("Error logging appointment:", error);
        res.status(500).json({ message: "Failed to log appointment.", error: error.message });
    }
}