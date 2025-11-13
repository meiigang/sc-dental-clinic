"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpDown, Search, CheckIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { set } from "zod"

export default function PatientRecords() {
  const [patients, setPatients] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState("ascending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PATIENTS_PER_PAGE = 5;

  // Fetch patients on mount
  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("http://localhost:4000/api/patients/all");
      const data = await res.json();
      setPatients(data.patients || []);
    }
    fetchPatients();
  }, []);

  const filteredAndSortedPatients = [...patients]
  // Filter and sort patients function
  .filter((patient) => patient.role === "patient")
  .filter((patient) => {
    const fullName = `${patient.first_name} ${patient.middle_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  })
  .sort((a, b) => {
    return a.last_name.localeCompare(b.last_name);
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedPatients.length / PATIENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PATIENTS_PER_PAGE;
  const displayedPatients = filteredAndSortedPatients.slice(startIndex, startIndex + PATIENTS_PER_PAGE);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption]);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12 lg:py-16">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-dark mb-8 text-center">Patient Records</h1>
      <div className="bg-blue-light rounded-3xl w-full max-w-2xl md:max-w-4xl lg:max-w-5xl flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-6 h-[500px] md:h-[600px] lg:h-[700px]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sort */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="bg-white w-full md:w-auto">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="ascending">Ascending (A-Z)</SelectItem>
              <SelectItem value="descending">Descending (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="bg-white pl-8 w-full md:w-40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="flex flex-col flex-1">
          {displayedPatients.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No patients found.</div>
          ) : (
            <ul className="space-y-2 md:space-y-3">
              {displayedPatients.map((patient) => {
                const fullName = `${patient.last_name}, ${patient.first_name} ${patient.middle_name}`;
                return (
                  <li
                    key={patient.id}
                    className="bg-background rounded-2xl p-2 md:p-3 lg:p-4 flex items-center gap-3 md:gap-4 hover:bg-blue-accent transition-colors"
                  >
                    <Link href={`/patient/${patient.id}`} className="flex items-center gap-3 md:gap-4 w-full">
                      <Image
                        src={patient.profile_picture || "/images/img-profile-default.png"}
                        alt="User's Profile Picture"
                        className="rounded-2xl object-cover flex-shrink-0"
                        width={60}
                        height={60}
                      />
                      <p className="text-xs md:text-sm lg:text-base truncate">
                        {highlightMatch(fullName, searchQuery)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 md:gap-4 pt-4 md:pt-6 border-t">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}