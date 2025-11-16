"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { jwtDecode } from 'jwt-decode'; // Make sure this is installed (npm install jwt-decode)
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReceiptView from "@/components/ReceiptView"; // Import the new component

// Updated type to match the backend summary
type BillingRecord = {
  id: string; // Invoice ID
  invoice_date: string;
  appointment_time: string;
  service_names: string;
  mode_of_payment: string;
  total_amount: number;
};

export default function BillingHistoryPage() {
  const [history, setHistory] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [viewRecordId, setViewRecordId] = useState<string | null>(null);

  const [calendarView, setCalendarView] = useState<"day" | "month" | "year">("day");
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Fetch data from the backend instead of using placeholders
  useEffect(() => {
    const fetchBillingHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- FIX: Get user ID from token and send it in the URL ---
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            throw new Error("You are not logged in.");
        }

        // Define the shape of your custom token
        type CustomToken = {
            id: string; // This is the user's UUID
            [key: string]: any;
        }

        const decoded: CustomToken = jwtDecode(token);
        const userId = decoded.id; // Get the user's UUID from the token

        if (!userId) {
            throw new Error("Could not find User ID in your session token.");
        }

        // The URL now includes the user's UUID. No auth header is needed.
        const response = await fetch(`/api/patients/billing-history/${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch billing history.');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBillingHistory();
  }, []);

  const calendarYears = useMemo(() => {
    const y: number[] = [];
    for (let i = new Date().getFullYear(); i >= 2000; i--) y.push(i);
    return y;
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());
    return sorted.filter((item) => {
      const matchesSearch = item.service_names.toLowerCase().includes(search.toLowerCase())
        || item.mode_of_payment.toLowerCase().includes(search.toLowerCase());

      const itemDate = new Date(item.invoice_date);
      const itemYear = String(itemDate.getFullYear());
      const itemMonth = itemDate.getMonth();

      const matchesYear = selectedYear ? itemYear === selectedYear : true;
      const matchesMonth = selectedMonth !== "" ? itemMonth === selectedMonth : true;
      const matchesDate = selectedDate
        ? format(itemDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
        : true;

      return matchesSearch && matchesYear && matchesMonth && matchesDate;
    });
  }, [history, search, selectedDate, selectedYear, selectedMonth]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-screen h-screen overflow-y-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-primary mb-4">Billing History</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search service or payment method"
          className="w-full px-3 py-2 rounded-md border focus:ring focus:ring-blue-primary outline-none"
        />

        {/* Year → Month → Day Picker */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between w-full">
                {selectedDate
                  ? format(selectedDate, "MMMM dd yyyy")
                  : selectedMonth !== ""
                  ? `${months[selectedMonth]} ${selectedYear || ""}`
                  : selectedYear
                  ? selectedYear
                  : "Filter by year/month/date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-2 w-80">
              {/* Header */}
              <div className="flex justify-between items-center px-2 py-1 mb-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => setCalendarView("year")}
                >
                  {calendarYear}
                </Button>
                {calendarView === "day" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                    onClick={() => setCalendarView("month")}
                  >
                    {months[calendarMonth]}
                  </Button>
                )}
              </div>

              {/* Year Picker */}
              {calendarView === "year" && (
                <div className="grid grid-cols-4 gap-2">
                  {calendarYears.map((y) => (
                    <Button
                      key={y}
                      variant={selectedYear === String(y) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedYear(String(y));
                        setCalendarYear(y);
                        setCalendarView("month");
                      }}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              )}

              {/* Month Picker */}
              {calendarView === "month" && (
                <div className="grid grid-cols-3 gap-2">
                  {months.map((m, idx) => (
                    <Button
                      key={m}
                      variant={selectedMonth === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedMonth(idx);
                        setCalendarMonth(idx);
                        setCalendarView("day");
                      }}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              )}

              {/* Day Calendar */}
              {calendarView === "day" && (
                <ShadcnCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                        if (!d) return; // guard
                        setSelectedDate(d);
                        setPage(1);
                    }}
                    defaultMonth={new Date(calendarYear, calendarMonth)}
                    onMonthChange={(d: Date | undefined) => {
                        if (!d) return; // guard
                        const newDate = d as Date; // assert non-undefined
                        setCalendarYear(newDate.getFullYear());
                        setCalendarMonth(newDate.getMonth());
                        setSelectedYear(String(newDate.getFullYear()));
                        setSelectedMonth(newDate.getMonth());
                        setSelectedDate(undefined);
                        setPage(1);
                    }}
                    className="w-full"
                />
              )}
            </PopoverContent>
          </Popover>

          {(selectedDate || selectedMonth !== "" || selectedYear !== "") && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDate(undefined);
                setSelectedMonth("");
                setSelectedYear("");
                setPage(1);
              }}
            >
              Undo
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-primary text-blue-light">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-6">Loading history...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="text-center py-6 text-red-500">{error}</td></tr>
            ) : paginated.length > 0 ? (
              paginated.map((entry) => (
                <tr key={entry.id} className={`${paginated.indexOf(entry) % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b`}>
                  <td className="px-4 py-3">{format(new Date(entry.invoice_date), "MMMM dd yyyy")}</td>
                  <td className="px-4 py-3">{entry.appointment_time}</td>
                  <td className="px-4 py-3">{entry.service_names}</td>
                  <td className="px-4 py-3">{entry.mode_of_payment}</td>
                  <td className="px-4 py-3 text-right">₱{entry.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Dialog onOpenChange={(open) => !open && setViewRecordId(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setViewRecordId(entry.id)}>View</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader><DialogTitle>Receipt Details</DialogTitle></DialogHeader>
                        {viewRecordId && <ReceiptView invoiceId={viewRecordId} />}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No billing records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filtered.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
