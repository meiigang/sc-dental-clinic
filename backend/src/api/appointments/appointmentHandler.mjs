import { createNotification } from '../notifications/notificationsHandler.mjs';

// Handler for staff to get all appointments
export async function getAllAppointmentsHandler(req, res) {
    // --- FIX: Check for a patientId query parameter ---
    const { patientId } = req.query;

    try {
        // Start building the query
        let query = req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                patient:patient_id(user:user_id(firstName, middleName, lastName)),
                service:service_id(service_name, price)
            `);

        // If a patientId is provided in the URL, add a filter to the query
        if (patientId) {
            query = query.eq('patient_id', patientId);
        }
        // --- END OF FIX ---

        // Execute the final query
        const { data, error } = await query;

        if (error) throw error;

        const formattedData = data.map(appt => {
            // --- FIX: Use the correct time zone for formatting ---
            const clinicTimeZone = 'Asia/Manila';
            const startTimeUTC = new Date(appt.start_time);
            const endTimeUTC = new Date(appt.end_time);

            const user = appt.patient?.user;
            const patientName = user
                ? `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName.charAt(0) + '.' : ''}`.trim()
                : 'Unknown Patient';

            return {
                id: appt.id,
                date: startTimeUTC.toLocaleDateString('en-CA', { timeZone: clinicTimeZone }),
                startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
                endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
                patient: patientName,
                service: appt.service?.service_name || 'Unknown Service',
                price: appt.service?.price || 0,
                status: appt.status
            };
        });

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "An internal server error occurred.", error: error.message });
    }
}

// Handler for a staff member to update any detail of an appointment
export async function updateAppointmentDetailsHandler(req, res) {
    // This handler is now ONLY for rescheduling (changing date/time)
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }

    // 2. Get ID and update data
    const { id } = req.params;
    const updateData = req.body;
    const { status, start_time } = updateData;

    if (!id) {
        return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    try {
        // 3. Fetch the original appointment to get patient ID and original start time
        const { data: originalAppointment, error: fetchOriginalError } = await req.supabase
            .from('appointments')
            .select('start_time, patient:patient_id(user_id)')
            .eq('id', id)
            .single();

        if (fetchOriginalError || !originalAppointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        const patientUserId = originalAppointment.patient.user_id;

        // 4. Update the appointment in Supabase
        const { data: updatedAppointment, error: updateError } = await req.supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                patient:patient_id(user:user_id(*)),
                service:service_id(*)
            `)
            .single();

        if (updateError) throw updateError;

        // --- FIX: Expanded Notification Logic ---
        let notificationType = '';
        const isRescheduled = start_time && new Date(start_time).getTime() !== new Date(originalAppointment.start_time).getTime();

        if (isRescheduled) {
            notificationType = 'APPOINTMENT_RESCHEDULED';
        } else if (status === 'confirmed') {
            notificationType = 'APPOINTMENT_CONFIRMED';
        } else if (status === 'cancelled') {
            notificationType = 'APPOINTMENT_CANCELLED'; // Use the correct type from notification-item.tsx
        } else if (status === 'completed') {
            notificationType = 'APPOINTMENT_COMPLETED'; // Assuming you have or will add this type
        } else if (status === 'no_show') {
            notificationType = 'APPOINTMENT_NO_SHOW'; // Assuming you have or will add this type
        }

        // Only create a notification if a relevant status change occurred
        if (patientUserId && notificationType) {
            await createNotification(
                req.supabase,
                patientUserId,
                notificationType,
                { 
                    date: updatedAppointment.start_time,
                    appointmentId: id 
                }
            );
        }

        const clinicTimeZone = 'Asia/Manila';
        const startTimeUTC = new Date(updatedAppointment.start_time);
        const endTimeUTC = new Date(updatedAppointment.end_time);
        const user = updatedAppointment.patient?.user;
        const patientName = user
            ? `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName.charAt(0) + '.' : ''}`.trim()
            : 'Unknown Patient';

        const formattedAppointment = {
            id: updatedAppointment.id,
            date: startTimeUTC.toLocaleDateString('en-CA', { timeZone: clinicTimeZone }),
            startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
            endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
            patient: patientName,
            service: updatedAppointment.service?.service_name || 'Unknown Service',
            price: updatedAppointment.service?.price || 0,
            status: updatedAppointment.status
        };

        res.status(200).json({ message: 'Appointment updated successfully.', appointment: formattedAppointment });


    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

