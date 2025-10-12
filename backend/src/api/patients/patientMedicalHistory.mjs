import { medicalHistorySchema } from "../../utils/middleware/validationSchemas.mjs";

//POST method for new medical record
export default async function patientMedicalHistoryHandler(req, res) {
    console.log("Incoming medical history data:", req.body);

    // Validate request body
    const parseResult = medicalHistorySchema.safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    // Destructure fields
    const {
        patientId,
        physicianName,
        officeAddress,
        specialty,
        officeNumber,
        goodHealth,
        underMedicalTreatment,
        medicalTreatmentCondition,
        hadSurgery,
        surgeryDetails,
        wasHospitalized,
        hospitalizationDetails,
        onMedication,
        medicationDetails,
        usesTobacco,
        usesDrugs,
        allergies,
        bleedingTime,
        isPregnant,
        isNursing,
        isTakingBirthControl,
        bloodType,
        bloodPressure,
        diseases
    } = req.body;

    if (!patientId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    console.log("Payload for medical-history insert:", {
    patient_id: patientId,
    physician_name: physicianName,
    office_address: officeAddress,
    specialty: specialty,
    office_number: officeNumber,
    good_health: goodHealth,
    under_medical_treatment: underMedicalTreatment,
    medical_treatment_condition: medicalTreatmentCondition,
    had_surgery: hadSurgery,
    surgery_details: surgeryDetails,
    was_hospitalized: wasHospitalized,
    hospitalization_details: hospitalizationDetails,
    on_medication: onMedication,
    medication_details: medicationDetails,
    uses_tobacco: usesTobacco,
    uses_drugs: usesDrugs,
    bleeding_time: bleedingTime,
    is_pregnant: isPregnant,
    is_nursing: isNursing,
    is_taking_birth_control: isTakingBirthControl,
    blood_type: bloodType,
    blood_pressure: bloodPressure
});

    // 1. Insert into medical-history table first
    const { data: insertedHistory, error: historyError } = await req.supabase
        .from("medical_history")
        .insert([{
            patient_id: patientId,
            physician_name: physicianName,
            office_address: officeAddress,
            specialty: specialty,
            office_number: officeNumber,
            good_health: goodHealth,
            under_medical_treatment: underMedicalTreatment,
            medical_treatment_condition: medicalTreatmentCondition,
            had_surgery: hadSurgery,
            surgery_details: surgeryDetails,
            was_hospitalized: wasHospitalized,
            hospitalization_details: hospitalizationDetails,
            on_medication: onMedication,
            medication_details: medicationDetails,
            uses_tobacco: usesTobacco,
            uses_drugs: usesDrugs,
            bleeding_time: bleedingTime,
            is_pregnant: isPregnant,
            is_nursing: isNursing,
            is_taking_birth_control: isTakingBirthControl,
            blood_type: bloodType,
            blood_pressure: bloodPressure
        }])
        .select("id") // get the new medical_history_id
        .single();

    if (historyError || !insertedHistory) {
        console.log("Medical history insert error:", {
            error: historyError,
            message: historyError?.message,
            details: historyError?.details,
            hint: historyError?.hint,
            code: historyError?.code,
            payload: {
                patient_id: patientId,
                physician_name: physicianName,
                office_address: officeAddress,
                specialty: specialty,
                office_number: officeNumber,
                good_health: goodHealth,
                under_medical_treatment: underMedicalTreatment,
                medical_treatment_condition: medicalTreatmentCondition,
                had_surgery: hadSurgery,
                surgery_details: surgeryDetails,
                was_hospitalized: wasHospitalized,
                hospitalization_details: hospitalizationDetails,
                on_medication: onMedication,
                medication_details: medicationDetails,
                uses_tobacco: usesTobacco,
                uses_drugs: usesDrugs,
                bleeding_time: bleedingTime,
                is_pregnant: isPregnant,
                is_nursing: isNursing,
                is_taking_birth_control: isTakingBirthControl,
                blood_type: bloodType,
                blood_pressure: bloodPressure
            }
        });
        return res.status(500).json({ message: "Failed to insert medical history.", error: historyError });
}


    const medicalHistoryId = insertedHistory.id;

    // 2. Insert allergies (as array) into medical-allergies table
    if (Array.isArray(allergies) && allergies.length > 0) {
        const { error: allergyError } = await req.supabase
            .from("medical_allergies")
            .insert([{
                medical_history_id: medicalHistoryId,
                allergy: allergies
            }]);
        if (allergyError) {
            console.log("Allergy insert error:", allergyError);
            return res.status(500).json({ message: "Failed to insert allergies." });
        }
    }

    // 3. Insert diseases (as array) into medical-diseases table
    if (Array.isArray(diseases) && diseases.length > 0) {
        const { error: diseaseError } = await req.supabase
            .from("medical_diseases")
            .insert([{
                medical_history_id: medicalHistoryId,
                disease: diseases
            }]);
        if (diseaseError) {
            console.log("Disease insert error:", diseaseError);
            return res.status(500).json({ message: "Failed to insert diseases." });
        }
    }

    return res.status(201).json({ message: "Medical history created successfully." });
}

//GET method for existing medical record
export async function getPatientMedicalHistory(req, res) {
    const patientId = req.params.patientId;

    if (!patientId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    //Fetch the latest medical history record for this patient
    const { data: medicalHistoryArr, error: historyError } = await req.supabase
        .from("medical_history")
        .select("*, id")
        .eq("patient_id", patientId)
        .order("id", { ascending: false })
        .limit(1);

    if (historyError) {
        return res.status(500).json({ message: "Database error.", error: historyError });
    }
    if (!medicalHistoryArr || medicalHistoryArr.length === 0) {
        return res.status(404).json({ message: "No medical history found for this patient." });
    }

    const medicalHistory = medicalHistoryArr[0];

    //Fetch allergies for this medical_history_id
    const { data: allergiesArr, error: allergiesError } = await req.supabase
        .from("medical_allergies")
        .select("allergy")
        .eq("medical_history_id", medicalHistory.id)
        .single();

    // Fetch diseases for this medical_history_id
    const { data: diseasesArr, error: diseasesError } = await req.supabase
        .from("medical_diseases")
        .select("disease")
        .eq("medical_history_id", medicalHistory.id)
        .single();

    // Attach allergies and diseases arrays if found
    medicalHistory.allergies = allergiesArr?.allergy || [];
    medicalHistory.diseases = diseasesArr?.disease || [];

    // Log for debugging
    console.log("Medical history retrieved: ", medicalHistory);

    return res.status(200).json({ medicalHistory });
}

//PATCH method for existing medical record
export async function updatePatientMedicalHistory(req, res) {
    const medicalHistoryId = req.params.medicalHistoryId;
    if (!medicalHistoryId) {
        return res.status(400).json({ message: "Medical history ID is required." });
    }

    // Validate request body (partial for PATCH)
    const parseResult = medicalHistorySchema.partial().safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    // Destructure fields
    const {
        physicianName,
        officeAddress,
        specialty,
        officeNumber,
        goodHealth,
        underMedicalTreatment,
        medicalTreatmentCondition,
        hadSurgery,
        surgeryDetails,
        wasHospitalized,
        hospitalizationDetails,
        onMedication,
        medicationDetails,
        usesTobacco,
        usesDrugs,
        allergies,
        bleedingTime,
        isPregnant,
        isNursing,
        isTakingBirthControl,
        bloodType,
        bloodPressure,
        diseases
    } = req.body;

    // 1. Update medical_history
    const { error: historyError } = await req.supabase
        .from("medical_history")
        .update({
            physician_name: physicianName,
            office_address: officeAddress,
            specialty,
            office_number: officeNumber,
            good_health: goodHealth,
            under_medical_treatment: underMedicalTreatment,
            medical_treatment_condition: medicalTreatmentCondition,
            had_surgery: hadSurgery,
            surgery_details: surgeryDetails,
            was_hospitalized: wasHospitalized,
            hospitalization_details: hospitalizationDetails,
            on_medication: onMedication,
            medication_details: medicationDetails,
            uses_tobacco: usesTobacco,
            uses_drugs: usesDrugs,
            bleeding_time: bleedingTime,
            is_pregnant: isPregnant,
            is_nursing: isNursing,
            is_taking_birth_control: isTakingBirthControl,
            blood_type: bloodType,
            blood_pressure: bloodPressure
        })
        .eq("id", medicalHistoryId);

    if (historyError) {
        console.log("Medical history update error:", historyError);
        return res.status(500).json({ message: "Failed to update medical history.", error: historyError });
    }

    // 2. Update allergies
    if (Array.isArray(allergies)) {
        const { error: allergyError } = await req.supabase
            .from("medical_allergies")
            .update({ allergy: allergies })
            .eq("medical_history_id", medicalHistoryId);
        if (allergyError) {
            console.log("Allergy update error:", allergyError);
            return res.status(500).json({ message: "Failed to update allergies." });
        }
    }

    // 3. Update diseases
    if (Array.isArray(diseases)) {
        const { error: diseaseError } = await req.supabase
            .from("medical_diseases")
            .update({ disease: diseases })
            .eq("medical_history_id", medicalHistoryId);
        if (diseaseError) {
            console.log("Disease update error:", diseaseError);
            return res.status(500).json({ message: "Failed to update diseases." });
        }
    }

    return res.status(200).json({ message: "Medical history updated successfully." });
}