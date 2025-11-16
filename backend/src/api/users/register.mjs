import bcrypt from "bcrypt";
import { personalInfoSchema } from "../../utils/middleware/validationSchemas.mjs";
import { medicalHistorySchema } from "../../utils/middleware/validationSchemas.mjs";
import { dentalHistorySchema } from "../../utils/middleware/validationSchemas.mjs";

export default async function registerHandler(req, res) {
  console.log("Incoming registration data:", req.body); // Log the data

  //1. ACCOUNT INFO INSERTION

  //Get user input from request body
  const { first_name, last_name, middle_name, suffix, email, contact_number, password, role } = req.body;

  //Check if user already exists in database
  const {data: existing} = await req.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

  if (existing) {
      return res.status(409).json({ message: "User with this email already exists."});
  }

  //Hash user password
  const hashedPassword = await bcrypt.hash(password, 10);

  //Insert user
  const {error} = await req.supabase.from("users").insert([
      {
          lastName: last_name,
          firstName: first_name,
          middleName: middle_name,
          nameSuffix: suffix,
          email,
          contactNumber: contact_number,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          role: role || "patient" //Default user role, staff to change at database directly
      }
  ]);

  if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Registration failed" });
}

res.json({ message: "Registration successful" });

}

//Full registration insertion
export async function fullRegistrationHandler(req, res) {
  const { accountInfo, personalInfo, dentalHistory, medicalHistory } = req.body;

  //1. Create user
  const { data: existingUser } =  await req.supabase
      .from ("users")
      .select("id")
      .eq("email", accountInfo.email)
      .single();

      if(existingUser){
          return res.status(409).json({ message: "User with this email already exists."});    
      }

      const hashedPassword = await bcrypt.hash(accountInfo.password, 10);

      const { data: newUser, error: userError} = await req.supabase
      .from("users")
      .insert({
          lastName: accountInfo.last_name,
          firstName: accountInfo.first_name,
          middleName: accountInfo.middle_name,
          nameSuffix: accountInfo.suffix,
          email: accountInfo.email,
          contactNumber: accountInfo.contact_number,
          password_hash: hashedPassword,
          role: "patient",
      })
      .select("id")
      .single();

      if ( userError ){
        console.error("User creation error:", userError);
        return res.status(500).json({ message: "Registration failed at user creation." });
      }

      const userId = newUser.id;

      //2. Log patient personal info into table
      const { 
        emergencyContactName, 
        emergencyContactOccupation, 
        emergencyContactNumber,
        age,
        birthDate,
        homeAddress,
        dentalInsurance,
        effectiveDate,
        patientSince,
        ...mainPersonalInfo 
      } = personalInfo;

      // Create Emergency Contact FIRST to get its ID
      const { data: newEmergencyContact, error: emergencyContactError } = await req.supabase
        .from("emergency_contacts")
        .insert({
          name: emergencyContactName,
          occupation: emergencyContactOccupation,
          contact_number: emergencyContactNumber,
          user_id: userId
        })
        .select("id")
        .single();

      if (emergencyContactError || !newEmergencyContact) {
        console.error("Emergency contact creation failed: ", emergencyContactError);
        return res.status(500).json({ message: "Registration failed at emergency contact creation." });
      }

      const emergencyContactId = newEmergencyContact.id;

      // Now create the patient with the emergency_contacts_id
      const patientPayload = {
        ...mainPersonalInfo,
        birth_date: birthDate,
        home_address: homeAddress,
        dental_insurance: dentalInsurance,
        effective_date: effectiveDate,
        patient_since: patientSince,
        user_id: userId,
        emergency_contacts_id: emergencyContactId // Provide the required ID
      };

      const { data:patient, error: patientError } = await req.supabase
      .from("patients")
      .insert(patientPayload)
      .select("id")
      .single();

      if (patientError) {
          console.error("Patient creation failed: ", patientError);
          return res.status(500).json({message: "Registration failed at personal info creation."});
      }

      const patientId = patient.id;

      //3. Create Dental History
      const { error: dentalError } = await req.supabase
        .from("dental_history")
        .insert({ 
          previous_dentist: dentalHistory.previousDentist,
          last_dental_visit: dentalHistory.lastDentalVisit,
          patient_id: patientId 
        });

      if (dentalError) {
        console.error("Dental history creation error:", dentalError);
        return res.status(500).json({ message: "Registration failed at dental history creation." });
      }

      // 4. Create Medical History 
      const { allergies, diseases, ...mainMedicalHistory } = medicalHistory;

      // Manually map camelCase from frontend to snake_case for the database
      const medicalHistoryPayload = {
        patient_id: patientId,
        physician_name: mainMedicalHistory.physicianName,
        office_address: mainMedicalHistory.officeAddress,
        specialty: mainMedicalHistory.specialty,
        office_number: mainMedicalHistory.officeNumber,
        good_health: mainMedicalHistory.goodHealth,
        under_medical_treatment: mainMedicalHistory.underMedicalTreatment,
        medical_treatment_condition: mainMedicalHistory.medicalTreatmentCondition,
        had_surgery: mainMedicalHistory.hadSurgery,
        surgery_details: mainMedicalHistory.surgeryDetails,
        was_hospitalized: mainMedicalHistory.wasHospitalized,
        hospitalization_details: mainMedicalHistory.hospitalizationDetails,
        on_medication: mainMedicalHistory.onMedication,
        medication_details: mainMedicalHistory.medicationDetails,
        uses_tobacco: mainMedicalHistory.usesTobacco,
        uses_drugs: mainMedicalHistory.usesDrugs,
        bleeding_time: mainMedicalHistory.bleedingTime,
        is_pregnant: mainMedicalHistory.isPregnant,
        is_nursing: mainMedicalHistory.isNursing,
        is_taking_birth_control: mainMedicalHistory.isTakingBirthControl,
        blood_type: mainMedicalHistory.bloodType,
        blood_pressure: mainMedicalHistory.bloodPressure
      };

      const { data: insertedHistory, error: historyError } = await req.supabase
        .from("medical_history")
        .insert(medicalHistoryPayload)
        .select("id")
        .single();

      if (historyError || !insertedHistory) {
        console.error("Medical history creation error:", historyError);
        return res.status(500).json({ message: "Registration failed at medical history creation." });
      }

      const medicalHistoryId = insertedHistory.id;

      // Insert allergies if they exist
      if (Array.isArray(allergies) && allergies.length > 0) {
        const { error: allergyError } = await req.supabase
          .from("medical_allergies")
          .insert({ 
            medical_history_id: medicalHistoryId, 
            allergy: allergies });
        
            if (allergyError) {
                console.error("Allergy insert error:", allergyError);
                return res.status(500).json({ message: "Failed to insert allergies." });
            }
      }

      // Insert diseases if they exist
      if (Array.isArray(diseases) && diseases.length > 0) {
        const { error: diseaseError } = await req.supabase
          .from("medical_diseases")
          .insert({ 
            medical_history_id: medicalHistoryId, 
            disease: diseases });
        
            if (diseaseError) {
                console.error("Disease insert error:", diseaseError);
                return res.status(500).json({ message: "Failed to insert diseases." });
            }
      }

      res.status(201).json({ message: "Full registration successful." });
}

