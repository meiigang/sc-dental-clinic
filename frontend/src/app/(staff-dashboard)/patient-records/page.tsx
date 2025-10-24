"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpDown, Search, CheckIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { set } from "zod"

export default function PatientRecords() {
  const [patients, setPatients] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch patients on mount
  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("http://localhost:4000/api/patients/all");
      const data = await res.json();
      setPatients(data.patients || []);
    }
    fetchPatients();
  }, []);

  const displayedPatients = [...patients]
  // Filter and sort patients function
  .filter((patient) => patient.role === "patient")
  .filter((patient) => {
    const fullName = `${patient.first_name} ${patient.middle_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  })
  .sort((a, b) => {
    if (sortOption === "ascending") {
      return a.last_name.localeCompare(b.last_name);
    }
    if (sortOption === "descending") {
      return b.last_name.localeCompare(a.last_name);
    }
    return 0;
  });
  
  return (
    <main>
      <div className="record-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Patient Records</h1>
        <div className="bg-blue-light rounded-3xl mt-10 w-full max-w-4xl h-full p-10 space-y-8">
          <div className="flex gap-8">
            {/* Sort */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="bg-white">
                <ArrowUpDown />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ascending">Ascending (A-Z)</SelectItem>
                <SelectItem value="descending">Descending (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="bg-white pl-8 w-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Patient List */}
          <div className="h-96 overflow-y-auto">
            {displayedPatients.length === 0 ? (
              <div className="text-center text-gray-500">No patients found.</div>
            ) : (
              <ul className="space-y-4">
                {displayedPatients.map((patient) => (
                  <li
                    key={patient.id}
                    className="bg-background rounded-2xl p-4 flex items-center gap-4 hover:bg-blue-accent"
                  >
                    <Link href={`/patient/${patient.id}`} className="flex items-center gap-4 w-full">
                      <Image
                        src={patient.profile_picture || "/images/img-profile-default.png"}
                        alt="User's Profile Picture"
                        className="rounded-2xl object-cover"
                        width={90}
                        height={90}
                      />
                      <p>
                        {patient.last_name}, {patient.first_name} {patient.middle_name}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}