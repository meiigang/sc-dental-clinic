import { dentalHistorySchema } from "../../utils/middleware/validationSchemas.mjs";

//POST Method
export default async function patientDentalHistoryHandler(req, res) {
    //Log data into console
    console.log("Incoming dental history data:", req.body);

    //Validate request body
    const parseResult = dentalHistorySchema.safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    //Get user input from req body
    const {
        patientId, previousDentist, lastDentalVisit
    } = req.body;

    if (!patientId) {
    return res.status(400).json({ message: "User ID is required."});
    }

    //Insert data values into table
    const { error } = await req.supabase.from("dental_history").insert([
    {
        patient_id: patientId,
        previous_dentist: previousDentist,
        last_dental_visit: lastDentalVisit
    }
    ]); 
    
    if (error) {
        console.log("Insert error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            error: error
        });
        return res.status(500).json({ message: "Failed to insert dental history.",
         });
    }   

    return res.status(201).json({ message: "Dental history created successfully." });
}

//GET Method
export async function getPatientDentalHistory(req, res) {
    //Get user id from url params
    const patientId= req.params.patientId;

    //Error handling
    if (!patientId) {
        return res.status(400).json({message: "Patient ID is required."});
    }

    //Fetch patient info from Supabase
    const { data:dentalHistory, error } = await req.supabase
    .from("dental_history")
    .select("*")
    .eq("patient_id", patientId);

    //Log patient retrieved from database
    console.log("Dental history retrieved: ", dentalHistory)

    //Error handling
     if (error) {
        return res.status(500).json({message: "Database error.", error});
    }

    if (!dentalHistory || dentalHistory.length === 0) {
        return res.status(404).json({message: "No dental history found for this patient."});
    }

    return res.status(200).json({dentalHistory});
}

//PATCH Method
export async function updatePatientDentalHistory(req, res) {
    const dentalHistoryId = req.params.dentalHistoryId;
    if (!dentalHistoryId) {
        return res.status(400).json({ message: "Dental history ID is required." });
    }

    // Validate request body (partial for PATCH)
    const parseResult = dentalHistorySchema.partial().safeParse(req.body);
    if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        return res.status(400).json({ errors: parseResult.error.errors });
    }

    const { previousDentist, lastDentalVisit } = req.body;

    const { error } = await req.supabase
        .from("dental_history")
        .update({
            previous_dentist: previousDentist,
            last_dental_visit: lastDentalVisit
        })
        .eq("id", dentalHistoryId);

    if (error) {
        console.log("Dental history update error:", error);
        return res.status(500).json({ message: "Failed to update dental history.", error });
    }

    return res.status(200).json({ message: "Dental history updated successfully." });
}