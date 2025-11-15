"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CirclePlus, Filter, ArrowUpDown, Search, Pencil, Archive, ArchiveX, Undo2 } from "lucide-react";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: number; // Changed to number to store total minutes
  type: string;
  status: "Available" | "Unavailable" | "Archived";
};

const serviceTypes = [
  "Basic Services",
  "Restoration/Prevention",
  "Surgery",
  "Endodontics",
  "Prosthodontics",
  "Orthodontics",
  "Miscellaneous/Adjunct Management",
];

const serviceUnits = [
  "/Arch",
  "/Quadrant",
  "/Tooth",
  "/Pontic",
  "/Clasp",
  "/Carpule",
  "U/L"
];

// --- NEW: Helper function to format minutes into HHh MMm format ---
const formatDuration = (totalMinutes: number | null | undefined): string => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
    return "0h 0m";
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export default function StaffServices() {
  // services state
  const [services, setServices] = useState<Service[]>([]);
  const [archivedServices, setArchivedServices] = useState<Service[]>([]);

  // add form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newType, setNewType] = useState("");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [status, setStatus] = useState(true);

  // edit states
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // search, sort, filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // archive states
  const [showArchiveModal, setShowArchiveModal] = useState(false); // archive service button
  const [isArchiveOpen, setIsArchiveOpen] = useState(false); // archived services modal
  const [serviceToArchive, setServiceToArchive] = useState<Service | null>(null); // service pending archive confirmation

  // error states for add form
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchAllServices() {
      try {
        // Fetch active (non-archived) services
        const activeRes = await fetch("/api/services"); // Use relative path
        const activeData = await activeRes.json();
        if (activeRes.ok && Array.isArray(activeData.services)) {
          setServices(activeData.services);
        }

        // Fetch archived services
        const archivedRes = await fetch("/api/services?status=archived"); // Use relative path
        const archivedData = await archivedRes.json();
        if (archivedRes.ok && Array.isArray(archivedData.services)) {
          setArchivedServices(archivedData.services);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    }
    fetchAllServices();
  }, []);

  const validateAddForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!newName.trim()) newErrors.name = "Please input in this field";
    if (!newType.trim()) newErrors.type = "Please input in this field";
    if (!hours.trim()) newErrors.hours = "Please input in this field";
    if (!minutes.trim()) newErrors.minutes = "Please input in this field";
    if (!newPrice.trim()) newErrors.price = "Please input in this field";
    if (!newUnit.trim()) newErrors.unit = "Please input in this field";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addService = async () => {
    if (!validateAddForm()) return;

    // duplicate check (case-insensitive)
    const isDuplicate = services.some(
      (s) => s.name.toLowerCase() === newName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError("A service with this name already exists.");
      return;
    }

    // --- FIX: Calculate total minutes before sending ---
    const totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);

    // API call to backend
    try {
      const res = await fetch("/api/services", { // Use relative path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          price: newPrice,
          unit: newUnit,
          duration: totalMinutes, // Send total minutes
          type: newType,
          status: status ? "Available" : "Unavailable"
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setServices([result.service, ...services]);
        // reset form
        setNewName("");
        setNewDescription("");
        setNewPrice("");
        setNewUnit("");
        setHours("1");
        setMinutes("0");
        setNewType("");
        setStatus(true);
        setError("");
        setErrors({});
      } else {
        setError(result.message || "Failed to add service.");
      }
    } catch (err) {
      setError("Failed to add service.");
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setIsEditOpen(true);
    setError("");
  };

  const validateEditForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!editingService?.name.trim()) newErrors.name = "Please input in this field";
    if (!editingService?.type.trim()) newErrors.type = "Please input in this field";
    if (
      editingService?.price === undefined ||
      editingService?.price === null ||
      String(editingService.price).trim() === ""
    ) {
      newErrors.price = "Please input in this field";
    }
    if (!editingService?.unit.trim()) newErrors.unit = "Please input in this field";
    if (!editingService?.duration || String(editingService.duration).trim() === "") newErrors.duration = "Please input in this field";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEdit = async () => {
    if (!editingService) return;
    if (!validateEditForm()) return;

    // --- FIX: Check for duplicates in both active and archived services ---
    const combinedServices = [...services, ...archivedServices];
    const isDuplicate = combinedServices.some(
      (s) =>
        s.id !== editingService.id &&
        s.name.toLowerCase() === editingService.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError("A service with this name already exists in active or archived services.");
      return;
    }
    // --- END OF FIX ---

    const result = await updateService({
        ...editingService,
        duration: Number(editingService.duration)
    });

    if (result && result.service) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? result.service : s))
      );
      setIsEditOpen(false);
      setEditingService(null);
      setError("");
    } else {
      setError(result?.message || "Failed to update service.");
    }
  };
  
  //Update service (this function is generic and works for archiving too)
  const updateService = async (service: Partial<Service> & { id: number }) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, { // Use relative path
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      return await res.json();
    } catch (err) {
      setError("Failed to update service.");
      return null;
    }
  };

  // --- FIX: Convert archiveService to an API call ---
  const archiveService = async (service: Service) => {
    const result = await updateService({ id: service.id, status: "Archived" });
    if (result && result.service) {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setArchivedServices((prev) => [result.service, ...prev]);
    } else {
      alert("Failed to archive service.");
    }
  };

  
  const restoreService = async (service: Service) => {
    // When restoring, we'll set it back to 'Available' by default.
    const result = await updateService({ id: service.id, status: "Available" });
    if (result && result.service) {
      setArchivedServices((prev) => prev.filter((s) => s.id !== service.id));
      setServices((prev) => [result.service, ...prev]);
    } else {
      alert("Failed to restore service.");
    }
  };

  // search + filter + sort combined
  const displayedServices = [...services]
    .filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.type.toLowerCase().includes(query) ||
        s.status.toLowerCase().includes(query)
      );
    })
    .filter((s) => {
      if (filterType && filterType !== "All" && s.type !== filterType) return false;
      if (filterStatus && filterStatus !== "All" && s.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      if (sortOption === "lowToHigh") return priceA - priceB; // ascending by price
      if (sortOption === "highToLow") return priceB - priceA; // descending by price
      if (sortOption === "lastAdded") return b.id - a.id; // descending by id
      if (sortOption === "firstAdded") return a.id - b.id; // ascending by id
      return 0;
    });

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Top bar */}
      <section className="w-full max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-blue-dark leading-snug">
          Services
        </h1>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="bg-white">
              <ArrowUpDown />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="lastAdded">Last Added Service</SelectItem>
              <SelectItem value="firstAdded">First Added Service</SelectItem>
              <SelectItem value="lowToHigh">Price: Lowest to Highest</SelectItem>
              <SelectItem value="highToLow">Price: Highest to Lowest</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by Service Type */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white">
              <Filter />
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {serviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter by Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white">
              <Filter />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Unavailable">Unavailable</SelectItem>
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
          
          {/* Archive Button */}
          <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
              >
                <Archive />
                Archive ({archivedServices.length})
              </Button>
            </DialogTrigger>
            <DialogContent
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              max-w-3xl w-full max-h-[90vh] overflow-y-auto 
              bg-white rounded-xl shadow-xl"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-600">
                  Archived Services
                </DialogTitle>
              </DialogHeader>
              {archivedServices.length === 0 ? (
                <p className="text-gray-500">No archived services.</p>
              ) : (
                <table className="bg-blue-light w-full text-sm text-left mt-4">
                  <thead className="bg-blue-primary">
                    <tr>
                      <th className="text-blue-light px-4 py-2">Service</th>
                      <th className="text-blue-light px-4 py-2">Type</th>
                      <th className="text-blue-light px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedServices.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="px-4 py-2">{service.name}</td>
                        <td className="px-4 py-2">{service.type}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="outline"
                            className="cursor-pointer hover:text-green-600"
                            size="sm"
                            onClick={() => restoreService(service)}
                          >
                            <Undo2 className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Service Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-900">
                  Add Service
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Name */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-medium">Name of Service *</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Type *</label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-600 text-sm">{errors.type}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-medium">Estimated Duration *</label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="number"
                      min="0"
                      max="999"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-[100px] text-center"
                    />
                    <span>hours</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="w-[100px] text-center"
                    />
                    <span>minutes</span>
                  </div>
                  {(errors.hours || errors.minutes) && (
                    <p className="text-red-600 text-sm">
                      {errors.hours || errors.minutes}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-medium">Description</label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Price *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="₱0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm">{errors.price}</p>
                  )}
                </div>

                {/* Unit */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Unit *</label>
                  <Select value={newUnit} onValueChange={setNewUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-red-600 text-sm">{errors.unit}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Status *</label>
                  <div className="flex items-center gap-2">
                    <Switch checked={status} onCheckedChange={setStatus} />
                    <span>{status ? "Available" : "Unavailable"}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={addService}>
                  Add Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Table */}
      <section className="w-full max-w-7xl px-6 pb-20">
        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-primary text-white">
              <tr>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Estimated Duration</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b last:border-none even:bg-blue-50 hover:bg-blue-100"
                >
                  <td className="px-6 py-3">{service.name}</td>
                  <td className="px-6 py-3">{service.description}</td>
                  <td className="px-6 py-3">₱{service.price}</td>
                  <td className="px-6 py-3">{service.unit}</td>
                  {/* --- FIX: Use the formatDuration helper function for display --- */}
                  <td className="px-6 py-3">{formatDuration(service.duration)}</td>
                  <td className="px-6 py-3">{service.type}</td>
                  <td
                    className={`px-6 py-3 font-medium ${
                      service.status === "Available"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {service.status}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <Button title="Edit Service" size="sm" className="cursor-pointer" onClick={() => openEdit(service)}>
                      <Pencil />
                    </Button>
                    <Button
                      title="Archive Service"
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer hover:bg-red-700"
                      onClick={() => {
                        setServiceToArchive(service);
                        setShowArchiveModal(true);
                      }}
                    >
                      <ArchiveX />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Archive Service Confirmation Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="w-2xl">
          <DialogHeader>
            <DialogTitle>Archive Service</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to archive this service? The selected service will be removed from view.</div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" className="hover:bg-blue-50" onClick={() => { setServiceToArchive(null); setShowArchiveModal(false); }}>
              {"Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="hover:bg-red-700"
              onClick={() => {
                if (serviceToArchive) {
                  archiveService(serviceToArchive);
                  setServiceToArchive(null);
                }
                setShowArchiveModal(false);
              }}
            >
              {"Yes, archive service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              Edit Service
            </DialogTitle>
          </DialogHeader>

          {editingService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Name */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium">Name of Service *</label>
                <Input
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                />
                {/* --- FIX: Display the correct error message for the name field --- */}
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Type *</label>
                <Select
                  value={editingService.type}
                  onValueChange={(value: string) =>
                  setEditingService({ ...editingService, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium">Estimated Duration (in minutes) *</label>
                <Input
                  type="number"
                  min="0"
                  value={editingService.duration}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      duration: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
                <p className="text-sm text-gray-500">Formatted: {formatDuration(editingService.duration)}</p>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium">Description</label>
                <Textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      price: e.target.value,
                    })
                  }
                  placeholder="₱0.00"
                />
                {/* --- FIX: Display the correct error message for the price field --- */}
                {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Unit *</label>
                <Select
                  value={editingService.unit}
                  onValueChange={(value: string) =>
                    setEditingService({ ...editingService, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-red-600 text-sm">{errors.unit}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Status *</label>
                <div className="flex items-center gap-2">
                  <Switch
                  checked={editingService.status === "Available"}
                  onCheckedChange={(checked: boolean) =>
                    setEditingService({
                    ...editingService,
                    status: checked ? "Available" : "Unavailable",
                    })
                  }
                  />
                  <span>
                  {editingService.status === "Available"
                    ? "Available"
                    : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={saveEdit} className="bg-blue-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
