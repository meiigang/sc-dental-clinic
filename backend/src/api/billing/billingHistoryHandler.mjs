import { format } from 'date-fns';

// WARNING: This handler has no authentication and is insecure.
export async function getPatientBillingHistory(req, res) {
    console.log("--- Backend: getPatientBillingHistory handler called (NO AUTH) ---");
    const supabase = req.supabase;
    
    try {
        // 1. Get the user's UUID from the URL parameter.
        const { userId } = req.params;
        console.log(`Backend: Received user ID from URL: ${userId}`);

        if (!userId) {
            console.error("Backend Error: User ID is missing from the URL.");
            return res.status(400).json({ message: "Bad Request: User ID is missing from the URL." });
        }

        // 2. Look up the patient_id using the user_id (UUID).
        console.log(`Backend: Looking up patient record for user_id: ${userId}`);
        const { data: patientRecord, error: patientError } = await supabase
            .from('patients')
            .select('id') // This is the patient_id
            .eq('user_id', userId)
            .single();

        if (patientError || !patientRecord) {
            console.error("Backend DB Error: Could not find a patient record for this user.", patientError);
            return res.status(404).json({ message: "No patient record found for the logged-in user." });
        }

        const patientId = patientRecord.id;
        console.log(`Backend: Found matching patient_id: ${patientId}`);

        // 3. The rest of the logic proceeds using the found patientId.
        console.log(`Backend: Fetching appointment IDs for patient ${patientId}...`);
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('id')
            .eq('patient_id', patientId);

        if (appointmentsError) throw appointmentsError;

        if (!appointments || appointments.length === 0) {
            console.log("Backend: No appointments found for this patient. Returning empty history.");
            return res.status(200).json([]);
        }

        const appointmentIds = appointments.map(a => a.id);
        console.log(`Backend: Found appointment IDs: [${appointmentIds.join(', ')}]`);

        // 4. Fetch invoices using the appointment IDs.
        console.log("Backend: Fetching invoices for the found appointment IDs...");
        const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                id,
                invoice_date,
                mode_of_payment,
                total_amount,
                appointment:appointments (
                    start_time
                ),
                invoice_items (
                    description
                )
            `)
            .in('appointment_id', appointmentIds)
            .order('invoice_date', { ascending: false });

        if (invoiceError) throw invoiceError;

        console.log(`Backend: Found ${invoices.length} invoices.`);

        const formattedHistory = invoices.map(invoice => ({
            id: invoice.id,
            invoice_date: invoice.invoice_date,
            appointment_time: format(new Date(invoice.appointment.start_time), 'h:mm a'),
            service_names: invoice.invoice_items.map(item => item.description).join(', '),
            mode_of_payment: invoice.mode_of_payment,
            total_amount: invoice.total_amount,
        }));

        console.log("Backend: Successfully processed data. Sending formatted billing history to frontend.");
        res.status(200).json(formattedHistory);

    } catch (error) {
        console.error("--- UNCAUGHT ERROR in getPatientBillingHistory ---:", error);
        res.status(500).json({ message: "Failed to fetch billing history.", error: error.message });
    }
}


export async function getInvoiceDetails(req, res) {
    console.log("--- Backend: getInvoiceDetails handler called (Definitive Logic) ---");
    const supabase = req.supabase;
    const { id } = req.params;
    console.log(`Backend: Attempting to fetch details for invoiceId: ${id}`);

    try {
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select(`
                id,
                invoice_date,
                total_amount,
                subtotal,
                tax_amount,
                discount_amount,
                mode_of_payment,
                bank_name,
                account_name,
                account_number,
                items:invoice_items (
                    description,
                    quantity,
                    unit_price
                ),
                appointment:appointments (
                    patient:patients (
                        user:users!user_id (
                            firstName,
                            lastName
                        )
                    ),
                    dentist:staff!staff_id (
                        user:users!user_id (
                            firstName,
                            lastName
                        )
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Backend DB Error (invoice details for ${id}):`, error);
            throw error;
        }

        // --- FIX: Reshape the deeply nested data to match the frontend's expectation ---
        if (invoice) {
            // Flatten the patient data: appointment.patient.user -> appointment.patient
            if (invoice.appointment?.patient?.user) {
                invoice.appointment.patient = invoice.appointment.patient.user;
            }
            // Flatten the dentist data: appointment.dentist.user -> appointment.dentist
            if (invoice.appointment?.dentist?.user) {
                invoice.appointment.dentist = invoice.appointment.dentist.user;
            }
        }

        console.log(`Backend: Successfully fetched and reshaped details for invoice ${id}.`);
        res.status(200).json(invoice);

    } catch (error) {
        console.error(`--- UNCAUGHT ERROR in getInvoiceDetails for invoice ${id} ---:`, error);
        res.status(500).json({ message: "Failed to fetch invoice details.", error: error.message });
    }
}