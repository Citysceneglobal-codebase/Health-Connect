import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { DoctorSchedule, DoctorWithUser } from "@shared/schema";

export default function AdminSchedules() {
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockType, setBlockType] = useState<"leave" | "emergency" | "maintenance">("leave");

  const { data: doctors, isLoading: doctorsLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/admin/doctors"],
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<DoctorSchedule[]>({
    queryKey: ["/api/doctor-schedules", selectedDoctor],
    enabled: !!selectedDoctor,
  });

  // Get blocked slots for the selected doctor and date range
  const { data: blockedSlots } = useQuery<any[]>({
    queryKey: ["/api/blocked-slots", selectedDoctor, selectedDate],
    enabled: !!selectedDoctor,
  });

  const blockSlotMutation = useMutation({
    mutationFn: async (data: {
      doctorId: number;
      date: Date;
      reason: string;
      type: string;
    }) => {
      return apiRequest("POST", "/api/admin/block-slot", data);
    },
    onSuccess: () => {
      toast({
        title: "Slot Blocked",
        description: "The time slot has been blocked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-slots"] });
      setBlockDialogOpen(false);
      setBlockReason("");
    },
    onError: (error) => {
      toast({
        title: "Failed to Block",
        description: error.message || "Failed to block time slot",
        variant: "destructive",
      });
    },
  });

  const unblockSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      return apiRequest("DELETE", `/api/admin/block-slot/${slotId}`);
    },
    onSuccess: () => {
      toast({
        title: "Slot Unblocked",
        description: "The time slot has been unblocked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-slots"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Unblock",
        description: error.message || "Failed to unblock time slot",
        variant: "destructive",
      });
    },
  });

  const getScheduleForDay = (doctorId: string, dayOfWeek: number) => {
    return schedules?.find(s => s.doctorId === parseInt(doctorId) && s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const getBlockedSlotsForDate = (date: Date) => {
    return blockedSlots?.filter(slot => isSameDay(new Date(slot.date), date)) || [];
  };

  const getSlotStatusColor = (slot: any) => {
    switch (slot.type) {
      case "leave":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
      case "emergency":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700";
      case "maintenance":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const getSlotStatusIcon = (slot: any) => {
    switch (slot.type) {
      case "leave":
        return <XCircle className="h-3 w-3" />;
      case "emergency":
        return <AlertTriangle className="h-3 w-3" />;
      case "maintenance":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <X className="h-3 w-3" />;
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate),
  });

  const handleBlockSlot = () => {
    if (!selectedDoctor || !blockReason) return;

    blockSlotMutation.mutate({
      doctorId: parseInt(selectedDoctor),
      date: selectedDate,
      reason: blockReason,
      type: blockType,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Doctor Schedule Management</h1>
          <p className="text-muted-foreground">Manage doctor schedules and block time slots</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor to manage schedules" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Weekly Calendar View */}
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Weekly Schedule
                  </CardTitle>
                  <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Block Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Block Time Slot</DialogTitle>
                        <DialogDescription>
                          Block a time slot for the selected doctor and date.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Block Type</label>
                          <Select value={blockType} onValueChange={(value: any) => setBlockType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leave">Doctor Leave</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Reason</label>
                          <textarea
                            className="w-full p-2 border rounded-md"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter reason for blocking..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBlockSlot} disabled={blockSlotMutation.isPending}>
                          {blockSlotMutation.isPending ? "Blocking..." : "Block Slot"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => {
                    const daySchedule = getScheduleForDay(selectedDoctor, day.getDay());
                    const blockedSlotsForDay = getBlockedSlotsForDate(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-3 border rounded-lg ${
                          isToday ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="text-center mb-2">
                          <p className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                            {format(day, "EEE")}
                          </p>
                          <p className={`text-xs ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {format(day, "d")}
                          </p>
                        </div>

                        {daySchedule ? (
                          <div className="space-y-1">
                            <div className="text-xs text-center p-1 bg-green-100 text-green-800 rounded">
                              {format(new Date(`2000-01-01T${daySchedule.startTime}`), "HH:mm")} -
                              {format(new Date(`2000-01-01T${daySchedule.endTime}`), "HH:mm")}
                            </div>
                            {blockedSlotsForDay.map(slot => (
                              <div
                                key={slot.id}
                                className={`text-xs p-1 rounded flex items-center gap-1 ${getSlotStatusColor(slot)}`}
                              >
                                {getSlotStatusIcon(slot)}
                                <span className="truncate">{slot.type}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-center text-muted-foreground py-2">
                            No schedule
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Schedule Details and Blocked Slots */}
        <div className="space-y-6">
          {/* Doctor Schedule Details */}
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Details</CardTitle>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : schedules && schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map(schedule => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][schedule.dayOfWeek]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(`2000-01-01T${schedule.startTime}`), "HH:mm")} -
                            {format(new Date(`2000-01-01T${schedule.endTime}`), "HH:mm")}
                          </p>
                        </div>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No schedule configured for this doctor
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Blocked Slots List */}
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle>Blocked Slots</CardTitle>
              </CardHeader>
              <CardContent>
                {blockedSlots && blockedSlots.length > 0 ? (
                  <div className="space-y-2">
                    {blockedSlots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{format(new Date(slot.date), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">{slot.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSlotStatusColor(slot)}>
                            {getSlotStatusIcon(slot)}
                            <span className="ml-1 capitalize">{slot.type}</span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unblockSlotMutation.mutate(slot.id)}
                            disabled={unblockSlotMutation.isPending}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No blocked slots for this doctor
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}