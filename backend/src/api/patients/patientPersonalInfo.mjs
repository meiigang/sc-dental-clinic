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
     const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required."});
    }

    //Fetch patient info
    const { data: patient, error: patientError } =  await req.supabase
        .from("patients")
        .select("*")
        .eq("user_id", userId)
        .single();

    // Log what was retrieved from the patients table
    console.log("Fetched patient:", patient);

    if (patientError || !patient) {
        return res.status(404).json({ message: "Patient not found." });
    }

    // Optionally, fetch emergency contact if you want to populate those fields too
    let emergencyContact = null;
    if (patient.emergency_contacts_id) {
        const { data: contact, error: contactError } = await req.supabase
            .from("emergency_contacts")
            .select("*")
            .eq("id", patient.emergency_contacts_id)
            .single();
        if (!contactError && contact) {
            emergencyContact = contact;
        }
    }

    return res.status(200).json({ patient, emergencyContact });
}

//PATCH Method
export async function updatePatientPersonalInfoHandler(req, res) {
    const userId = req.params.userId;
    if (!userId) {
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

    // Update emergency contact
    // Get the patient's emergency_contacts_id
    const { data: patient, error: patientError } = await req.supabase
        .from("patients")
        .select("emergency_contacts_id")
        .eq("user_id", userId)
        .single();

    if (patientError || !patient) {
        return res.status(404).json({ message: "Patient not found." });
    }

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

    //Update patient info
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
        .eq("user_id", userId);

    if (updateError) {
        console.log("Patient update error:", updateError);
        return res.status(500).json({ message: "Failed to update patient record.", error: updateError });
    }

    return res.status(200).json({ message: "Patient and emergency contact updated successfully." });
}
