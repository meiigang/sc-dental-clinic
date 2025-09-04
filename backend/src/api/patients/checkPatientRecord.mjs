export default async function checkPatientRecordHandler (req, res) {
    const userId = req.params.userId; //Check user ID

    if (!userId){
        return res.status(400).json({ hasPatientRecord: false, message: "User ID is required."});
    }

    const { data: patient, error} = await req.supabase
        .from("patients")
        .select("*")
        .eq("user_id", userId)
        .single();

    //Log query result
    console.log("Patient record check:", userId, "| Found:", !!patient, "| Error:", error);

    if (error || !patient) {
        return res.json({ hasPatientRecord: false, message: "No patient record found. Please"})
    }
    
    return res.json({ hasPatientRecord: true});
}