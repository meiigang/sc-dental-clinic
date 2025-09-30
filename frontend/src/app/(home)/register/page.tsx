"use client";
import { useState } from "react";
import MultiStepForm from "@/components/ui/multi-step-form";
import AccountInfoForm from "@/components/patientForms/accountInfoForm";
import PersonalInfoForm from "@/components/patientForms/personalInfoForm";
import DentalHistoryForm from "@/components/patientForms/dentalHistoryForm";
import MedicalHistoryForm from "@/components/patientForms/medicalHistoryForm";


export default function Register() {
  return (
    <main>
      <div className="page-container mx-20 py-20 space-y-6 min-h-screen">
        <div className="page-title flex items-start justify-between">
          <h1 className="text-5xl font-bold text-blue-dark">Register</h1>
        </div>
      </div>
    </main>
  );
}