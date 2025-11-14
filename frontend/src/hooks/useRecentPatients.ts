"use client";

import { useState, useEffect, useCallback } from 'react';

// Define the structure of a patient entry
export type RecentPatient = {
  id: number;
  name: string;
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

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the change happened to our specific key
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          // Update the component's state with the new data
          setPatients(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Failed to parse recent patients from storage event", error);
        }
      }
    };

    // Add the event listener
    window.addEventListener('storage', handleStorageChange);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // This effect runs once to set up the listener.
  // --- END OF FIX ---

  // Function to add a patient to the list
  const addPatient = useCallback((patient: RecentPatient) => {
    if (!patient.id || !patient.name) return;

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