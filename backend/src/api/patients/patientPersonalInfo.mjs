import { personalInfoSchema } from "../../utils/middleware/validationSchemas.mjs";

//POST Method
export default async function patientPersonalInfoHandler(req, res) {
    //Log data into console
    console.log("Incoming personal info data:", req.body);

    //Validate request body
    const parseResult = personalInfoSchema.safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    //Get user input from request body
    const { 
        userId, nickname, birthDate, age, sex, religion, nationality,
        homeAddress, occupation, dentalInsurance, effectiveDate,
        patientSince, emergencyContactName, emergencyContactOccupation,
        emergencyContactNumber
    } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required."});
    }

    // 1. Insert emergency contact and get its ID
    const { data: emergencyRows, error: emergencyError } = await req.supabase
    .from("emergency_contacts")
    .insert([{
        user_id: userId,
        created_at: new Date().toISOString(),
        name: emergencyContactName,
        occupation: emergencyContactOccupation,
        contact_number: emergencyContactNumber
    }])
    .select();

    if (emergencyError || !emergencyRows || !emergencyRows[0]) {
    console.log("Emergency contact insert error:", emergencyError);
    return res.status(500).json({ message: "Failed to insert emergency contact." });
    }

    const emergencyContactsId = emergencyRows[0].id;

    //Insert patient into table
    const { error: patientError, data: patientRows } = await req.supabase.from("patients").insert([
    {
        user_id: userId,
        birth_date: birthDate,
        sex: sex,
        religion: religion,
        nationality: nationality,
        home_address: homeAddress,
        occupation: occupation,
        dental_insurance: dentalInsurance,
        effective_date: effectiveDate,
        patient_since: patientSince,
        nickname: nickname,
        emergency_contacts_id: emergencyContactsId,
        created_at: new Date().toISOString()
    }
]).select();

if (patientError) {
    console.log("Patient insert error:", patientError);
    return res.status(500).json({ message: "Failed to insert patient record.", error: patientError });
}

console.log("Patient inserted:", patientRows);
return res.status(201).json({ message: "Patient and emergency contact created successfully.", patient: patientRows });
}

//GET Method
export async function getPatientPersonalInfoHandler(req, res) {
    const idFromParam = req.params.userId;

    if (!idFromParam) {
        return res.status(400).json({ message: "An ID is required."});
    }

    const isNumericId = /^\d+$/.test(idFromParam);
    const queryColumn = isNumericId ? 'id' : 'user_id';

    //Fetch patient info using the determined column
    const { data: patient, error: patientError } =  await req.supabase
        .from("patients")
        .select(`
            *,
            emergency_contact:emergency_contacts_id (*)
        `) // --- FIX: Use Supabase to join and nest the emergency contact data ---
        .eq(queryColumn, idFromParam)
        .single();

    console.log(`Fetched patient by ${queryColumn}:`, patient);

    if (patientError || !patient) {
        if (patientError) console.error("Error fetching patient:", patientError.message);
        return res.status(404).json({ message: "Patient not found." });
    }

    // The 'patient' object now contains an 'emergency_contact' object within it.
    return res.status(200).json({ patient }); // --- FIX: Return a single, nested object ---
}

//PATCH Method
export async function updatePatientPersonalInfoHandler(req, res) {
    const idFromParam = req.params.userId;
    if (!idFromParam) {
        return res.status(400).json({ message: "User ID is required." });
    }

    // Validate request body (partial for PATCH)
    const parseResult = personalInfoSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    // Destructure fields
    const {
        nickname, birthDate, age, sex, religion, nationality,
        homeAddress, occupation, dentalInsurance, effectiveDate,
        patientSince, emergencyContactName, emergencyContactOccupation,
        emergencyContactNumber
    } = req.body;

    // --- FIX: Apply the same robust check to the PATCH handler ---
    const isNumericId = /^\d+$/.test(idFromParam);
    const queryColumn = isNumericId ? 'id' : 'user_id';
    // --- END OF FIX ---

    // Get the patient's emergency_contacts_id using the correct column
    const { data: patient, error: patientError } = await req.supabase
        .from("patients")
        .select("emergency_contacts_id")
        .eq(queryColumn, idFromParam) // Use the dynamic queryColumn
        .single();

    if (patientError || !patient) {
        return res.status(404).json({ message: "Patient not found." });
    }

    // Update emergency contact
    if (patient.emergency_contacts_id) {
        await req.supabase
            .from("emergency_contacts")
            .update({
                name: emergencyContactName,
                occupation: emergencyContactOccupation,
                contact_number: emergencyContactNumber
            })
            .eq("id", patient.emergency_contacts_id);
    }

    //Update patient info using the correct column
    const { error: updateError } = await req.supabase
        .from("patients")
        .update({
            birth_date: birthDate,
            sex: sex,
            religion: religion,
            nationality: nationality,
            home_address: homeAddress,
            occupation: occupation,
            dental_insurance: dentalInsurance,
            effective_date: effectiveDate,
            patient_since: patientSince,
            nickname: nickname
        })
        .eq(queryColumn, idFromParam); // Use the dynamic queryColumn

    if (updateError) {
        console.log("Patient update error:", updateError);
        return res.status(500).json({ message: "Failed to update patient record.", error: updateError });
    }

    return res.status(200).json({ message: "Patient and emergency contact updated successfully." });
}
