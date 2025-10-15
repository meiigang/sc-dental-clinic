// Handler for a staff member to update the status of an appointment
export async function updateAppointmentStatusHandler(req, res) {
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }

    // 2. Get appointment ID from URL and new status from body
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ message: "Appointment ID and new status are required." });
    }

    // Optional: Validate the status to ensure it's one of the allowed enum values
    const allowedStatuses = ['pending_approval', 'confirmed', 'cancelled', 'no_show', 'completed'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        // 1. Update the appointment in the database
        const { error: updateError } = await req.supabase
            .from('appointments')
            .update({ status: status })
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Re-fetch the appointment with the correct column names
        const { data: updatedAppointment, error: fetchError } = await req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                patient:patients (
                    user:users ( firstName, middleName, lastName )
                ),
                service:services ( service_name )
            `)
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({ message: `Appointment with ID ${id} not found after update.` });
            }
            throw fetchError;
        }

        // 3. Format the single updated appointment with the correct data
        const startTimeUTC = new Date(updatedAppointment.start_time);
        const endTimeUTC = new Date(updatedAppointment.end_time);
        
        const user = updatedAppointment.patient?.user;
        const patientName = user
            ? `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName.charAt(0) + '.' : ''}`.trim()
            : 'Unknown Patient';

        const formattedData = {
            id: updatedAppointment.id,
            date: startTimeUTC.toISOString().split('T')[0],
            startTime: startTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            endTime: endTimeUTC.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            patient: patientName,
            service: updatedAppointment.service?.service_name || 'Unknown Service',
            status: updatedAppointment.status
        };

        // 4. Return success response
        console.log(`Appointment ${id} status updated to ${status} by user ${req.user.id}`);
        res.status(200).json({ message: "Appointment status updated successfully.", appointment: formattedData });

    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "An internal server error occurred.", error: error.message });
    }
}

// Handler for staff to get all appointments
export async function getAllAppointmentsHandler(req, res) {
    // 1. Check for staff authentication
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }

    try {
        // Fetch appointments with the correct column names
        const { data, error } = await req.supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                end_time,
                status,
                patient:patients (
                    user:users ( firstName, middleName, lastName )
                ),
                service:services ( service_name )
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
    const user = req.user;
    if (!user || (user.role !== 'staff' && user.role !== 'dentist')) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
    }

    const { id } = req.params;
    const { date, startTime, endTime, patient, service, status } = req.body;

    // Note: This is a simplified update. A real-world app would need to
    // convert patient/service names back to IDs before updating.
    // For now, we'll focus on updating time and status.

    const updatePayload = {
        status: status,
        // You would add more fields here as needed
    };

    // If startTime and endTime are provided, update them
    if (date && startTime) {
        updatePayload.start_time = `${date}T${startTime}:00Z`;
    }
    if (date && endTime) {
        updatePayload.end_time = `${date}T${endTime}:00Z`;
    }

    try {
        const { data, error } = await req.supabase
            .from('appointments')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Re-fetch and format for consistency (same as the other handlers)
        // This part is crucial to prevent state corruption.
        // (You can refactor this into a shared function later)
        const { data: updatedAppointment, error: fetchError } = await req.supabase
            .from('appointments')
            .select(`id, start_time, end_time, status, patient:patients(user:users(firstName, middleName, lastName)), service:services(service_name)`)
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const patientUser = updatedAppointment.patient?.user;
        const patientName = patientUser ? `${patientUser.lastName}, ${patientUser.firstName} ${patientUser.middleName ? patientUser.middleName.charAt(0) + '.' : ''}`.trim() : 'Unknown Patient';
        
        const formattedData = {
            id: updatedAppointment.id,
            date: new Date(updatedAppointment.start_time).toISOString().split('T')[0],
            startTime: new Date(updatedAppointment.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            endTime: new Date(updatedAppointment.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            patient: patientName,
            service: updatedAppointment.service?.service_name || 'Unknown Service',
            status: updatedAppointment.status
        };

        res.status(200).json({ message: "Appointment updated successfully.", appointment: formattedData });

    } catch (error) {
        console.error("Error updating appointment details:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
}