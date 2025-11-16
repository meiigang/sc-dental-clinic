export async function getSalesSummary(req, res) {
    console.log("--- Backend: getSalesSummary handler called ---");
    const supabase = req.supabase;

    try {
        // For a staff-only page, you should ideally validate the user's token and role here.
        // Skipping for now as per previous requests.

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                id,
                invoice_date,
                total_amount,
                appointment:appointments (
                    start_time,
                    end_time,
                    patient:patients (
                        user:users!user_id (
                            firstName,
                            lastName
                        )
                    )
                ),
                items:invoice_items (
                    description
                )
            `)
            .order('invoice_date', { ascending: false });

        if (error) {
            console.error("Backend DB Error (getSalesSummary):", error);
            throw error;
        }

        // Map the complex query result to the simple format the frontend expects.
        const formattedSales = data.map(invoice => {
            const patientUser = invoice.appointment?.patient?.user;
            const patientName = patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : "Unknown Patient";
            
            const serviceNames = invoice.items.map(item => item.description).join(', ');

            return {
                id: invoice.id,
                date: invoice.invoice_date,
                startTime: invoice.appointment?.start_time,
                endTime: invoice.appointment?.end_time,
                patient: patientName,
                service: serviceNames,
                price: invoice.total_amount,
                status: 'completed' // All invoices are considered completed sales.
            };
        });

        console.log(`Backend: Successfully fetched and formatted ${formattedSales.length} sales records.`);
        res.status(200).json(formattedSales);

    } catch (error) {
        console.error("--- UNCAUGHT ERROR in getSalesSummary ---:", error);
        res.status(500).json({ message: "Failed to fetch sales summary.", error: error.message });
    }
}