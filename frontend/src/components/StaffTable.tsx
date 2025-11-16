"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TriangleAlertIcon, CirclePlus, RotateCcw } from "lucide-react"
import { z } from "zod";
import { staffRegistrationSchema } from "@/components/staffForm/schemas";
import StaffRegistrationForm from "@/components/staffForm/StaffRegistrationForm";

type StaffUser = {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  nameSuffix?: string
  email: string
  contactNumber?: string
  status: "active" | "inactive"
}

export default function StaffTable() {
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchStaff = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:4000/api/users?role=staff")
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()
      // Map only needed fields
      const list = Array.isArray(data)
        ? data.map((u) => ({
            id: u.id,
            firstName: u.firstName,
            middleName: u.middleName,
            lastName: u.lastName,
            nameSuffix: u.nameSuffix,
            email: u.email,
            contactNumber: u.contactNumber,
            status: u.status,
          }))
        : []
      setStaff(list)
    } catch (err: any) {
      setError(err.message || "Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const toggleStatus = async (user: StaffUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    setStaff((prev) => prev.map((s) => (s.id === user.id ? { ...s, status: newStatus } : s)))
    try {
      const res = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        throw new Error("Failed to update status")
      }
      toast.success(`Successfully updated staff status to ${newStatus}.`);
    } catch (err: any) {
      setStaff((prev) => prev.map((s) => (s.id === user.id ? { ...s, status: user.status } : s)))
      toast.error("Error updating status. Please try again.");
    }
  }

  const onSubmit = async (values: z.infer<typeof staffRegistrationSchema>) => {
    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role: "staff" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to register new staff");
      }

      const result = await res.json();
      toast.success("Staff account has been registered successfully!");
      fetchStaff();
      setIsDialogOpen(false); // Close dialog on success
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(`Staff account creation failed: ${err.message}`);
    }
  };

  return (
    <div className="mt-6 bg-blue-light p-6 rounded-2xl shadow-md">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Register New Staff Modal */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CirclePlus /> Register New Staff
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-dark">Register New Staff</DialogTitle>
              </DialogHeader>
              <StaffRegistrationForm onSubmit={onSubmit} />
            </DialogContent>
          </Dialog>
          <Button onClick={fetchStaff}>
            <RotateCcw /> Refresh Table
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}      
      {error && (
        <Alert className='bg-destructive dark:bg-destructive/60 text-md text-white w-full mx-auto mb-4'>
          <TriangleAlertIcon />
          <AlertTitle className="font-medium text-left">Error: {error}</AlertTitle>
        </Alert>
      )}
      <div className="overflow-x-auto rounded-2xl border border-blue-accent">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-blue-accent text-blue-dark font-semibold sticky top-0">
              <th className="px-3 py-2 border border-blue-accent">Name</th>
              <th className="px-3 py-2 border border-blue-accent">Email</th>
              <th className="px-3 py-2 border border-blue-accent">Contact</th>
              <th className="px-3 py-2 border border-blue-accent">Status</th>
              <th className="px-3 py-2 border border-blue-accent">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  No staff found.
                </td>
              </tr>
            )}

            {staff.map((u) => (
              <tr key={u.id} className="border-b bg-white text-center">
                <td className="px-3 py-2 border border-blue-accent">
                  {u.firstName} {u.middleName} {u.lastName} {u.nameSuffix}
                </td>
                <td className="px-3 py-2 border border-blue-accent">{u.email}</td>
                <td className="px-3 py-2 border border-blue-accent">{u.contactNumber ?? "—"}</td>
                <td className="px-3 py-2 border border-blue-accent">
                  <span
                    className={`px-2 py-1 rounded-md ${
                      u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 border border-blue-accent">
                  <button
                    onClick={() => toggleStatus(u)}
                    className={`px-3 py-1 rounded-md text-white ${
                      u.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {u.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}