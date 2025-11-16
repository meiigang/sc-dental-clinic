'use client'

import { useState, useEffect, useRef } from "react" // --- Add useRef
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Service = {
  id: number;
  service_name: string;
  price: number;
};

type Item = {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: number;
};

type Patient = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

type SalesBillingProps = {
  patient: Patient;
  onUpdate: (data: any) => void;
  initialService?: Service | null; // --- NEW: Accept an initial service prop
};

export default function SalesBilling({ patient, onUpdate, initialService }: SalesBillingProps) {
  // --- FIX: Use a function to initialize state based on the initialService prop ---
  const [items, setItems] = useState<Item[]>(() => {
    if (initialService) {
      return [{
        id: 1, // A temporary ID for the first item
        description: initialService.service_name,
        quantity: 1,
        unit_price: initialService.price,
        service_id: initialService.id
      }];
    }
    // Default to a blank item if no initial service is provided
    return [{ id: 1, description: "", quantity: 1, unit_price: 0 }];
  });

  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount'); // State for discount type
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [services, setServices] = useState<Service[]>([]);
  const isInitialMount = useRef(true); // --- Add a ref to track the initial render
  
  // --- NEW: State for conditional payment fields ---
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });

  // Fetch services for the autocomplete
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        // --- FIX: Use the new, dedicated endpoint for billing services ---
        const response = await fetch('/api/services/billing', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Since this endpoint returns a direct array, we can set it directly.
          if (Array.isArray(data)) {
            setServices(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);

  const customerName = `${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim();
  const invoiceDate = new Date().toISOString().split('T')[0];

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * 0.10;
  
  // --- FIX: Calculate discount based on type (amount or percentage) ---
  const calculatedDiscountAmount = discountType === 'percentage'
    ? subtotal * (discount / 100)
    : discount;
  
  const totalAmount = subtotal + taxAmount - calculatedDiscountAmount;

  // Update parent component whenever data changes
  useEffect(() => {
    // --- FIX: Prevent this hook from running on the very first render ---
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // We still need to set the initial data, but we do it once.
      onUpdate({
        invoiceDate,
        items: items.map(({ id, ...rest }) => rest),
        subtotal,
        taxAmount,
        discountAmount: calculatedDiscountAmount,
        totalAmount,
        modeOfPayment,
        ...paymentDetails
      });
    } else {
      // On subsequent changes (like changing quantity), update the parent.
      onUpdate({
        invoiceDate,
        items: items.map(({ id, ...rest }) => rest),
        subtotal,
        taxAmount,
        discountAmount: calculatedDiscountAmount,
        totalAmount,
        modeOfPayment,
        ...paymentDetails
      });
    }
  }, [items, discount, discountType, modeOfPayment, paymentDetails, onUpdate, invoiceDate, subtotal, taxAmount, totalAmount, calculatedDiscountAmount]);

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleServiceSelect = (index: number, service: Service) => {
    const newItems = [...items];
    newItems[index].description = service.service_name;
    newItems[index].unit_price = service.price;
    newItems[index].service_id = service.id;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Label htmlFor="customerName">Customer Name</Label>
          <Input id="customerName" value={customerName} readOnly className="mt-1 bg-gray-100" />
        </div>
        <div>
          <Label htmlFor="invoiceDate">Date</Label>
          <Input id="invoiceDate" type="date" value={invoiceDate} readOnly className="mt-1 bg-gray-100" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 font-bold">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Line Total</div>
          <div className="col-span-1"></div>
        </div>
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-5">
              <ServiceCombobox
                services={services}
                value={item.description}
                onSelect={(service) => handleServiceSelect(index, service)}
              />
            </div>
            <div className="col-span-2">
              <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} min="1" />
            </div>
            <div className="col-span-2">
              {/* --- FIX: Make the price input read-only and style it as disabled --- */}
              <Input type="number" value={item.unit_price} readOnly className="bg-gray-100" />
            </div>
            <div className="col-span-2">
              <Input value={(item.quantity * item.unit_price).toFixed(2)} readOnly className="bg-gray-100" />
            </div>
            <div className="col-span-1">
              <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                <span className="text-red-500">X</span>
              </Button>
            </div>
          </div>
        ))}
        <Button variant="link" onClick={addItem}>+ Add item</Button>
      </div>

      <div className="flex justify-between">
        {/* --- FIX: Discount input with type selector --- */}
        <div className="space-y-2">
          <Label>Discount</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
              className="w-24" 
            />
            <RadioGroup value={discountType} onValueChange={(value) => setDiscountType(value as any)} className="flex gap-2">
              <div className="flex items-center space-x-1"><RadioGroupItem value="amount" id="amount" /><Label htmlFor="amount">Amt</Label></div>
              <div className="flex items-center space-x-1"><RadioGroupItem value="percentage" id="percentage" /><Label htmlFor="percentage">%</Label></div>
            </RadioGroup>
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="flex justify-between gap-4"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between gap-4"><span>Tax (10%)</span><span>{taxAmount.toFixed(2)}</span></div>
          <div className="flex justify-between gap-4"><span>Discount</span><span>-{calculatedDiscountAmount.toFixed(2)}</span></div>
          <hr />
          <div className="flex justify-between gap-4 font-bold"><span>Total</span><span>{totalAmount.toFixed(2)}</span></div>
        </div>
      </div>

      <div>
        <Label>Mode of Payment</Label>
        <RadioGroup value={modeOfPayment} onValueChange={setModeOfPayment} className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2"><RadioGroupItem value="Cash" id="cash" /><Label htmlFor="cash">Cash</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="Debit Card" id="debit" /><Label htmlFor="debit">Debit Card</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="Credit Card" id="credit" /><Label htmlFor="credit">Credit Card</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="other" /><Label htmlFor="other">Other</Label></div>
        </RadioGroup>
      </div>

      {/* --- NEW: Conditional fields for card payments --- */}
      {(modeOfPayment === 'Debit Card' || modeOfPayment === 'Credit Card') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={paymentDetails.bankName} onChange={e => setPaymentDetails({...paymentDetails, bankName: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" value={paymentDetails.accountName} onChange={e => setPaymentDetails({...paymentDetails, accountName: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" value={paymentDetails.accountNumber} onChange={e => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})} />
          </div>
        </div>
      )}
    </div>
  )
}

// Service Combobox Component
function ServiceCombobox({ services, value, onSelect }: { services: Service[], value: string, onSelect: (service: Service) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? services.find((s) => s.service_name === value)?.service_name : "Select service..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search service..." />
          <CommandList>
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {/* --- FIX: Filter out any services that don't have a service_name before mapping --- */}
              {services.filter(service => service && service.service_name).map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.service_name}
                  onSelect={(currentValue) => {
                    const selectedService = services.find(s => s.service_name?.toLowerCase() === currentValue.toLowerCase());
                    if (selectedService) {
                      onSelect(selectedService);
                    }
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === service.service_name ? "opacity-100" : "opacity-0")} />
                  {service.service_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}





