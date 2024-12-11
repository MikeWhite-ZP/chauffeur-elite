import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type InsertBooking } from "@db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadScript } from "@react-google-maps/api";
import LocationAutocomplete from "./LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { useState } from "react";

const timeSchema = z.object({
  hour: z.string().min(1, "Hour is required"),
  minute: z.string().min(1, "Minute is required"),
  period: z.string().min(1, "AM/PM is required"),
});

const destinationSchema = z.object({
  from: z.string().min(1, "From address is required"),
  to: z.string().min(1, "To address is required"),
  date: z.string().min(1, "Date is required"),
  time: timeSchema,
  stop: z.string().optional(),
});

const hourlySchema = z.object({
  from: z.string().min(1, "From address is required"),
  duration: z.string().min(1, "Duration is required"),
  date: z.string().min(1, "Date is required"),
  time: timeSchema,
});

// Explicitly type the libraries array
type Libraries = ("places")[];

export default function BookingWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState<string[]>([]);
  const [showStopInput, setShowStopInput] = useState(false);

  const destinationForm = useForm<z.infer<typeof destinationSchema>>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      from: "",
      to: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
      stop: "",
    },
  });

  const hourlyForm = useForm<z.infer<typeof hourlySchema>>({
    resolver: zodResolver(hourlySchema),
    defaultValues: {
      from: "",
      duration: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
    },
  });

  const { mutate: createBooking, isPending: isLoading } = useMutation({
    mutationFn: async (bookingData: Partial<InsertBooking>) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        throw new Error("Failed to create booking");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your booking has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleAddStop = (stop: string) => {
    if (stop && stop.trim()) {
      setStops([...stops, stop.trim()]);
      setShowStopInput(false);
      destinationForm.setValue('stop', '');
    }
  };

  const onDestinationSubmit = async (data: z.infer<typeof destinationSchema>) => {
    const pickupDateTime = new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`);
    const bookingData: Partial<InsertBooking> = {
      serviceType: "destination",
      pickupLocation: data.from,
      dropoffLocation: data.to,
      pickupDate: pickupDateTime,
      passengerCount: 1,
      basePrice: "100.00", // Default base price, should be calculated based on distance
      totalFare: "100.00", // Should be calculated based on distance and other factors
      status: "pending",
      paymentStatus: "pending",
      stops: stops.length > 0 ? stops.join(';') : null, // Convert array to string with semicolon separator
      trackingEnabled: true
    };

    createBooking(bookingData);
  };

  const onHourlySubmit = async (data: z.infer<typeof hourlySchema>) => {
    const pickupDateTime = new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`);
    const bookingData: Partial<InsertBooking> = {
      serviceType: "hourly",
      pickupLocation: data.from,
      dropoffLocation: data.from, // Same as pickup for hourly
      pickupDate: pickupDateTime,
      duration: parseInt(data.duration),
      passengerCount: 1,
      basePrice: "75.00", // Default hourly base price
      totalFare: (75.00 * parseInt(data.duration)).toString(), // Calculate based on duration
      status: "pending",
      paymentStatus: "pending",
      stops: null, // No stops for hourly bookings
      trackingEnabled: true
    };

    createBooking(bookingData);
  };

  // Explicitly type the libraries array
  const libraries: Libraries = ["places"];

  // Check if Google Maps API key is available
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    return (
      <div className="w-full max-w-[300px] bg-white rounded-lg shadow-xl p-4">
        <div className="text-destructive text-sm">
          Error: Google Maps API key is not configured. Please check your environment configuration.
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      loadingElement={
        <div className="w-full max-w-[300px] bg-white rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Maps...</span>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-[300px] bg-white rounded-lg shadow-xl p-4">
        <Tabs defaultValue="destination" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="destination">Destination</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
          </TabsList>

          <TabsContent value="destination">
            <Form {...destinationForm}>
              <form onSubmit={destinationForm.handleSubmit(onDestinationSubmit)} className="space-y-4">
                <FormField
                  control={destinationForm.control}
                  name="from"
                  render={({ field }) => (
                    <LocationAutocomplete
                      label="From"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter pickup address"
                      error={destinationForm.formState.errors.from?.message}
                    />
                  )}
                />

                {stops.map((stop, index) => (
                  <FormItem key={index}>
                    <Label>Stop {index + 1}</Label>
                    <Input value={stop} disabled />
                  </FormItem>
                ))}

                {showStopInput && (
                  <FormField
                    control={destinationForm.control}
                    name="stop"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Add Stop</Label>
                        <div className="flex gap-2">
                          <FormControl>
                            <LocationAutocomplete
                              label=""
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Enter stop address"
                              error={destinationForm.formState.errors.stop?.message}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => field.value && handleAddStop(field.value)}
                          >
                            Add
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!showStopInput && (
                  <div className="text-sm">
                    <button
                      type="button"
                      className="text-primary flex items-center gap-1"
                      onClick={() => setShowStopInput(true)}
                    >
                      <Plus className="h-4 w-4" /> Add Stop
                    </button>
                  </div>
                )}

                <FormField
                  control={destinationForm.control}
                  name="to"
                  render={({ field }) => (
                    <LocationAutocomplete
                      label="To"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter dropoff address"
                      error={destinationForm.formState.errors.to?.message}
                    />
                  )}
                />

                <FormField
                  control={destinationForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Date</Label>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={destinationForm.control}
                    name="time.hour"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={destinationForm.control}
                    name="time.minute"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i * 5)}>{String(i * 5).padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={destinationForm.control}
                    name="time.period"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating booking..." : "Book Now"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="hourly">
            <Form {...hourlyForm}>
              <form onSubmit={hourlyForm.handleSubmit(onHourlySubmit)} className="space-y-4">
                <FormField
                  control={hourlyForm.control}
                  name="from"
                  render={({ field }) => (
                    <LocationAutocomplete
                      label="Pickup Location"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter pickup address"
                      error={hourlyForm.formState.errors.from?.message}
                    />
                  )}
                />

                <FormField
                  control={hourlyForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Duration</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8].map((hours) => (
                            <SelectItem key={hours} value={String(hours)}>
                              {hours} hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={hourlyForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Date</Label>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={hourlyForm.control}
                    name="time.hour"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={hourlyForm.control}
                    name="time.minute"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i * 5)}>{String(i * 5).padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={hourlyForm.control}
                    name="time.period"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating booking..." : "Book Now"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </LoadScript>
  );
}