"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRecentPatients } from '@/hooks/useRecentPatients';

export function RecentPatients() {
  const { patients } = useRecentPatients();

  return (
    <div className="bg-blue-light mt-4 p-6 rounded-2xl shadow-md">
      {patients.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No patients viewed recently.
        </div>
      ) : (
        <ul className="space-y-2 md:space-y-3">
          {patients.map((patient) => {
            const fullName = `${patient.lastName}, ${patient.firstName}`;
            return (
              <li
                key={patient.id}
                className="bg-background rounded-2xl p-2 md:p-3 lg:p-4 flex items-center gap-3 md:gap-4 hover:bg-blue-accent transition-colors"
              >
                <Link 
                  href={`/patient/${patient.id}`} 
                  className="flex items-center gap-3 md:gap-4 w-full"
                >
                  <Image
                    src={patient.profilePicture || "/images/img-profile-default.png"}
                    alt={`${fullName}'s Profile Picture`}
                    className="rounded-2xl object-cover shrink-0"
                    width={60}
                    height={60}
                  />
                  <p className="text-xs md:text-sm lg:text-base truncate">
                    {fullName}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}