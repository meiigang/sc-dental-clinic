"use client";

import { useState } from "react";
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
import { Plus, Filter, ArrowUpDown, Search } from "lucide-react";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  type: string;
  status: "Available" | "Unavailable";
};

export default function StaffServices() {
  // services state
  const [services, setServices] = useState<Service[]>([]);

  // add form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
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
  const [error, setError] = useState("");

  const addService = () => {
    if (!newName.trim() || !newPrice.trim() || !newType) return;

    // duplicate check (case-insensitive)
    const isDuplicate = services.some(
      (s) => s.name.toLowerCase() === newName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError("A service with this name already exists.");
      return;
    }

    const duration = `${hours}h ${minutes}m`;

    const newService: Service = {
      id: Date.now(),
      name: newName.trim(),
      description: newDescription.trim(),
      price: newPrice,
      duration,
      type: newType,
      status: status ? "Available" : "Unavailable",
    };

    setServices([newService, ...services]);

    // reset form
    setNewName("");
    setNewDescription("");
    setNewPrice("");
    setHours("1");
    setMinutes("0");
    setNewType("");
    setStatus(true);
    setError("");
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setIsEditOpen(true);
    setError("");
  };

  const saveEdit = () => {
    if (!editingService) return;

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

    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? editingService : s))
    );

    setIsEditOpen(false);
    setEditingService(null);
    setError("");
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
    <main className="bg-blue-100 min-h-screen flex flex-col items-center">
      {/* Top bar */}
      <section className="w-full max-w-7xl px-6 py-10 flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 leading-snug">
            Staff Services
          </h1>
        </div>

        <div className="md:w-1/2 flex justify-center md:justify-end">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
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
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterOption("")}>
                  All
                </DropdownMenuItem>
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
                className="pl-8 w-40 md:w-56"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add Service Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-full">
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
                    {error && (
                      <p className="text-red-600 text-sm mt-1">{error}</p>
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
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
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
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Status *</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={status}
                        onCheckedChange={setStatus}
                      />
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
                <th className="px-6 py-3">Estimated Duration</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Service Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl w-full">
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
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Type *</label>
                <Select
                  value={editingService.type}
                  onValueChange={(value) =>
                    setEditingService({ ...editingService, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Status *</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.status === "Available"}
                    onCheckedChange={(checked) =>
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
