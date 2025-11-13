import { format, parse, addMinutes } from 'date-fns';
import { createNotification} from '../notifications/notificationsHandler.mjs';

export default async function reserveAppointmentHandler(req, res){
    console.log("--- Reservation request received ---");
    try {
        const userUuid = req.user?.id;
        if (!userUuid) return res.status(401).json({message: "Unauthorized access."});

        // --- NEW STEP 1: Convert Patient User ID to Patient Table ID ---
        console.log(`Looking up patient ID for user UUID: ${userUuid}`);
        const { data: patientRecord, error: patientError } = await req.supabase
            .from("patients")
            .select("id") // This is the patients.id (bigint)
            .eq("user_id", userUuid) // Match it to the user_id (uuid)
            .single();

        if (patientError || !patientRecord) {
            throw new Error(`Could not find a patient record for the current user (UUID: ${userUuid}).`);
        }
        const patientIdToInsert = patientRecord.id;
        console.log(`Found Patient ID to insert: ${patientIdToInsert}`);
        // --- END OF NEW STEP 1 ---

        const {service_id, appointment_date, appointment_time} = req.body;
        console.log("Request Body:", {service_id, appointment_date, appointment_time});

        const { data: service, error: serviceError} = await req.supabase.from("services").select("estimated_duration").eq("id", service_id).single();
        if (serviceError) throw serviceError;

        // --- FIX: Interpret the incoming time as Philippine Time (UTC+8) ---
        const appointmentDateStr = format(new Date(appointment_date), 'yyyy-MM-dd');
        // Create a string that explicitly includes the +08:00 offset
        const dateTimeStringPHT = `${appointmentDateStr}T${appointment_time}:00+08:00`;
        
        // new Date() will now correctly parse this as 9 AM PHT and know its UTC equivalent is 1 AM.
        const startTime = new Date(dateTimeStringPHT);
        const endTime = addMinutes(startTime, service.estimated_duration);
        // --- END OF FIX ---

        const { data: dentists, error: dentistsError} = await req.supabase.from("users").select("id").eq("role", "dentist");
        if (dentistsError) throw dentistsError;
        const dentistUserIds = dentists.map(d => d.id);
        
        const { data: staffRecords, error: staffRecordsError } = await req.supabase
            .from("staff")
            .select("id, user_id")
            .in("user_id", dentistUserIds);
        if (staffRecordsError) throw staffRecordsError;

        const dentistStaffRecords = staffRecords;
        const dentistStaffIds = staffRecords.map(s => s.id);
        
        // --- CONFLICT DETECTION LOGIC ---
        // This prevents appointments that touch at the exact start/end time from being flagged as conflicts.
        const { data: conflictingAppointments, error: appointmentsError} = await req.supabase
            .from("appointments")
            .select("staff_id")
            .in("staff_id", dentistStaffIds)
            .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`);

        if (appointmentsError) throw appointmentsError;
        console.log("Conflicting appointments:", conflictingAppointments);

        const bookedStaffIds = conflictingAppointments.map(a => a.staff_id);

        // FIX: Correctly find the full staff record for an available dentist
        const availableStaffRecord = dentistStaffRecords.find(record => !bookedStaffIds.includes(record.id));

        console.log("Available Staff Record:", availableStaffRecord);

        // FIX: Check against the record, not just the ID
        if (!availableStaffRecord) {
            return res.status(409).json({ message: "Sorry, no dentists are available at this time slot." });
        }

        const availableStaffId = availableStaffRecord.id;
        const assignedDentistUserId = availableStaffRecord.user_id; // Get the user_id for notifications

        // --- Log 5: Check before final insert ---
        console.log("Attempting to insert appointment...");
        const { data: newAppointment, error: insertError } = await req.supabase.from("appointments").insert({
            patient_id: patientIdToInsert, 
            staff_id: availableStaffId, 
            service_id: service_id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'pending_approval'
        }).select().single(); // Use .select().single() to get the inserted row back

        if (insertError) throw insertError;
        
        // --- FIX: CREATE NOTIFICATIONS ---
        console.log("Creating notifications...")

        // 1. Notify the patient that their request is pending
        await createNotification (
            req.supabase, // Pass the request-scoped supabase client
            userUuid, // The patient's user ID
            'APPOINTMENT_PENDING',
            { 
                date: startTime.toISOString(),
                appointmentId: newAppointment.id 
            }
        );

        // 2. Notify the assigned dentist of the new booking request
        await createNotification(
            req.supabase, // Pass the request-scoped supabase client
            assignedDentistUserId, // The dentist's user ID
            'NEW_BOOKING_REQUEST',
            {
                date: startTime.toISOString(),
                appointmentId: newAppointment.id
            }
        );
        // --- END OF NOTIFICATION ---

        console.log("--- Reservation successful ---");
        res.status(201).json({ message: "Your appointment request has been submitted and is pending approval." });

    } catch (error){
        console.error("!!! RESERVATION CRASH !!!:", error);
        res.status(500).json({message: "An unexpected error occurred on the server.", error: error.message})
    }


}