"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Filter, ArrowUpDown, Search, Trash2, Undo2 } from "lucide-react";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
  type: string;
  status: "Available" | "Unavailable";
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
  const [filterOption, setFilterOption] = useState("");

  // trash modal state
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // error states for add form
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("http://localhost:4000/api/services");
        const data = await res.json();
        if (res.ok && Array.isArray(data.services)) {
          setServices(data.services);
        }
      } catch (err) {
        // handle error
      }
    }
    fetchServices();
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

    const duration = `${hours}h ${minutes}m`;

    // API call to backend
    try {
      const res = await fetch("http://localhost:4000/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim(),
          price: newPrice,
          unit: newUnit,
          duration,
          type: newType,
          status: status ? "Available" : "Unavailable",
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

    // check duplicates excluding current
    const isDuplicate = services.some(
      (s) =>
        s.id !== editingService.id &&
        s.name.toLowerCase() === editingService.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError("A service with this name already exists.");
      return;
    }

    const result = await updateService(editingService);
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
  
  //Update service
  const updateService = async (service: Service) => {
    try {
      const res = await fetch(`http://localhost:4000/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      const result = await res.json();
      return result;
    } catch (err) {
      setError("Failed to update service.");
      return null;
    }
  };

  // archive service (move to trash)
  const archiveService = (service: Service) => {
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    setArchivedServices((prev) => [service, ...prev]);
  };

  // restore service from trash
  const restoreService = (service: Service) => {
    setArchivedServices((prev) => prev.filter((s) => s.id !== service.id));
    setServices((prev) => [service, ...prev]);
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
      if (!filterOption) return true;
      return s.status === filterOption;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      if (sortOption === "lowToHigh") return priceA - priceB;
      if (sortOption === "highToLow") return priceB - priceA;
      return 0;
    });

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Top bar */}
      <section className="w-full max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-dark leading-snug">
          Staff Services
        </h1>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-blue-primary text-white flex items-center gap-2 w-[170px] justify-start"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOption === "lowToHigh"
                  ? "Price: Low to High"
                  : sortOption === "highToLow"
                  ? "Price: High to Low"
                  : "Sort"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("lowToHigh")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("highToLow")}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-blue-primary text-white flex items-center gap-2 w-[150px] justify-start"
              >
                <Filter className="h-4 w-4" />
                {filterOption === "Available"
                  ? "Available"
                  : filterOption === "Unavailable"
                  ? "Unavailable"
                  : "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterOption("")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("Available")}>
                Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterOption("Unavailable")}>
                Unavailable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="bg-white pl-8 w-40 md:w-56"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Trash Button */}
          <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-red-600 text-white flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Trash ({archivedServices.length})
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
                <table className="w-full text-sm text-left mt-4">
                  <thead className="bg-gray-200 text-gray-800">
                    <tr>
                      <th className="px-4 py-2">Service</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Action</th>
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
              <Button className="bg-blue-primary text-white hover:bg-white hover:text-black flex items-center gap-2">
                <Plus className="h-4 w-4" />
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
                <Button onClick={addService} className="bg-blue-600">
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
            <thead className="bg-blue-700 text-white">
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
                  className="border-b last:border-none even:bg-blue-50 cursor-pointer hover:bg-blue-100"
                  onClick={() => openEdit(service)}
                >
                  <td className="px-6 py-3">{service.name}</td>
                  <td className="px-6 py-3">{service.description}</td>
                  <td className="px-6 py-3">₱{service.price}</td>
                  <td className="px-6 py-3">{service.unit}</td>
                  <td className="px-6 py-3">{service.duration}</td>
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
                  <td className="px-6 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ prevents opening edit modal
                        archiveService(service);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
                {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
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
                <label className="font-medium">Estimated Duration *</label>
                <Input
                  value={editingService.duration}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      duration: e.target.value,
                    })
                  }
                />
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
                {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
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
