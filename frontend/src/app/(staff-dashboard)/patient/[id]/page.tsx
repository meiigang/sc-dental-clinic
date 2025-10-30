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

export default function PatientRecord() {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [dentalHistory, setDentalHistory] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [fullName, setFullName] = useState("User");
  const [userContact, setUserContact] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editingPatient, setEditingPatient] = useState<any>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id;

  useEffect(() => {
    if (!patientId) return;
    async function fetchAllPatientData() {
      try {
        // Fetch patient profile details for header
        const profileRes = await fetch(`http://localhost:4000/api/patients/${patientId}`);
        const profileData = profileRes.ok ? await profileRes.json() : null;
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
  }, [patientId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login");
  }

  return (
    <main>
      <div className="page-container px-50 py-20 space-y-6 min-h-screen">
        {/* Patient Profile */}
        <div className="justify-center">
          <p className="text-lg font-medium text-blue-primary">Patient Record</p>
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark">{fullName}</h1>

          {/* Profile Details*/}
          <div className="flex gap-90 mt-8">
            <div className="flex flex-row gap-4">
              {/* Profile Detail Labels */}
              <div className="flex flex-col gap-4">
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Email Address</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Phone Number</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Patient Since</span>
                <span className="bg-blue-accent px-4 py-2 rounded-2xl font-medium text-blue-dark whitespace-nowrap">Status</span>
              </div>
              {/* Profile Key Values*/}
              <div className="flex flex-col gap-4">
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userEmail}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">{userContact}</span>
                <span className="px-4 py-2 rounded-2xl font-medium text-dark">year</span>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-2xl font-medium ${
                    editingPatient.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                  }`}>
                    {editingPatient.status === "Inactive"
                      ? "Inactive"
                      : "Active"}
                  </span>
                  <Switch
                    checked={editingPatient.status === "Active"}
                    onClick={() => setShowConfirmationModal(true)}
                  />
                </div>
              </div>
            </div>

            {/* Update Patient Status Confirmation Modal */}
            <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
              <DialogContent className="w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-dark">Update Patient Status</DialogTitle>
                  <div>Are you sure you want to update the patient's status to {editingPatient.status}?</div>
                  <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="text-blue-dark hover:bg-blue-50 hover:text-blue-dark"
                      onClick={() => setShowConfirmationModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingPatient({
                          ...editingPatient,
                          status: editingPatient.status === "Active" ? "Inactive" : "Active",
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

            {/* Profile Picture */}
            <div className="justify-end">
              <Image
                src="/images/img-profile-default.png"
                alt="Default Profile Picture"
                className="rounded-3xl object-cover"
                width={210}
                height={210}
              />
            </div>  
          </div> 
        </div>

        {/* Patient Information Record */}
        <div className="py-20">
          <h1 className="inline-block whitespace-nowrap text-3xl font-bold text-blue-dark mb-4">Patient Information Record</h1>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Personal Information</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {personalInfo && personalInfo.patient && (
                  <PersonalInfoForm initialValues={personalInfo.patient[0]} readOnly={true} />
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Dental History</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {dentalHistory && dentalHistory.dentalHistory && (
                  <DentalHistoryForm initialValues={dentalHistory.dentalHistory[0]} readOnly={true} />
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-blue-dark text-xl font-semibold">Medical History</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                {medicalHistory && medicalHistory.medicalHistory && (
                  <MedicalHistoryForm initialValues={medicalHistory.medicalHistory[0]} readOnly={true} />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Appointments Table */}
        <div className="py-20">
          <h1 className="text-3xl font-bold text-blue-dark">Appointment History</h1>
          <AppointmentsTable />
        </div>

        {/* Dental Chart */}
        <div className="py-20">
          <h1 className="text-3xl font-bold text-blue-dark mb-4">Dental Chart</h1>
          <DentalChart />
        </div>
      </div>
    </main>
  );
}