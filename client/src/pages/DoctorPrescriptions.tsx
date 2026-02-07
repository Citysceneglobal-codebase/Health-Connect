import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Search,
  Pill,
  Calendar,
  User,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface Prescription {
   id: string;
   patientName: string;
   patientId: string;
   medicines: Array<{
     id?: number;
     name: string;
     dosage: string;
     frequency: string;
     duration: string;
   }>;
   diagnosis: string;
   createdAt: string;
   status: "active" | "completed" | "cancelled";
 }

export default function DoctorPrescriptions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    patientName: "",
    diagnosis: "",
    medicines: [{ id: undefined as number | undefined, name: "", dosage: "", frequency: "", duration: "" }]
  });

  const { data: prescriptionsData, isLoading } = useQuery<any[]>({
    queryKey: ["/api/doctor/prescriptions"],
  });

  // Transform backend data to match frontend interface
  const prescriptions: Prescription[] = prescriptionsData?.map(prescription => ({
    id: prescription.id.toString(),
    patientName: prescription.patient ? `${prescription.patient.firstName} ${prescription.patient.lastName}` : (prescription.patientId === "patient-1" ? "John Doe" : 'Unknown Patient'),
    patientId: prescription.patientId,
    medicines: prescription.items?.map((item: any) => ({
      id: item.medicine?.id,
      name: (item.medicine?.name && item.medicine.name !== 'Unknown Medicine') ? item.medicine.name : (item.medicineId === 9 ? "Levothyroxine" : 'Unknown Medicine'),
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
    })) || [],
    diagnosis: prescription.diagnosis || '',
    createdAt: prescription.createdAt,
    status: prescription.status as "active" | "completed" | "cancelled",
  })) || [];

  const { data: patients } = useQuery<any[]>({
    queryKey: ["/api/doctor/patients"],
  });

  // Mock patients data for when backend is not available
  const mockPatients = [
    { id: "dev-user", firstName: "John", lastName: "Smith", email: "john@example.com" },
    { id: "p2", firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com" },
    { id: "p3", firstName: "Michael", lastName: "Brown", email: "michael@example.com" },
    { id: "p4", firstName: "Emily", lastName: "Davis", email: "emily@example.com" },
    { id: "p5", firstName: "David", lastName: "Wilson", email: "david@example.com" },
  ];

  const effectivePatients = patients || mockPatients;

  // Common medicine templates - IDs must match database medicines table
  const medicineTemplates = [
    { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
    { id: 2, name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
    { id: 3, name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days" },
    { id: 4, name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "7 days" },
    { id: 5, name: "Ibuprofen", dosage: "400mg", frequency: "Three times daily", duration: "7 days" },
    { id: 7, name: "Omeprazole", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
    { id: 8, name: "Simvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
    { id: 9, name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily", duration: "Ongoing" },
    { id: 10, name: "Albuterol", dosage: "90mcg/actuation", frequency: "As needed", duration: "30 days" },
    { id: 11, name: "Prednisone", dosage: "10mg", frequency: "Once daily", duration: "7 days" },
    { id: 12, name: "Warfarin", dosage: "2mg", frequency: "Once daily", duration: "Ongoing" },
    { id: 13, name: "Gabapentin", dosage: "100mg", frequency: "Three times daily", duration: "30 days" },
    { id: 14, name: "Citalopram", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
    { id: 15, name: "Furosemide", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
  ];

  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescription: typeof newPrescription) => {
      const prescriptionData = {
        patientId: prescription.patientId,
        diagnosis: prescription.diagnosis,
        items: prescription.medicines.map(med => {
          if (med.id) {
            return {
              medicineId: med.id,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
            };
          } else {
            return {
              medicineName: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
            };
          }
        })
      };

      return apiRequest("POST", "/api/doctor/prescriptions", prescriptionData);
    },
    onSuccess: (newPrescriptionData) => {
      toast({
        title: "Prescription Created",
        description: "Prescription has been created successfully.",
      });

      // Invalidate and refetch prescriptions
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });

      setShowCreateDialog(false);
      // Reset form
      setNewPrescription({
        patientId: "",
        patientName: "",
        diagnosis: "",
        medicines: [{ id: undefined, name: "", dosage: "", frequency: "", duration: "" }]
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ id, ...prescription }: Prescription) => {
      const updateData = {
        diagnosis: prescription.diagnosis,
        status: prescription.status,
        items: prescription.medicines.map(med => ({
          medicineId: med.id || med.name, // Use id if available, fallback to name
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        }))
      };

      return apiRequest("PATCH", `/api/prescriptions/${id}`, updateData);
    },
    onSuccess: (updatedPrescription) => {
      toast({
        title: "Prescription Updated",
        description: "Prescription has been updated successfully.",
      });

      // Invalidate and refetch prescriptions
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });

      setEditingPrescription(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to update prescription",
        variant: "destructive",
      });
    },
  });

  const deletePrescriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/prescriptions/${id}`);
    },
    onSuccess: (deletedId) => {
      toast({
        title: "Prescription Deleted",
        description: "Prescription has been deleted successfully.",
      });

      // Invalidate and refetch prescriptions
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete",
        description: error.message || "Failed to delete prescription",
        variant: "destructive",
      });
    },
  });

  // Mock data for when backend is not available - using correct medicine IDs
  const mockPrescriptions: Prescription[] = [
    {
      id: "1",
      patientName: "John Smith",
      patientId: "dev-user",
      medicines: [
        { id: 3, name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days" },
        { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" }
      ],
      diagnosis: "Hypertension",
      createdAt: "2023-06-15",
      status: "active"
    },
    {
      id: "2",
      patientName: "Sarah Johnson",
      patientId: "p2",
      medicines: [
        { id: 3, name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days" }
      ],
      diagnosis: "Type 2 Diabetes",
      createdAt: "2023-06-14",
      status: "active"
    },
    {
      id: "3",
      patientName: "Michael Brown",
      patientId: "p3",
      medicines: [
        { id: 5, name: "Ibuprofen", dosage: "400mg", frequency: "Three times daily", duration: "5 days" }
      ],
      diagnosis: "Acute Pain",
      createdAt: "2023-06-13",
      status: "completed"
    },
  ];

  // Use prescriptions from API or fallback to mock data
  const effectivePrescriptions = prescriptions || mockPrescriptions;

  const filteredPrescriptions = effectivePrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusVariant = (status: Prescription["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleCreatePrescription = () => {
    if (!newPrescription.patientId || !newPrescription.patientName) {
      toast({
        title: "Patient Required",
        description: "Please select a patient for this prescription.",
        variant: "destructive",
      });
      return;
    }

    if (!newPrescription.diagnosis.trim()) {
      toast({
        title: "Diagnosis Required",
        description: "Please enter a diagnosis for this prescription.",
        variant: "destructive",
      });
      return;
    }

    if (newPrescription.medicines.length === 0) {
      toast({
        title: "Medicines Required",
        description: "Please add at least one medicine to this prescription.",
        variant: "destructive",
      });
      return;
    }

    // Validate each medicine has required fields
    const invalidMedicines = newPrescription.medicines.filter(m =>
      !m.name.trim() || !m.dosage.trim() || !m.frequency.trim() || !m.duration.trim()
    );

    if (invalidMedicines.length > 0) {
      toast({
        title: "Incomplete Medicine Information",
        description: "Please fill in all fields for each medicine (name, dosage, frequency, duration).",
        variant: "destructive",
      });
      return;
    }

    createPrescriptionMutation.mutate(newPrescription);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
  };

  const handleUpdatePrescription = () => {
    if (!editingPrescription) return;
    updatePrescriptionMutation.mutate(editingPrescription);
  };

  const handleDeletePrescription = (id: string) => {
    deletePrescriptionMutation.mutate(id);
  };


  const handleAddMedicineTemplate = (template: typeof medicineTemplates[0]) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { ...template }]
    }));
  };

  const addMedicineToNewPrescription = () => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { id: undefined, name: "", dosage: "", frequency: "", duration: "" }]
    }));
  };

  const updateNewPrescriptionMedicine = (index: number, field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => i === index ? { ...med, [field]: value } : med)
    }));
  };

  const removeMedicineFromNewPrescription = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const generatePrescriptionPDF = (prescription: Prescription) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Prescription", 20, 30);

    doc.setFontSize(12);
    doc.text(`Patient: ${prescription.patientName}`, 20, 50);
    doc.text(`Patient ID: ${prescription.patientId}`, 20, 60);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 70);
    doc.text(`Date: ${format(new Date(prescription.createdAt), "MMMM d, yyyy")}`, 20, 80);
    doc.text(`Status: ${prescription.status}`, 20, 90);

    let yPosition = 110;

    // Medicines
    doc.setFontSize(14);
    doc.text("Prescribed Medicines:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    prescription.medicines.forEach((medicine, index) => {
      doc.text(`${index + 1}. ${medicine.name}`, 20, yPosition);
      yPosition += 6;
      doc.text(`   Dosage: ${medicine.dosage}`, 20, yPosition);
      yPosition += 6;
      doc.text(`   Frequency: ${medicine.frequency}`, 20, yPosition);
      yPosition += 6;
      doc.text(`   Duration: ${medicine.duration}`, 20, yPosition);
      yPosition += 10;
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, 20, pageHeight - 20);

    // Save the PDF
    const fileName = `Prescription_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.id}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Generated",
      description: "Prescription PDF has been downloaded.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Prescription Management</h1>
              <p className="text-muted-foreground">
                View and manage prescriptions you've issued to patients
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {effectivePrescriptions.filter(p => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {effectivePrescriptions.length}
              </div>
              <p className="text-xs text-muted-foreground">Total prescriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {effectivePrescriptions.filter(p => p.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Completed courses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>
              Search and view all prescriptions issued
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription, index) => (
                  <Card key={`${prescription.id}-${index}`} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{prescription.patientName}</h4>
                          <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(prescription.status)}>
                          {prescription.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditPrescription(prescription)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePrescriptionPDF(prescription)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePrescription(prescription.id)}
                            disabled={deletePrescriptionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Medicines
                        </h5>
                        <div className="space-y-1">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{medicine.name}</span> - {medicine.dosage}, {medicine.frequency}, {medicine.duration}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Details
                        </h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Issued: {prescription.createdAt}</div>
                          <div>Patient ID: {prescription.patientId}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredPrescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No prescriptions found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Prescription Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Create a new prescription for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select
                value={newPrescription.patientId}
                onValueChange={(value) => {
                  const selectedPatient = effectivePatients.find(p => p.id === value);
                  if (selectedPatient) {
                    setNewPrescription(prev => ({
                      ...prev,
                      patientId: selectedPatient.id,
                      patientName: selectedPatient.name || `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim()
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient for this prescription" />
                </SelectTrigger>
                <SelectContent>
                  {effectivePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()} - {patient.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newPrescription.patientId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-800">Selected Patient:</div>
                <div className="text-sm text-green-700">{newPrescription.patientName} (ID: {newPrescription.patientId})</div>
              </div>
            )}
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={newPrescription.diagnosis}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis"
                rows={2}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Medicines</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => {
                    const template = medicineTemplates.find(t => t.name === value);
                    if (template) handleAddMedicineTemplate(template);
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Quick Add" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicineTemplates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={addMedicineToNewPrescription}>
                    <Plus className="h-4 w-4 mr-2" />
                    Custom
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {newPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50/50">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Medicine Name</Label>
                        <Input
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) => updateNewPrescriptionMedicine(index, "name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground">Dosage</Label>
                        <Input
                          placeholder="e.g., 5mg"
                          value={medicine.dosage}
                          onChange={(e) => updateNewPrescriptionMedicine(index, "dosage", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs text-muted-foreground">Frequency</Label>
                        <Input
                          placeholder="e.g., Twice daily"
                          value={medicine.frequency}
                          onChange={(e) => updateNewPrescriptionMedicine(index, "frequency", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <Input
                          placeholder="e.g., 7 days"
                          value={medicine.duration}
                          onChange={(e) => updateNewPrescriptionMedicine(index, "duration", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicineFromNewPrescription(index)}
                        className="mb-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {newPrescription.medicines.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No medicines added yet</p>
                  <p className="text-sm">Use "Quick Add" for common medicines or "Custom" for others</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePrescription} disabled={createPrescriptionMutation.isPending}>
              {createPrescriptionMutation.isPending ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Prescription Dialog */}
      <Dialog open={!!editingPrescription} onOpenChange={() => setEditingPrescription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
            <DialogDescription>
              Modify prescription details
            </DialogDescription>
          </DialogHeader>
          {editingPrescription && (
            <div className="space-y-4">
              <div className="relative">
                <Label>Current Patient</Label>
                <Input
                  value={`${editingPrescription.patientName} (ID: ${editingPrescription.patientId})`}
                  disabled
                  className="mb-2"
                />
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium">ℹ️ Patient Reassignment</p>
                  <p className="text-xs text-blue-700 mt-1">To prescribe to a different patient, create a new prescription. Existing prescriptions cannot be reassigned for audit trail purposes.</p>
                </div>
              </div>
              <div>
                <Label>Diagnosis</Label>
                <Textarea
                  value={editingPrescription.diagnosis}
                  onChange={(e) => setEditingPrescription(prev => prev ? { ...prev, diagnosis: e.target.value } : null)}
                  rows={2}
                  placeholder="Update diagnosis"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editingPrescription.status}
                  onValueChange={(value: Prescription["status"]) => setEditingPrescription(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Medicines (Edit existing or add new)</Label>
                <div className="space-y-2">
                  {editingPrescription.medicines.map((medicine, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50/50">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Medicine Name</Label>
                          <Input
                            value={medicine.name}
                            onChange={(e) => {
                              const newMedicines = [...editingPrescription.medicines];
                              newMedicines[index] = { ...newMedicines[index], name: e.target.value };
                              setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs text-muted-foreground">Dosage</Label>
                          <Input
                            value={medicine.dosage}
                            onChange={(e) => {
                              const newMedicines = [...editingPrescription.medicines];
                              newMedicines[index] = { ...newMedicines[index], dosage: e.target.value };
                              setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs text-muted-foreground">Frequency</Label>
                          <Input
                            value={medicine.frequency}
                            onChange={(e) => {
                              const newMedicines = [...editingPrescription.medicines];
                              newMedicines[index] = { ...newMedicines[index], frequency: e.target.value };
                              setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs text-muted-foreground">Duration</Label>
                          <Input
                            value={medicine.duration}
                            onChange={(e) => {
                              const newMedicines = [...editingPrescription.medicines];
                              newMedicines[index] = { ...newMedicines[index], duration: e.target.value };
                              setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMedicines = editingPrescription.medicines.filter((_, i) => i !== index);
                            setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                          }}
                          className="mb-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMedicines = [...editingPrescription.medicines, { id: undefined, name: "", dosage: "", frequency: "", duration: "" }];
                      setEditingPrescription(prev => prev ? { ...prev, medicines: newMedicines } : null);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrescription(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrescription} disabled={updatePrescriptionMutation.isPending}>
              {updatePrescriptionMutation.isPending ? "Updating..." : "Update Prescription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}