"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AppointmentsTable } from "@/components/appointments-table"
import PersonalInfoForm from "@/components/patientForms/personalInfoForm";
import DentalHistoryForm from "@/components/patientForms/dentalHistoryForm";
import MedicalHistoryForm from "@/components/patientForms/medicalHistoryForm";
import DentalChart from "@/components/dental-chart"
import { useRecentPatients } from "@/hooks/useRecentPatients"; // Import the new hook

export default function PatientRecord() {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [dentalHistory, setDentalHistory] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [fullName, setFullName] = useState("User");
  const [userContact, setUserContact] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState<any>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id;

  const { addPatient } = useRecentPatients(); // Use the hook

  useEffect(() => {
    if (!patientId) return;
    async function fetchAllPatientData() {
      try {
        // Fetch patient profile details for header
        const profileRes = await fetch(`http://localhost:4000/api/patients/${patientId}`);
        const profileData = profileRes.ok ? await profileRes.json() : null;
        setProfileData(profileData);
        if (profileData) {
          setFullName(
            `${profileData.last_name || ''} ${profileData.first_name || ''} ${profileData.middle_name || ''}`.trim()
          );
          setUserContact(profileData.contact_number || "");
          setUserEmail(profileData.email || "");
        } else {
          setFullName("User");
          setUserContact("");
          setUserEmail("");
        }

        // Fetch personal info for form
        const personalRes = await fetch(`http://localhost:4000/api/patients/patientPersonalInfo/${patientId}`);
        const personalData = personalRes.ok ? await personalRes.json() : null;
        setPersonalInfo(personalData);

        if (personalData.patient) {
          const patientName = `${personalData.patient.firstName || ''} ${personalData.patient.lastName || ''}`.trim();
          addPatient({ id: Number(patientId), name: patientName });
        }

        // Fetch dental history
        const dentalRes = await fetch(`http://localhost:4000/api/patients/patientDentalHistory/${patientId}`);
        const dentalData = dentalRes.ok ? await dentalRes.json() : null;
        setDentalHistory(dentalData);

        // Fetch medical history
        const medicalRes = await fetch(`http://localhost:4000/api/patients/patientMedicalHistory/${patientId}`);
        const medicalData = medicalRes.ok ? await medicalRes.json() : null;
        setMedicalHistory(medicalData);
      } catch (err) {
        setFullName("User");
        setUserContact("");
        setUserEmail("");
      }
    }
    fetchAllPatientData();
  }, [patientId, addPatient]); // Add 'addPatient' to dependency array

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  // --- FIX: Dynamically get the year from the fetched data ---
  const patientSinceYear = personalInfo?.patient?.patient_since 
    ? new Date(personalInfo.patient.patient_since).getFullYear() 
    : 'N/A';

  return (
    <main>
      <div className="page-container min-h-screen px-4 sm:px-6 lg:px-12 xl:px-20 py-8 sm:py-12 space-y-12">
        {/* Patient Profile */}
        <div className="w-full max-w-screen-xl mx-auto">
          <p className="text-base sm:text-lg font-medium text-blue-primary">Patient Record</p>
          <h1 className="inline-block whitespace-nowrap text-2xl sm:text-3xl font-bold text-blue-dark">
            {fullName}
          </h1>

          {/* Profile Details */}
          <div className="flex flex-col xl:flex-row justify-between gap-10 mt-8">

            {/* Left side */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 flex-wrap">

              {/* Profile Picture */}
              <div className="flex justify-center sm:justify-start flex-shrink-0">
                <Image
                  src="/images/img-profile-default.png"
                  alt="Default Profile Picture"
                  className="rounded-3xl object-cover"
                  width={250}
                  height={250}
                />
              </div>

              {/* Labels + Values */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 sm:gap-x-6 items-center text-sm sm:text-base">

                {/* Email */}
                <span className="bg-blue-accent px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-medium text-blue-dark truncate">
                  Email Address
                </span>
                <span className="px-3 py-1.5 rounded-2xl font-medium text-dark break-all">
                  {userEmail}
                </span>

                {/* Phone */}
                <span className="bg-blue-accent px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-medium text-blue-dark truncate">
                  Phone Number
                </span>
                <span className="px-3 py-1.5 rounded-2xl font-medium text-dark break-all">
                  {userContact}
                </span>

                {/* Patient Since */}
                <span className="bg-blue-accent px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-medium text-blue-dark truncate">
                  Patient Since
                </span>
                <span className="px-3 py-1.5 rounded-2xl font-medium text-dark">
                  {patientSinceYear}
                </span>

                {/* Status */}
                <span className="bg-blue-accent px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-medium text-blue-dark truncate">
                  Status
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-2xl font-medium ${
                      editingPatient.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {editingPatient.status === "Inactive" ? "Inactive" : "Active"}
                  </span>

                  <Switch
                    checked={editingPatient.status === "Active"}
                    onClick={() => setShowConfirmationModal(true)}
                  />
                </div>

              </div>
            </div>

            {/* Status Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
              <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-dark">
                    Update Patient Status
                  </DialogTitle>

                  <div className="text-sm sm:text-base">
                    Are you sure you want to update the patient's status to{" "}
                    {editingPatient.status}?
                  </div>

                  <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="text-blue-dark hover:bg-blue-50 hover:text-blue-dark"
                      onClick={() => setShowConfirmationModal(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={async () => {
                        const newStatus =
                          editingPatient.status === "Active" ? "inactive" : "active";
                        // PATCH request to backend
                        await fetch(`http://localhost:4000/api/users/${profileData.user_id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: newStatus }),
                        });
                        setEditingPatient({
                          ...editingPatient,
                          status: newStatus === "active" ? "Active" : "Inactive",
                        });
                        setShowConfirmationModal(false);
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Patient Information Record */}
        <div className="w-full max-w-screen-xl mx-auto py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-dark mb-4">
            Patient Information Record
          </h1>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-blue-dark text-lg sm:text-xl font-semibold">
                Personal Information
              </AccordionTrigger>
              <AccordionContent>
                {personalInfo?.patient && (
                  <PersonalInfoForm initialValues={personalInfo.patient} readOnly />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-blue-dark text-lg sm:text-xl font-semibold">
                Dental History
              </AccordionTrigger>
              <AccordionContent>
                {dentalHistory?.dentalHistory && (
                  <DentalHistoryForm
                    initialValues={dentalHistory.dentalHistory[0]}
                    readOnly
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-blue-dark text-lg sm:text-xl font-semibold">
                Medical History
              </AccordionTrigger>
              <AccordionContent>
                {medicalHistory?.medicalHistory && (
                  <MedicalHistoryForm
                    initialValues={medicalHistory.medicalHistory}
                    readOnly
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Appointment History */}
        <div className="max-w-screen-xl mx-auto py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-dark mb-4">
            Appointment History
          </h1>

          {/* Table wrapper */}
          <div className="relative left-1/2 -translate-x-1/2 min-w-[120vw]">
            <AppointmentsTable patientId={patientId} />
          </div>
        </div>

        {/* Dental Chart */}
        <div className="w-full max-w-screen-xl mx-auto py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-dark mb-4">
            Dental Chart
          </h1>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[650px] sm:min-w-[800px]">
              <DentalChart patientId={patientId} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}