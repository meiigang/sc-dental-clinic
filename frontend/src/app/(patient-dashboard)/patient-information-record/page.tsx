import PersonalInfoForm from "@/components/forms/personalform"
import DentalHistoryForm  from "@/components/forms/dentalHistoryForm"
import MedicalHistoryForm from "@/components/forms/medicalHistoryForm"

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