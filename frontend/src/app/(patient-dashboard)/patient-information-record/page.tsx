import PersonalInfoForm from "@/components/patientForms/personalInfoForm"
import DentalHistoryForm  from "@/components/patientForms/dentalHistoryForm"
import MedicalHistoryForm from "@/components/patientForms/medicalHistoryForm"

export default function PatientRecords() {
  return (
    <main>
      <div className="record-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Patient Information Record</h1>
        <PersonalInfoForm/>
        <DentalHistoryForm/>
        <MedicalHistoryForm/>
        </div>
    </main>
  );
}