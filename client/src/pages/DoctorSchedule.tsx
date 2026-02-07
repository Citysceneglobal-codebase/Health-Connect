import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Users, Plus, Edit, Trash2, Save } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ScheduleSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "available" | "booked" | "blocked";
  patientName?: string;
  appointmentId?: string;
}

export default function DoctorSchedule() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [localScheduleSlots, setLocalScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    startTime: "",
    endTime: "",
    type: "available" as ScheduleSlot["type"]
  });

  const { data: scheduleData, isLoading } = useQuery<ScheduleSlot[]>({
    queryKey: ["/api/doctor/schedule", format(selectedDate, "yyyy-MM-dd")],
  });

  const addSlotMutation = useMutation({
    mutationFn: async (slot: Omit<ScheduleSlot, "id">) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create new slot with generated ID
      const newSlotData: ScheduleSlot = {
        id: `local-${Date.now()}`,
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type
      };

      return newSlotData;
    },
    onSuccess: (newSlotData) => {
      toast({
        title: "Slot Added",
        description: "Schedule slot has been added successfully.",
      });

      // Add to local schedule slots
      setLocalScheduleSlots(prev => [...prev, newSlotData]);

      setShowAddSlotDialog(false);
      setNewSlot({ startTime: "", endTime: "", type: "available" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Slot",
        description: error.message || "Failed to add schedule slot",
        variant: "destructive",
      });
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, ...slot }: ScheduleSlot) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, ...slot };
    },
    onSuccess: (updatedSlot) => {
      toast({
        title: "Slot Updated",
        description: "Schedule slot has been updated successfully.",
      });

      // Update local schedule slots
      setLocalScheduleSlots(prev =>
        prev.map(s => s.id === updatedSlot.id ? updatedSlot : s)
      );

      setEditingSlot(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Slot",
        description: error.message || "Failed to update schedule slot",
        variant: "destructive",
      });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: (deletedId) => {
      toast({
        title: "Slot Deleted",
        description: "Schedule slot has been deleted successfully.",
      });

      // Remove from local schedule slots
      setLocalScheduleSlots(prev => prev.filter(s => s.id !== deletedId));
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Slot",
        description: error.message || "Failed to delete schedule slot",
        variant: "destructive",
      });
    },
  });

  // Mock data for when backend is not available
  const mockScheduleData: ScheduleSlot[] = [
    {
      id: "1",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      type: "booked",
      patientName: "John Smith",
      appointmentId: "a1"
    },
    {
      id: "2",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "10:00",
      endTime: "11:00",
      type: "available"
    },
    {
      id: "3",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "11:00",
      endTime: "12:00",
      type: "booked",
      patientName: "Sarah Johnson",
      appointmentId: "a2"
    },
    {
      id: "4",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "14:00",
      endTime: "15:00",
      type: "available"
    },
    {
      id: "5",
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "15:00",
      endTime: "16:00",
      type: "blocked"
    },
  ];

  // Combine local and mock schedule data, filtered by selected date
  const localSlotsForDate = localScheduleSlots.filter(slot => slot.date === format(selectedDate, "yyyy-MM-dd"));
  const effectiveScheduleData = scheduleData
    ? [...localSlotsForDate, ...scheduleData.filter(slot => slot.date === format(selectedDate, "yyyy-MM-dd"))]
    : [...localSlotsForDate, ...mockScheduleData];

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotColor = (type: ScheduleSlot["type"]) => {
    switch (type) {
      case "booked":
        return "bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200";
      case "available":
        return "bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200";
      case "blocked":
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getSlotIcon = (type: ScheduleSlot["type"]) => {
    switch (type) {
      case "booked":
        return <Users className="h-4 w-4" />;
      case "available":
        return <Plus className="h-4 w-4" />;
      case "blocked":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      toast({
        title: "Invalid Time",
        description: "Please enter both start and end times.",
        variant: "destructive",
      });
      return;
    }
    addSlotMutation.mutate({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      type: newSlot.type
    });
  };

  const handleEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
  };

  const handleUpdateSlot = () => {
    if (!editingSlot) return;
    updateSlotMutation.mutate(editingSlot);
  };

  const handleDeleteSlot = (id: string) => {
    deleteSlotMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">
            Manage your availability and view appointments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weekDays.map((day) => (
                  <Button
                    key={day.toISOString()}
                    variant={isSameDay(day, selectedDate) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{format(day, "EEE")}</div>
                      <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selected Date Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                    <CardDescription>
                      {effectiveScheduleData.filter(slot => slot.type === "booked").length} appointments scheduled
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowAddSlotDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Bulk Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle>Time Slots</CardTitle>
                <CardDescription>
                  Your schedule for {format(selectedDate, "MMMM d")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : effectiveScheduleData.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No schedule set for this date</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Set Availability
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectiveScheduleData.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-lg border ${getSlotColor(slot.type)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getSlotIcon(slot.type)}
                            <div>
                              <div className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              {slot.patientName && (
                                <div className="text-sm">
                                  Patient: {slot.patientName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {slot.type}
                            </Badge>
                            {slot.type === "booked" ? (
                              slot.appointmentId ? (
                                <Link href={`/doctor/consultation/${slot.appointmentId}`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              ) : (
                                <Button variant="outline" size="sm" disabled>
                                  View Details
                                </Button>
                              )
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSlot(slot)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  disabled={deleteSlotMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {effectiveScheduleData.filter(slot => slot.type === "available").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Available slots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {effectiveScheduleData.filter(slot => slot.type === "booked").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Booked appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">
                        {effectiveScheduleData.filter(slot => slot.type === "blocked").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Blocked slots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Slot</DialogTitle>
            <DialogDescription>
              Add a new time slot to your schedule for {format(selectedDate, "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="slot-type">Slot Type</Label>
              <Select value={newSlot.type} onValueChange={(value: ScheduleSlot["type"]) => setNewSlot(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSlotDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlot} disabled={addSlotMutation.isPending}>
              {addSlotMutation.isPending ? "Adding..." : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule Slot</DialogTitle>
            <DialogDescription>
              Modify the time slot details
            </DialogDescription>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-time">Start Time</Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-time">End Time</Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-slot-type">Slot Type</Label>
                <Select
                  value={editingSlot.type}
                  onValueChange={(value: ScheduleSlot["type"]) => setEditingSlot(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSlot} disabled={updateSlotMutation.isPending}>
              {updateSlotMutation.isPending ? "Updating..." : "Update Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}