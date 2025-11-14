"use client";

import { useState, useEffect, useCallback } from 'react';

// --- FIX: Update the data structure to include more details ---
export type RecentPatient = {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
};

const MAX_RECENT_PATIENTS = 5;
const STORAGE_KEY = 'recentPatients';

export const useRecentPatients = () => {
  const [patients, setPatients] = useState<RecentPatient[]>([]);

  // Load initial patients from localStorage when the hook is first used
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setPatients(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to parse recent patients from localStorage", error);
      setPatients([]);
    }
  }, []);

  // Function to add a patient to the list
  const addPatient = useCallback((patient: RecentPatient) => {
    // Guard against adding patients without essential info
    if (!patient.id || !patient.firstName || !patient.lastName) return;

    const updatedPatients = (currentPatients: RecentPatient[]): RecentPatient[] => {
      // Remove the patient if they already exist to move them to the top
      const filtered = currentPatients.filter(p => p.id !== patient.id);
      // Add the new patient to the beginning of the list
      const newPatients = [patient, ...filtered];
      // Limit the list to the max size
      return newPatients.slice(0, MAX_RECENT_PATIENTS);
    };

    setPatients(prev => {
      const newPatientList = updatedPatients(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPatientList));
      } catch (error) {
        console.error("Failed to save recent patients to localStorage", error);
      }
      return newPatientList;
    });
  }, []);

  return { patients, addPatient };
};