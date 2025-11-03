'use client'

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const DB_STATUSES = ["pending_approval", "confirmed", "completed", "cancelled", "no_show"] as const;

type Appointment = {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  patient: string;
  service: string;
  price: number;
  status: typeof DB_STATUSES[number];
};

const formatDisplayTime = (appt: Appointment) => {
  if (!appt.startTime || !appt.endTime) return "-";
  const to12 = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${mm.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${to12(appt.startTime)} - ${to12(appt.endTime)}`;
};

const statusClass = (status: Appointment['status']) => {
  switch (status) {
    case "completed":
      return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md";
    default:
      return "text-gray-500";
  }
};

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<"Weekly" | "Monthly" | "Annually">("Weekly");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());

  const rowsPerPage = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return console.error("No auth token found");
      try {
        const res = await fetch("http://localhost:4000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data: Appointment[] = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        alert("Could not load appointment data.");
      }
    };
    fetchAppointments();
  }, []);

  const completedAppointments = useMemo(
    () => appointments.filter((appt) => appt.status === "completed"),
    [appointments]
  );

  // ✅ Filter based on tab (Weekly / Monthly / Annually)
  const filteredAppointments = useMemo(() => {
    const now = new Date(currentDate);

    return completedAppointments.filter((appt) => {
      const apptDate = new Date(appt.date);

      if (activeTab === "Weekly") {
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((day + 6) % 7));
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        return apptDate >= monday && apptDate <= friday;
      }

      if (activeTab === "Monthly") {
        return (
          apptDate.getMonth() === now.getMonth() &&
          apptDate.getFullYear() === now.getFullYear()
        );
      }

      if (activeTab === "Annually") {
        return apptDate.getFullYear() === now.getFullYear();
      }

      return false;
    });
  }, [completedAppointments, activeTab, currentDate]);

  // ✅ Aggregate chart data depending on tab
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredAppointments.forEach((appt) => {
      const d = new Date(appt.date);
      let key = "";

      if (activeTab === "Weekly") {
        // Group by day (e.g., "Oct 28")
        key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } 
      else if (activeTab === "Monthly") {
        // Group by week number of the month
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
        const weekNum = Math.ceil((d.getDate() + firstDay.getDay()) / 7);
        key = `Week ${weekNum}`;
      } 
      else if (activeTab === "Annually") {
        // Group by month (e.g., "Jan", "Feb", ...)
        key = d.toLocaleString("default", { month: "short" });
      }

      grouped.set(key, (grouped.get(key) || 0) + appt.price);
    });

    // Sort weekly by date order, monthly by week number, annual by month order
    let sortedEntries = Array.from(grouped.entries());
    if (activeTab === "Weekly") {
      sortedEntries.sort((a, b) => {
        const da = new Date(`${a[0]} ${currentDate.getFullYear()}`);
        const db = new Date(`${b[0]} ${currentDate.getFullYear()}`);
        return da.getTime() - db.getTime();
      });
    } else if (activeTab === "Monthly") {
      sortedEntries.sort((a, b) => {
        const wa = parseInt(a[0].split(" ")[1]);
        const wb = parseInt(b[0].split(" ")[1]);
        return wa - wb;
      });
    } else if (activeTab === "Annually") {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      sortedEntries.sort((a, b) => months.indexOf(a[0]) - months.indexOf(b[0]));
    }

    return sortedEntries.map(([date, total]) => ({ date, total }));
  }, [filteredAppointments, activeTab, currentDate]);

  // ✅ Compute total
  const totalAmount = useMemo(
    () => filteredAppointments.reduce((sum, a) => sum + a.price, 0),
    [filteredAppointments]
  );

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / rowsPerPage));
  const pagedData = filteredAppointments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleTabChange = (tab: "Weekly" | "Monthly" | "Annually") => {
    setActiveTab(tab);
    setPage(1);
    setCurrentDate(new Date());
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (activeTab === "Weekly") newDate.setDate(currentDate.getDate() - 7);
    if (activeTab === "Monthly") newDate.setMonth(currentDate.getMonth() - 1);
    if (activeTab === "Annually") newDate.setFullYear(currentDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (activeTab === "Weekly") newDate.setDate(currentDate.getDate() + 7);
    if (activeTab === "Monthly") newDate.setMonth(currentDate.getMonth() + 1);
    if (activeTab === "Annually") newDate.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const displayLabel = useMemo(() => {
    const now = new Date();

    if (activeTab === "Weekly") {
      const day = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - ((day + 6) % 7));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      const format = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const currentMonday = new Date(now);
      currentMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const currentFriday = new Date(currentMonday);
      currentFriday.setDate(currentMonday.getDate() + 4);

      const isThisWeek =
        monday.toDateString() === currentMonday.toDateString() &&
        friday.toDateString() === currentFriday.toDateString();

      return `${format(monday)} – ${format(friday)}${isThisWeek ? " (This Week)" : ""}`;
    }

    if (activeTab === "Monthly") {
      return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    }

    return currentDate.getFullYear().toString();
  }, [activeTab, currentDate]);

  return (
    <main className="w-full">
      <section className="sales-container flex flex-col items-center py-20 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-dark">Sales (Completed Appointments)</h1>

        {/* Tabs */}
        <div className="flex gap-3 m-6">
          {["Weekly", "Monthly", "Annually"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => handleTabChange(tab as any)}
            >
              {tab}
            </Button>
          ))}
        </div>

{/* Period Toggle with Dropdown Scroll */}
<div className="flex items-center gap-3 mb-4">
  <Button variant="outline" size="icon" onClick={handlePrev}>
    <ChevronLeft className="h-5 w-5" />
  </Button>

  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="text-lg font-medium text-blue-dark flex items-center gap-2">
        {displayLabel}
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent className="max-h-60 overflow-y-auto">
      {(() => {
        const items: { label: string; date: Date; isThis?: boolean }[] = [];
        const now = new Date();

        // Helper: get week range (Mon–Fri)
        const getWeekRange = (d: Date) => {
          const monday = new Date(d);
          monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
          const friday = new Date(monday);
          friday.setDate(monday.getDate() + 4);
          return { monday, friday };
        };

        const addIfNotExists = (label: string, date: Date, isThis = false) => {
          if (!items.some((i) => i.label === label)) items.push({ label, date, isThis });
        };

        // --- WEEKLY ---
        if (activeTab === "Weekly") {
          completedAppointments.forEach((appt) => {
            const d = new Date(appt.date);
            const { monday, friday } = getWeekRange(d);

            const label = `${monday.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })} – ${friday.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}`;

            addIfNotExists(label, monday);
          });

          // Always include "This Week"
          const { monday: thisMon, friday: thisFri } = getWeekRange(now);
          const thisWeekLabel = `${thisMon.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })} – ${thisFri.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })} (This Week)`;
          addIfNotExists(thisWeekLabel, thisMon, true);
        }

        // --- MONTHLY ---
        else if (activeTab === "Monthly") {
          completedAppointments.forEach((appt) => {
            const d = new Date(appt.date);
            const label = d.toLocaleString("default", { month: "long", year: "numeric" });
            addIfNotExists(label, new Date(d.getFullYear(), d.getMonth(), 1));
          });

          // Always include "This Month"
          const thisMonthLabel = now.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }) + " (This Month)";
          addIfNotExists(
            thisMonthLabel,
            new Date(now.getFullYear(), now.getMonth(), 1),
            true
          );
        }

        // --- ANNUALLY ---
        else {
          completedAppointments.forEach((appt) => {
            const d = new Date(appt.date);
            const label = d.getFullYear().toString();
            addIfNotExists(label, new Date(d.getFullYear(), 0, 1));
          });
        }

        // --- SORT & ORGANIZE ---
        items.sort((a, b) => b.date.getTime() - a.date.getTime());

        const thisItem = items.find((i) => i.isThis);
        const filteredItems = thisItem
          ? [thisItem, ...items.filter((i) => i !== thisItem)]
          : items;

        return filteredItems.map(({ label, date, isThis }, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => setCurrentDate(date)}
            className={
              isThis
                ? "bg-blue-50 text-blue-700 font-medium"
                : "hover:bg-blue-100"
            }
          >
            {label}
          </DropdownMenuItem>
        ));
      })()}
    </DropdownMenuContent>


  </DropdownMenu>

  <Button variant="outline" size="icon" onClick={handleNext}>
    <ChevronRight className="h-5 w-5" />
  </Button>
</div>


        {/* Table */}
        <table className="w-full max-w-6xl text-sm sm:text-base border border-blue-accent rounded-2xl overflow-hidden shadow">
          <thead>
            <tr className="bg-blue-accent text-blue-dark font-semibold">
              <th className="p-3 border border-blue-accent">Date</th>
              <th className="p-3 border border-blue-accent">Time</th>
              <th className="p-3 border border-blue-accent">Patient</th>
              <th className="p-3 border border-blue-accent">Service</th>
              <th className="p-3 border border-blue-accent">Amount Paid</th>
              <th className="p-3 border border-blue-accent">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length > 0 ? (
              pagedData.map((appt) => (
                <tr key={appt.id} className="text-center bg-white hover:bg-blue-100 transition-colors">
                  <td className="p-3 border border-blue-accent">{new Date(appt.date).toLocaleDateString()}</td>
                  <td className="p-3 border border-blue-accent">{formatDisplayTime(appt)}</td>
                  <td className="p-3 border border-blue-accent">{appt.patient}</td>
                  <td className="p-3 border border-blue-accent">{appt.service}</td>
                  <td className="p-3 border border-blue-accent">₱{appt.price.toLocaleString()}</td>
                  <td className="p-3 border border-blue-accent">
                    <span className={statusClass(appt.status)}>Completed</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No completed appointments for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary */}
        <div className="tab-content mt-12 w-full max-w-6xl text-left">
          <h2 className="text-2xl font-semibold mb-4">{activeTab} Sales Overview</h2>
          <p className="text-gray-600 mb-6">Showing only completed appointments for {displayLabel}.</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-3xl font-bold text-blue-dark">
              Total: <span className="text-green-600">₱{totalAmount.toLocaleString()}</span>
            </h3>
            <p className="text-gray-500 text-sm mt-2 sm:mt-0">
              Based on {filteredAppointments.length} completed appointment
              {filteredAppointments.length !== 1 ? "s" : ""}.
            </p>
          </div>

          <div className="bg-white border border-blue-accent rounded-2xl p-6 shadow-sm">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                  <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">
                No sales data available for this period.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}