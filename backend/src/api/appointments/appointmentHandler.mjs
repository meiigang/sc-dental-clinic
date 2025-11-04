import { createNotification } from '../notifications/notificationsHandler.mjs';

// Handler for staff to get all appointments
export async function getAllAppointmentsHandler(req, res) {
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }

    try {
        // Fetch appointments with explicit joins and include price
        const { data, error } = await req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                patient:patient_id (
                    user:user_id ( firstName, middleName, lastName )
                ),
                service:service_id ( service_name, price )
            `);

        if (error) throw error;

        const formattedData = data.map(appt => {
            const startTimeUTC = new Date(appt.start_time);
            const endTimeUTC = new Date(appt.end_time);

            const user = appt.patient?.user;
            const patientName = user
                ? `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName.charAt(0) + '.' : ''}`.trim()
                : 'Unknown Patient';

            return {
                id: appt.id,
                date: startTimeUTC.toISOString().split('T')[0],
                startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
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
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: 'Forbidden: Only staff can perform this action.' });
    }

    // 2. Get appointment ID from URL and updated data from body
    const { id } = req.params;
    // Only destructure fields that can actually be updated in this modal
    const { date, startTime, endTime, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    // 3. Construct the update object, combining date and time into timestamps
    const updateData = {};

    if (date && startTime) {
        updateData.start_time = new Date(`${date}T${startTime}`).toISOString();
    }
    if (date && endTime) {
        updateData.end_time = new Date(`${date}T${endTime}`).toISOString();
    }
    if (status) updateData.status = status;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    try {
        // --- MODIFICATION START ---
        // 4a. Before updating, fetch the original appointment to get patient details for notification
        const { data: originalAppointment, error: fetchOriginalError } = await req.supabase
            .from('appointments')
            .select('start_time, patient:patient_id(user_id)')
            .eq('id', id)
            .single();

        if (fetchOriginalError || !originalAppointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        const patientUserId = originalAppointment.patient.user_id;
        // --- MODIFICATION END ---

        // 4b. Update the appointment in Supabase
        const { error: updateError } = await req.supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id);

        if (updateError) {
            console.error('Error updating appointment details:', updateError);
            return res.status(500).json({ message: 'Failed to update appointment.' });
        }

        // --- NEW: NOTIFICATION LOGIC ---
        let notificationType = '';
        const isRescheduled = updateData.start_time || updateData.end_time;

        if (status === 'confirmed' && !isRescheduled) {
            notificationType = 'APPOINTMENT_CONFIRMED';
        } else if (isRescheduled) {
            notificationType = 'APPOINTMENT_RESCHEDULED';
        }

        if (patientUserId && notificationType) {
            await createNotification(
                patientUserId,
                notificationType,
                { 
                    // For rescheduled, you might want oldDate and newDate
                    // For now, we'll just send the new date
                    date: updateData.start_time || originalAppointment.start_time,
                    appointmentId: id 
                }
            );
        }
        // --- END NOTIFICATION LOGIC ---

        // 5. Re-fetch the updated record with explicit joins to format it for the frontend
        const { data: updatedAppointment, error: fetchError } = await req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                patient:patient_id (
                    user:user_id ( firstName, middleName, lastName )
                ),
                service:service_id ( service_name, price )
            `)
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 6. Format the response to match the frontend's data structure
        const startTimeUTC = new Date(updatedAppointment.start_time);
        const endTimeUTC = new Date(updatedAppointment.end_time);
        const user = updatedAppointment.patient?.user;
        const patientName = user
            ? `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName.charAt(0) + '.' : ''}`.trim()
            : 'Unknown Patient';

        const formattedAppointment = {
            id: updatedAppointment.id,
            date: startTimeUTC.toISOString().split('T')[0],
            startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
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


//Handler to cancel appointments
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
                patientUserId,
                'APPOINTMENT_CANCELED',
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
            // This can happen if the user exists but has no patient record yet
            return res.status(200).json([]); // Return empty array, not an error
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
            const dentistUser = appt.dentist?.user;
            const dentistName = dentistUser ? `Dr. ${dentistUser.firstName} ${dentistUser.lastName}` : 'TBA';
            
            return {
                id: appt.id,
                date: new Date(appt.start_time).toISOString().split('T')[0],
                startTime: new Date(appt.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                endTime: new Date(appt.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                service: appt.service?.service_name || 'Unknown Service',
                price: appt.service?.price || 0,
                dentist: dentistName,
                status: appt.status
            };
        });

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching patient's appointments:", error);
        res.status(500).json({ message: "An internal server error occurred.", error: error.message });
    }
}