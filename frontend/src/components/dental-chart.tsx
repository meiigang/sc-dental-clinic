'use client';

import { useEffect, useState, useMemo } from 'react';
import Odontogram from '@/odontogram/Components/Odontogram';
import { format } from 'date-fns';

type DentalChartProps = {
  patientId: string | number;
};

type ToothHistoryRecord = {
  tooth_number: number;
  condition: string;
  notes: string;
  created_at: string;
  appointment: {
    start_time: string;
    service: {
      service_name: string;
    }
  } | null;
};

export default function DentalChart({ patientId }: DentalChartProps) {
  const [chartHistory, setChartHistory] = useState<ToothHistoryRecord[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchChartHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        // This endpoint should fetch all tooth_conditions for the patient
        const response = await fetch(`/api/patients/${patientId}/chart-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dental chart history.');
        }
        const data: ToothHistoryRecord[] = await response.json();
        setChartHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartHistory();
  }, [patientId]);

  // Process the flat history array into a format for the Odontogram
  const odontogramInitialData = useMemo(() => {
    return chartHistory.reduce((acc, record) => {
      const { tooth_number, condition, notes } = record;
      if (!acc[tooth_number]) {
        acc[tooth_number] = { conditions: [], notes: '' };
      }
      if (condition && !acc[tooth_number].conditions.includes(condition)) {
        acc[tooth_number].conditions.push(condition);
      }
      if (notes) {
        acc[tooth_number].notes = notes; // Overwrites with the latest note, can be improved if needed
      }
      return acc;
    }, {} as any);
  }, [chartHistory]);

  // Filter history for the currently selected tooth
  const selectedToothHistory = useMemo(() => {
    if (!selectedTooth) return [];
    return chartHistory.filter(record => record.tooth_number === selectedTooth);
  }, [chartHistory, selectedTooth]);

  if (isLoading) {
    return <div className="text-center p-8">Loading Dental Chart...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-primary p-4 md:p-8 h-auto space-y-8">
      <div className="flex flex-col lg:flex-row gap-4 justify-between h-full">
        <Odontogram
          initialData={odontogramInitialData}
          onToothSelect={setSelectedTooth} // Use a new prop for selection
          readOnly={true} // Put Odontogram in read-only mode
        />
        {selectedTooth && (
          <div className="bg-blue-light rounded-xl p-4 md:p-8 flex flex-col h-full w-full lg:w-120">
            <h3 className="text-blue-dark text-lg font-bold mb-4">History for Tooth {selectedTooth}</h3>
            <div className="grow overflow-y-auto pr-2 space-y-4">
              {selectedToothHistory.length > 0 ? (
                selectedToothHistory.map((record, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-semibold text-blue-dark">{record.condition}</p>
                    {record.notes && <p className="text-sm text-gray-600 italic">"{record.notes}"</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Logged on: {format(new Date(record.created_at), 'MMMM d, yyyy')}
                    </p>
                    {record.appointment && (
                       <p className="text-xs text-gray-500">
                         During: {record.appointment.service.service_name}
                       </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No specific history recorded for this tooth.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}