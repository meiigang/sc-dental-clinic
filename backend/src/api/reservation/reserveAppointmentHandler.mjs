import { format, parse, addMinutes } from 'date-fns';
import { parse as parseUTC } from 'date-fns/fp';

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

        // FIX: Treat the incoming date and time as UTC to avoid timezone shifts.
        const appointmentDateStr = format(new Date(appointment_date), 'yyyy-MM-dd');
        const dateTimeStringUTC = `${appointmentDateStr}T${appointment_time}:00.000Z`;
        const startTime = new Date(dateTimeStringUTC);
        const endTime = addMinutes(startTime, service.estimated_duration);

        const { data: dentists, error: dentistsError} = await req.supabase.from("users").select("id").eq("role", "dentist");
        if (dentistsError) throw dentistsError;
        console.log("Dentists found:", dentists);
        const dentistUserIds = dentists.map(d => d.id);

        // --- FIX: Correctly get staff IDs (bigint) for the dentist UUIDs ---
        const { data: staffRecords, error: staffRecordsError } = await req.supabase
            .from("staff")
            .select("id")
            .in("user_id", dentistUserIds);
        if (staffRecordsError) throw staffRecordsError;
        const dentistStaffIds = staffRecords.map(s => s.id);

        // --- FIX: Use the correct staff IDs (bigint) to find conflicts ---
        const { data: conflictingAppointments, error: appointmentsError} = await req.supabase
            .from("appointments")
            .select("staff_id")
            .in("staff_id", dentistStaffIds)
            .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`);
        if (appointmentsError) throw appointmentsError;
        console.log("Conflicting appointments:", conflictingAppointments);

        const bookedStaffIds = conflictingAppointments.map(a => a.staff_id);
        const availableStaffId = dentistStaffIds.find(id => !bookedStaffIds.includes(id));

        if (!availableStaffId) {
            return res.status(409).json({ message: "Sorry, no dentists are available at this time slot." });
        }
        
        // --- Log 5: Check before final insert ---
        console.log("Attempting to insert appointment...");
        const { error: insertError } = await req.supabase.from("appointments").insert({
            patient_id: patientIdToInsert, 
            staff_id: availableStaffId, 
            service_id: service_id,
            start_time: startTime.toISOString(), // This will now be the correct UTC time
            end_time: endTime.toISOString(),
            status: 'pending_approval'
        });
        if (insertError) throw insertError;

        console.log("--- Reservation successful ---");
        res.status(201).json({ message: "Your appointment request has been submitted and is pending approval." });

    } catch (error){
        console.error("!!! RESERVATION CRASH !!!:", error);
        res.status(500).json({message: "An unexpected error occurred on the server.", error: error.message})
    }
}