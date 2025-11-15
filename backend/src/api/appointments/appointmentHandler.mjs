import { createNotification } from '../notifications/notificationsHandler.mjs';

// --- FIX: Correctly join through the 'users' table and use camelCase column names ---
const APPOINTMENT_SELECT_QUERY = `
    id,
    start_time,
    end_time,
    original_start_time,
    status,
    service:service_id(id, service_name, price, estimated_duration),
    patient:patient_id(id, user_id, user:user_id(firstName, lastName)),
    staff:staff_id(id, user:user_id(firstName, lastName))
`;

// Helper function to flatten the nested user data from the query result
const flattenAppointmentData = (appt) => {
    if (!appt) return null;
    const patientData = appt.patient ? { ...appt.patient, ...appt.patient.user } : null;
    const staffData = appt.staff ? { ...appt.staff, ...appt.staff.user } : null;
    if (patientData) delete patientData.user;
    if (staffData) delete staffData.user;

    return {
        ...appt,
        patient: patientData,
        staff: staffData
    };
};

// Handler for staff to get all appointments
export async function getAllAppointmentsHandler(req, res) {
    const { patientId } = req.query;
    try {
        let query = req.supabase.from('appointments').select(APPOINTMENT_SELECT_QUERY);
        if (patientId) {
            query = query.eq('patient_id', patientId);
        }
        const { data, error } = await query.order('start_time', { ascending: false });
        if (error) throw error;

        // --- FIX: Flatten the nested user objects for each appointment ---
        const formattedData = data.map(flattenAppointmentData);
        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "An internal server error occurred.", error: error.message });
    }
}

// Handler for a staff member to update any detail of an appointment
export async function updateAppointmentDetailsHandler(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { start_time, end_time, status } = req.body;

     // --- DEBUG: Log incoming request details ---
    console.log("\n--- Backend: updateAppointmentDetailsHandler ---");
    console.log(`[${new Date().toISOString()}]`);
    console.log("Appointment ID:", id);
    console.log("Request Body:", req.body);

    if (user.role === 'patient') {
        if (status) {
            return res.status(403).json({ message: "Forbidden: Patients cannot directly change appointment status." });
        }
    } else if (user.role !== 'staff' && user.role !== 'dentist') {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        // --- FIX: Fetch the original_start_time as well ---
        const { data: originalAppointment, error: fetchError } = await req.supabase.from('appointments').select('start_time, original_start_time, status, patient:patient_id(user_id), staff:staff_id(user_id)').eq('id', id).single();
        if (fetchError) throw fetchError;

        // --- FIX: Define isRescheduled BEFORE it is used ---
        const isRescheduled = start_time && new Date(start_time).getTime() !== new Date(originalAppointment.start_time).getTime();
        const isStatusChange = !isRescheduled && status && status !== originalAppointment.status;
        
        let updatePayload = {};        
        
        if (isRescheduled) {
            // If the time has changed, it's a reschedule.
            updatePayload = {
                start_time,
                end_time,
                status: 'pending_reschedule',
                original_start_time: originalAppointment.original_start_time || originalAppointment.start_time
            };
        } else {
            // If the time has NOT changed, this is a status-only update.
            if (user.role === 'patient') {
                return res.status(400).json({ message: "No new time provided for reschedule request." });
            }
            updatePayload = { status };
        }

        console.log("Final update payload:", updatePayload);

        const { data: updatedAppointment, error: updateError } = await req.supabase
            .from('appointments')
            .update(updatePayload)
            .eq('id', id)
            .select(APPOINTMENT_SELECT_QUERY)
            .single();

        if (updateError) throw updateError;

        // Notify the other party ONLY if it was a reschedule action.
        if (isRescheduled) {
            // Handle reschedule notifications (existing logic)
            if (user.role !== 'patient') { // Staff/Dentist initiated the reschedule
                await createNotification(req.supabase, originalAppointment.patient.user_id, 'APPOINTMENT_RESCHEDULED', { date: updatedAppointment.start_time, appointmentId: updatedAppointment.id });
            }
            // (Patient-initiated reschedule logic can be added here if needed)
        } else if (isStatusChange) {
            // Handle status-change notifications (NEW logic)
            const patientUserId = originalAppointment.patient?.user_id;
            if (patientUserId) {
                if (status === 'confirmed' && originalAppointment.status === 'pending_approval') {
                    await createNotification(req.supabase, patientUserId, 'APPOINTMENT_CONFIRMED', { date: updatedAppointment.start_time, appointmentId: updatedAppointment.id });
                } else if (status === 'cancelled') {
                    // This covers the user's reported case: Confirmed -> Cancelled
                    await createNotification(req.supabase, patientUserId, 'APPOINTMENT_CANCELLED', { date: updatedAppointment.start_time, appointmentId: updatedAppointment.id });
                }
            }
        }
        
         console.log("Successfully updated appointment in DB:", updatedAppointment);

        res.status(200).json({ message: 'Appointment updated.', appointment: flattenAppointmentData(updatedAppointment) });

    } catch (error) {
        console.error("!!! ERROR in updateAppointmentDetailsHandler !!!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", error);

        console.error("Error updating appointment:", error);
        if (error.code === '23505') return res.status(409).json({ message: "The requested time slot is already booked." });
        return res.status(500).json({ message: "Internal server error." });
    }
}


