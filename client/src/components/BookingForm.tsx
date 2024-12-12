import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "./LocationAutocomplete";
import BookingFormMap from "./BookingFormMap";

import { BookingFormData } from "@/types/booking";

interface BookingFormProps {
  isAdminForm?: boolean;
  onSuccess?: () => void;
  defaultValues?: BookingFormData;
}

export default function BookingForm({ isAdminForm = false, onSuccess, defaultValues }: BookingFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      serviceType: defaultValues?.serviceType,
      pickupDate: defaultValues?.pickupDate ? new Date(defaultValues.pickupDate) : new Date(),
      pickupTime: defaultValues?.pickupTime || '',
      pickupLocation: defaultValues?.pickupLocation || '',
      dropoffLocation: defaultValues?.dropoffLocation || '',
      passengerFirstName: defaultValues?.passengerFirstName || '',
      passengerLastName: defaultValues?.passengerLastName || '',
      passengerPhone: defaultValues?.passengerPhone || '',
      passengerEmail: defaultValues?.passengerEmail || '',
      companyName: defaultValues?.companyName || '',
      billingContact: defaultValues?.billingContact || '',
      poClientRef: defaultValues?.poClientRef || '',
      vehicleType: defaultValues?.vehicleType || '',
      tripNotes: defaultValues?.tripNotes || '',
      airportCode: defaultValues?.airportCode || '',
      airportName: defaultValues?.airportName || '',
      airlineCode: defaultValues?.airlineCode || '',
      airlineName: defaultValues?.airlineName || '',
      flightNumber: defaultValues?.flightNumber || '',
      additionalRequests: defaultValues?.additionalRequests || [],
      basePrice: defaultValues?.basePrice || "0",
      gratuityFee: defaultValues?.gratuityFee || "0",
      extraStopsFee: defaultValues?.extraStopsFee || "0",
      discount: defaultValues?.discount || "0",
      tolls: defaultValues?.tolls || "0",
      parking: defaultValues?.parking || "0",
      creditCardFee: defaultValues?.creditCardFee || "0",
      paymentsDeposits: defaultValues?.paymentsDeposits || "0",
      tripId: defaultValues?.tripId || ''
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data: BookingFormData) => {
    try {
      const endpoint = isAdminForm ? '/api/admin/bookings' : '/api/passenger/bookings';
      
      // Format the data before submission
      const formattedData = {
        ...data,
        userId: isAdminForm ? parseInt(data.userId as unknown as string) : undefined,
        pickupDate: new Date(data.pickupDate),
        basePrice: data.basePrice.toString(),
        gratuityFee: data.gratuityFee?.toString() || "0",
        extraStopsFee: data.extraStopsFee?.toString() || "0",
        discount: data.discount?.toString() || "0",
        tolls: data.tolls?.toString() || "0",
        parking: data.parking?.toString() || "0",
        creditCardFee: data.creditCardFee?.toString() || "0",
        paymentsDeposits: data.paymentsDeposits?.toString() || "0",
        status: "pending",
        jobStatus: "unassigned",
        paymentStatus: "pending",
        trackingEnabled: false,
        totalFare: (
          parseFloat(data.basePrice) +
          parseFloat(data.gratuityFee || "0") +
          parseFloat(data.extraStopsFee || "0") +
          parseFloat(data.tolls || "0") +
          parseFloat(data.parking || "0") -
          parseFloat(data.discount || "0")
        ).toString()
      };
      
      console.log('Submitting booking data:', formattedData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Booking submission failed:', errorData || await response.text());
        
        toast({
          title: "Error",
          description: errorData?.error || "Failed to submit booking. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      console.log('Booking submission successful:', result);

      toast({
        title: isAdminForm ? "Booking Created" : "Booking Request Received",
        description: isAdminForm ? "New booking has been created successfully." : "We'll confirm your booking shortly.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${isAdminForm ? 'create' : 'submit'} booking request. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Admin Section */}
      {isAdminForm && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Admin Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="userId">Customer ID</Label>
              <Input
                type="number"
                id="userId"
                {...register("userId", { required: true })}
                placeholder="Enter customer ID"
              />
              {errors.userId && (
                <p className="text-sm text-red-500">Customer ID is required</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Passenger Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Passenger Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passengerFirstName">First Name</Label>
            <Input
              type="text"
              id="passengerFirstName"
              {...register("passengerFirstName", { required: true })}
              placeholder="Enter first name"
            />
            {errors.passengerFirstName && (
              <p className="text-sm text-red-500">First name is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="passengerLastName">Last Name</Label>
            <Input
              type="text"
              id="passengerLastName"
              {...register("passengerLastName", { required: true })}
              placeholder="Enter last name"
            />
            {errors.passengerLastName && (
              <p className="text-sm text-red-500">Last name is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="passengerPhone">Phone</Label>
            <Input
              type="tel"
              id="passengerPhone"
              {...register("passengerPhone", { required: true })}
              placeholder="Enter phone number"
            />
            {errors.passengerPhone && (
              <p className="text-sm text-red-500">Phone number is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="passengerEmail">Email</Label>
            <Input
              type="email"
              id="passengerEmail"
              {...register("passengerEmail", { required: true })}
              placeholder="Enter email address"
            />
            {errors.passengerEmail && (
              <p className="text-sm text-red-500">Email is required</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Company Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              type="text"
              id="companyName"
              {...register("companyName")}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <Label htmlFor="billingContact">Billing Contact</Label>
            <Input
              type="text"
              id="billingContact"
              {...register("billingContact")}
              placeholder="Enter billing contact"
            />
          </div>
          <div>
            <Label htmlFor="poClientRef">PO/Client Reference #</Label>
            <Input
              type="text"
              id="poClientRef"
              {...register("poClientRef")}
              placeholder="Enter reference number"
            />
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Service Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={watch('serviceType')}
              onValueChange={(value) => {
                setValue("serviceType", value as BookingFormData['serviceType']);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Service</SelectItem>
                <SelectItem value="point-to-point">Point-to-Point Transfer</SelectItem>
                <SelectItem value="airport">Airport Transfer</SelectItem>
                <SelectItem value="event">Event Transportation</SelectItem>
                <SelectItem value="corporate">Corporate Service</SelectItem>
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-red-500">Please select a service type</p>
            )}
          </div>
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              value={watch('vehicleType')}
              onValueChange={(value) => {
                setValue("vehicleType", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedan">Luxury Sedan</SelectItem>
                <SelectItem value="suv">Premium SUV</SelectItem>
                <SelectItem value="van">Business Van</SelectItem>
                <SelectItem value="sprinter">Sprinter</SelectItem>
              </SelectContent>
            </Select>
            {errors.vehicleType && (
              <p className="text-sm text-red-500">Please select a vehicle type</p>
            )}
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Trip Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupDate">Pick-Up Date</Label>
            <Input
              type="date"
              id="pickupDate"
              {...register("pickupDate", { 
                required: true,
                setValueAs: (value) => {
                  const date = new Date(value);
                  date.setHours(12, 0, 0, 0);
                  return date;
                }
              })}
              min={new Date().toISOString().split('T')[0]}
              value={defaultValues?.pickupDate ? new Date(defaultValues.pickupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const date = new Date(e.target.value);
                date.setHours(12, 0, 0, 0);
                setValue('pickupDate', date);
                console.log('Date changed:', date, date.toISOString());
              }}
            />
            {errors.pickupDate && (
              <p className="text-sm text-red-500">Pick-up date is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="pickupTime">Pick-Up Time</Label>
            <Input
              type="time"
              id="pickupTime"
              {...register("pickupTime", { required: true })}
            />
            {errors.pickupTime && (
              <p className="text-sm text-red-500">Pick-up time is required</p>
            )}
          </div>
          <div className="md:col-span-2">
            <LocationAutocomplete
              label="Pick-Up Location"
              value={watch("pickupLocation")}
              onChange={(value) => setValue("pickupLocation", value)}
              placeholder="Enter pick-up address"
              error={errors.pickupLocation?.message}
            />
          </div>
          <div className="md:col-span-2">
            <LocationAutocomplete
              label="Drop-off Location"
              value={watch("dropoffLocation")}
              onChange={(value) => setValue("dropoffLocation", value)}
              placeholder="Enter drop-off address"
              error={errors.dropoffLocation?.message}
            />
          </div>
          <div className="md:col-span-2">
            <BookingFormMap
              pickupLocation={watch("pickupLocation")}
              dropoffLocation={watch("dropoffLocation")}
              className="w-full h-[400px] rounded-lg overflow-hidden mb-4"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tripNotes">Trip Notes</Label>
            <textarea
              id="tripNotes"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("tripNotes")}
              placeholder="Any additional notes about the trip"
            />
          </div>
        </div>
      </div>

      {/* Airport Information (Conditional) */}
      {watch("serviceType") === "airport" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Flight Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airportCode">Airport Code</Label>
              <Input
                type="text"
                id="airportCode"
                {...register("airportCode")}
                placeholder="e.g., SFO"
              />
            </div>
            <div>
              <Label htmlFor="airportName">Airport Name</Label>
              <Input
                type="text"
                id="airportName"
                {...register("airportName")}
                placeholder="e.g., San Francisco International"
              />
            </div>
            <div>
              <Label htmlFor="airlineCode">Airline Code</Label>
              <Input
                type="text"
                id="airlineCode"
                {...register("airlineCode")}
                placeholder="e.g., UA"
              />
            </div>
            <div>
              <Label htmlFor="flightNumber">Flight Number</Label>
              <Input
                type="text"
                id="flightNumber"
                {...register("flightNumber")}
                placeholder="e.g., UA123"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pricing Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input
              type="number"
              id="basePrice"
              step="0.01"
              {...register("basePrice", { required: true, min: 0 })}
            />
            {errors.basePrice && (
              <p className="text-sm text-red-500">Base price is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="gratuityFee">Gratuity Fee ($)</Label>
            <Input
              type="number"
              id="gratuityFee"
              step="0.01"
              {...register("gratuityFee")}
            />
          </div>
          <div>
            <Label htmlFor="extraStopsFee">Extra Stops Fee ($)</Label>
            <Input
              type="number"
              id="extraStopsFee"
              step="0.01"
              {...register("extraStopsFee")}
            />
          </div>
          <div>
            <Label htmlFor="tolls">Tolls ($)</Label>
            <Input
              type="number"
              id="tolls"
              step="0.01"
              {...register("tolls")}
            />
          </div>
          <div>
            <Label htmlFor="parking">Parking ($)</Label>
            <Input
              type="number"
              id="parking"
              step="0.01"
              {...register("parking")}
            />
          </div>
          <div>
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              type="number"
              id="discount"
              step="0.01"
              {...register("discount")}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
        {isAdminForm ? "Create Booking" : "Request Booking"}
      </Button>
    </form>
  );
}