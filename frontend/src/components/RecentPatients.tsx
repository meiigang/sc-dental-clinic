"use client";

import Link from 'next/link';
import { useRecentPatients } from '@/hooks/useRecentPatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaUserInjured } from "react-icons/fa";

export function RecentPatients() {
  const { patients } = useRecentPatients();

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-blue-dark">No patients viewed recently.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg ">Recently Viewed Patients</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link href={`/patient/${patient.id}`} className="flex items-center p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FaUserInjured className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium text-blue-500">{patient.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}