import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead, 
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  FileText,
  Pill,
  Eye,
  Stethoscope as ConsultIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { AppointmentWithDetails } from "@shared/schema";

export default function DoctorAppointments() {
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);

  const { data: appointments, isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/doctor/appointments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      if (status === 'completed') {
        // Use the complete endpoint for completion which handles prescriptions and notifications
        return apiRequest("POST", `/api/doctor/appointments/${id}/complete`, {
          diagnosis: "",
          notes: "",
          prescriptionItems: []
        });
      } else if (status === 'in_progress') {
        // Use the start endpoint for starting appointments
        return apiRequest("POST", `/api/appointments/${id}/start`);
      } else {
        return apiRequest("PATCH", `/api/appointments/${id}`, { status });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/appointments"] });
      toast({
        title: "Status Updated",
        description: "Appointment status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update appointment status",
        variant: "destructive",
      });
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      appointmentId: number;
      diagnosis: string;
      notes: string;
      items: Array<{
        medicineId: number;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
      }>;
    }) => {
      return apiRequest("POST", "/api/doctor/prescriptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });
      setShowPrescriptionDialog(false);
      toast({
        title: "Prescription Created",
        description: "Prescription has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "no_show":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "no_show":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleStatusUpdate = (appointmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const handleViewPatient = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setShowPatientDialog(true);
  };

  const handleCreatePrescription = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionDialog(true);
  };

  const handleSubmitPrescription = (data: any) => {
    if (!selectedAppointment) return;

    createPrescriptionMutation.mutate({
      patientId: selectedAppointment.patientId,
      appointmentId: selectedAppointment.id,
      ...data,
    });
  };

  // Get appointment statistics
  const todayAppointments = appointments?.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === today.toDateString();
  }) || [];

  const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmed').length;
  const pendingToday = todayAppointments.filter(apt => apt.status === 'pending').length;
  const completedToday = appointments?.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === today.toDateString() && apt.status === 'completed';
  }).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">All Appointments</h1>
          <p className="text-muted-foreground">
            View and manage all patient appointments across the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {confirmedToday} confirmed, {pendingToday} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
            <CardDescription>
              View and manage your patient appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No appointments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.patient?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.doctor?.specialty}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(appointment.appointmentDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.reason || "No reason specified"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <Badge variant={getStatusVariant(appointment.status)}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/doctor/consultation/${appointment.id}`}
                          >
                            <ConsultIcon className="h-3 w-3 mr-1" />
                            Consult
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPatient(appointment)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreatePrescription(appointment)}
                          >
                            <Pill className="h-3 w-3 mr-1" />
                            Rx
                          </Button>
                          {appointment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Start
                            </Button>
                          )}
                          {(appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Patient Info Dialog */}
        <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Information</DialogTitle>
              <DialogDescription>
                Detailed information about the patient
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.patient?.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.patient?.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date of Birth</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.patient?.dateOfBirth || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.patient?.gender || "Not provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Appointment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Date & Time</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedAppointment.appointmentDate), "PPP")} at {selectedAppointment.appointmentTime}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Reason</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment.reason || "No reason specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={getStatusVariant(selectedAppointment.status)}>
                          {selectedAppointment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCreatePrescription(selectedAppointment)}
                    className="flex-1"
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Create Prescription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPatientDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Prescription Dialog */}
        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
              <DialogDescription>
                Create a new prescription for {selectedAppointment?.patient?.firstName} {selectedAppointment?.patient?.lastName}
              </DialogDescription>
            </DialogHeader>

            <PrescriptionForm
              appointment={selectedAppointment}
              onSubmit={handleSubmitPrescription}
              onCancel={() => setShowPrescriptionDialog(false)}
              isLoading={createPrescriptionMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Prescription Form Component
function PrescriptionForm({
  appointment,
  onSubmit,
  onCancel,
  isLoading
}: {
  appointment: AppointmentWithDetails | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Array<{
    medicineId: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([]);

  const { data: availableMedicines } = useQuery({
    queryKey: ["/api/medicines/search"],
  });

  const addMedicine = () => {
    setMedicines([...medicines, {
      medicineId: 0,
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    }]);
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const prescriptionData = {
      diagnosis,
      notes,
      items: medicines.map(med => ({
        medicineId: med.medicineId,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
      }))
    };
    onSubmit(prescriptionData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Enter diagnosis..."
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={2}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Medicines</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
            Add Medicine
          </Button>
        </div>

        {medicines.map((medicine, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Medicine</Label>
                <Select
                  value={medicine.medicineId.toString()}
                  onValueChange={(value) => updateMedicine(index, 'medicineId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMedicines?.map((med: any) => (
                      <SelectItem key={med.id} value={med.id.toString()}>
                        {med.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dosage</Label>
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., 500mg"
                />
              </div>

              <div>
                <Label>Frequency</Label>
                <input
                  type="text"
                  value={medicine.frequency}
                  onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., twice daily"
                />
              </div>

              <div>
                <Label>Duration</Label>
                <input
                  type="text"
                  value={medicine.duration}
                  onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., 7 days"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Instructions</Label>
                <textarea
                  value={medicine.instructions}
                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  placeholder="Special instructions..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeMedicine(index)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Prescription"}
        </Button>
      </DialogFooter>
    </div>
  );
}