// Handler for a patient to get their own appointments
export async function getMyAppointmentsHandler(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
    }
    try {
        const { data: patientRecord, error: patientError } = await req.supabase.from('patients').select('id').eq('user_id', userId).single();
        if (patientError || !patientRecord) {
            return res.status(200).json([]);
        }
        const patientId = patientRecord.id;
        const { data, error } = await req.supabase.from('appointments').select(APPOINTMENT_SELECT_QUERY).eq('patient_id', patientId);
        if (error) throw error;

        // --- FIX: Flatten the nested user objects for each appointment ---
        const formattedData = data.map(flattenAppointmentData);
        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ message: "Failed to fetch appointments.", error: error.message });
    }
}

// Handler for a patient to CONFIRM a reschedule
export async function confirmRescheduleHandler(req, res) {
    const user = req.user;
    if (!user || user.role !== 'patient') {
        return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    try {
        const { data: updatedAppointment, error } = await req.supabase.from('appointments').update({ status: 'confirmed', original_start_time: null }).eq('id', id).select(APPOINTMENT_SELECT_QUERY).single();
        if (error) throw error;

        const flattenedAppointment = flattenAppointmentData(updatedAppointment);
        if (flattenedAppointment.staff?.user_id) {
            await createNotification(req.supabase, flattenedAppointment.staff.user_id, 'RESCHEDULE_CONFIRMED', { appointmentId: id });
        }
        res.status(200).json({ message: 'Reschedule confirmed.', appointment: flattenedAppointment });
    } catch (error) {
        console.error("Error confirming reschedule:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

// Handler for a patient to DECLINE a reschedule (which cancels the appointment)
export async function declineRescheduleHandler(req, res) {
    const user = req.user;
    if (!user || user.role !== 'patient') {
        return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    try {
        const { data: updatedAppointment, error } = await req.supabase.from('appointments').update({ status: 'cancelled', original_start_time: null }).eq('id', id).select(APPOINTMENT_SELECT_QUERY).single();
        if (error) throw error;

        const flattenedAppointment = flattenAppointmentData(updatedAppointment);
        if (flattenedAppointment.staff?.user_id) {
            await createNotification(req.supabase, flattenedAppointment.staff.user_id, 'RESCHEDULE_DECLINED', { appointmentId: id });
        }
        res.status(200).json({ message: 'Reschedule declined and appointment cancelled.', appointment: flattenedAppointment });
    } catch (error) {
        console.error("Error declining reschedule:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}