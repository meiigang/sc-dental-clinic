"use client"
import React, { useEffect, useState } from "react"

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
    <div className="mt-6 bg-white p-4 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-dark">Staff Accounts</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStaff}
            className="px-3 py-1 bg-blue-primary text-white rounded-md hover:bg-blue-dark"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {error && <div className="text-sm text-red-500">Error: {error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
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
              <tr key={u.id} className="border-b">
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