// --- NEW, SIMPLER HANDLER FOR STATUS-ONLY CHANGES ---
export async function updateAppointmentStatusHandler(req, res) {
    // 1. Auth Check
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // 2. Get ID and new status
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        // 3. Update the appointment and get the patient's user ID for notification
        const { data: updatedAppointment, error: updateError } = await req.supabase
            .from('appointments')
            .update({ status: status })
            .eq('id', id)
            .select(`*, patient:patient_id(user_id), service:service_id(*)`)
            .single();

        if (updateError) throw updateError;
        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found.' });

        // 4. Determine Notification Type based on status
        const patientUserId = updatedAppointment.patient.user_id;
        let notificationType = '';

        if (status === 'confirmed') notificationType = 'APPOINTMENT_CONFIRMED';
        else if (status === 'cancelled') notificationType = 'APPOINTMENT_CANCELLED';
        else if (status === 'completed') notificationType = 'APPOINTMENT_COMPLETED';
        else if (status === 'no_show') notificationType = 'APPOINTMENT_NO_SHOW';

        // 5. Send Notification
        if (patientUserId && notificationType) {
            await createNotification(
                req.supabase,
                patientUserId,
                notificationType,
                { appointmentId: id, date: updatedAppointment.start_time }
            );
        }

        // 6. Format and send response (same as the other handler)
        const clinicTimeZone = 'Asia/Manila';
        const startTimeUTC = new Date(updatedAppointment.start_time);
        const endTimeUTC = new Date(updatedAppointment.end_time);

        const formattedAppointment = {
            id: updatedAppointment.id,
            date: startTimeUTC.toLocaleDateString('en-CA', { timeZone: clinicTimeZone }),
            startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
            endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
            patient: updatedAppointment.patient?.user?.lastName ? `${updatedAppointment.patient.user.lastName}, ${updatedAppointment.patient.user.firstName}` : 'Unknown',
            service: updatedAppointment.service?.service_name || 'Unknown',
            price: updatedAppointment.service?.price || 0,
            status: updatedAppointment.status
        };
        
        res.status(200).json({ message: 'Appointment status updated.', appointment: formattedAppointment });

    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

// Handler to cancel appointments
export async function cancelAppointmentHandler(req, res) {
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: 'Forbidden: Only staff can perform this action.' });
    }

    // 2. Get appointment ID from URL
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    try {
        // 3. Update the appointment status to 'cancelled' in Supabase
        const { data: updatedAppointment, error } = await req.supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select('id, start_time, patient:patient_id(user_id)') // Also select patient's user_id
            .single();

        if (error) {
            console.error('Error cancelling appointment:', error);
            return res.status(500).json({ message: 'Failed to cancel appointment.' });
        }

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // --- NEW: NOTIFICATION LOGIC ---
        const patientUserId = updatedAppointment.patient?.user_id;
        if (patientUserId) {
            await createNotification(
                req.supabase, // <-- THIS WAS LIKELY MISSING HERE TOO
                patientUserId,
                'APPOINTMENT_CANCELLED',
                {
                    date: updatedAppointment.start_time,
                    appointmentId: updatedAppointment.id
                }
            );
        }
        // --- END NOTIFICATION LOGIC ---

        res.status(200).json({ message: 'Appointment successfully cancelled.', appointment: updatedAppointment });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


// --- NEW HANDLER (for Patients) ---
// Handler for a patient to get their own appointments
export async function getMyAppointmentsHandler(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
    }

    try {
        // 1. Find the patient_id associated with the user_id
        const { data: patientRecord, error: patientError } = await req.supabase
            .from('patients')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (patientError || !patientRecord) {
            return res.status(200).json([]);
        }
        const patientId = patientRecord.id;

        // 2. Fetch all appointments for that patient_id
        const { data, error } = await req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                service:service_id ( service_name, price ),
                dentist:staff_id ( user:user_id ( firstName, lastName ) )
            `)
            .eq('patient_id', patientId);

        if (error) throw error;

        // 3. Format the data for the frontend
        const formattedData = data.map(appt => {
            const clinicTimeZone = 'Asia/Manila';
            const startTime = new Date(appt.start_time);
            const endTime = new Date(appt.end_time);

            return {
                id: appt.id,
                date: startTime.toLocaleDateString('en-CA', { timeZone: clinicTimeZone }),
                startTime: startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
                endTime: endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: clinicTimeZone }),
                service: appt.service?.service_name || 'Unknown Service',
                price: appt.service?.price || 0,
                dentist: appt.dentist?.user?.firstName ? `Dr. ${appt.dentist.user.firstName} ${appt.dentist.user.lastName}` : 'TBA',
                status: appt.status
            };
            // --- END OF FIX ---
        });

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ message: "Failed to fetch appointments." });
    }
}