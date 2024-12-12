import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

import type { Booking } from "@db/schema";

// Additional fields needed for the UI
interface BookingWithDetails extends Booking {
  driverName?: string;
  passengerName?: string;
}

export default function BookingManagement() {
  const { data: bookings, isLoading, refetch } = useQuery<BookingWithDetails[]>({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
  });

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 w-2/3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-[180px]" />
                    <Skeleton className="h-9 w-[180px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <h3 className="font-medium">
                    Booking #{booking.id}
                  </h3>
                  <p className="text-sm">
                    From: {booking.pickupLocation}
                  </p>
                  <p className="text-sm">
                    To: {booking.dropoffLocation}
                  </p>
                  <p className="text-sm">
                    Date: {new Date(booking.pickupDate).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Passengers: {booking.passengerCount}
                  </p>
                  <p className="text-sm">
                    Fare: ${Number(booking.totalFare).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Select
                    defaultValue={booking.status || undefined}
                    onValueChange={(value) => handleStatusChange(booking.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement view details
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {bookings?.length === 0 && (
              <p className="text-center text-gray-500">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
