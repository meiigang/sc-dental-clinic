"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TriangleAlertIcon, CirclePlus, RotateCcw } from "lucide-react"

type StaffUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  contactNumber?: string
  active?: boolean
  profile_picture?: string
}

export default function StaffTable() {
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/users?role=staff")
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()
      // normalize array shape if API returns { users: [...] }
      const list = Array.isArray(data) ? data : data.users ?? []
      setStaff(list)
    } catch (err: any) {
      setError(err.message || "Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
    // optional: poll every 10s so newly created staff appear without page change
    const id = setInterval(fetchStaff, 10000)
    return () => clearInterval(id)
  }, [])

  const toggleActive = async (user: StaffUser) => {
    const newActive = !user.active
    // optimistic UI update
    setStaff((prev) => prev.map((s) => (s.id === user.id ? { ...s, active: newActive } : s)))
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      })
      if (!res.ok) {
        throw new Error("Failed to update status")
      }
    } catch (err: any) {
      // revert on error
      setStaff((prev) => prev.map((s) => (s.id === user.id ? { ...s, active: user.active } : s)))
      alert("Error updating status. Please try again.")
    }
  }

  return (
    <div className="mt-6 bg-blue-light p-6 rounded-2xl shadow-md">
      <><Toaster /></>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Register New Staff Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <CirclePlus /> Register New Staff
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-dark">Register New Staff</DialogTitle>
              </DialogHeader>

              <form
                className="flex flex-col gap-4 mt-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newUser = {
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    email: formData.get("email"),
                    contactNumber: formData.get("contactNumber"),
                    password: formData.get("password"),
                    role: "staff",
                  };

                  try {
                    const res = await fetch("/api/users", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newUser),
                    });

                    if (!res.ok) throw new Error("Failed to register new staff");

                    const result = await res.json();
                    toast.success(`${result.firstName}'s staff account has been registered!`, {
                      style: {
                        '--normal-bg':
                          'light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))',
                        '--normal-text': 'var(--color-white)',
                        '--normal-border': 'transparent'
                      } as React.CSSProperties
                    })
                    e.currentTarget.reset();
                  } catch (err: any) {
                    console.error("Registration error:", err);
                    toast.error("Staff account creation has failed. Please try again.", {
                      style: {
                        '--normal-bg':
                          'light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))',
                        '--normal-text': 'var(--color-white)',
                        '--normal-border': 'transparent'
                      } as React.CSSProperties
                    })
                  }
                }}
              >
                <div className="grid gap-3">
                  <label className="font-semibold text-blue-dark">First Name</label>
                  <input type="text" name="firstName" className="border border-gray-300 rounded-md px-3 py-2" required />

                  <label className="font-semibold text-blue-dark">Last Name</label>
                  <input type="text" name="lastName" className="border border-gray-300 rounded-md px-3 py-2" required />

                  <label className="font-semibold text-blue-dark">Email</label>
                  <input type="email" name="email" className="border border-gray-300 rounded-md px-3 py-2" required />

                  <label className="font-semibold text-blue-dark">Contact Number</label>
                  <input type="tel" name="contactNumber" className="border border-gray-300 rounded-md px-3 py-2" />

                  <label className="font-semibold text-blue-dark">Password</label>
                  <input type="password" name="password" className="border border-gray-300 rounded-md px-3 py-2" required />

                  <input type="hidden" name="role" value="staff" />

                  <Button type="submit">Create Staff Account</Button>
                </div>
              </form>
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
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
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
                <td className="px-3 py-2">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.contactNumber ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      u.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.active ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleActive(u)}
                    className={`px-3 py-1 rounded-md text-white ${
                      u.active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {u.active ? "Disable" : "Enable"}
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