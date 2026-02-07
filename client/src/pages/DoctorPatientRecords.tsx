import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Pill,
  Activity,
  Calendar,
  User,
  ArrowLeft,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileDown
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from "jspdf";
import type { Prescription, Vital, Allergy, Document } from "@shared/schema";

export default function DoctorPatientRecords() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/doctor/patient/:patientId/records");
  const patientId = params?.patientId;

  // Dialog states
  const [showAddVitalDialog, setShowAddVitalDialog] = useState(false);
  const [showAddAllergyDialog, setShowAddAllergyDialog] = useState(false);
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [editingVital, setEditingVital] = useState<Vital | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);

  // Form states
  const [newVital, setNewVital] = useState({
    type: "bp" as Vital["type"],
    value: "",
    unit: "",
    notes: ""
  });

  // History filtering states
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  const [newAllergy, setNewAllergy] = useState({
    type: "medicine" as Allergy["type"],
    allergen: "",
    severity: "moderate" as Allergy["severity"],
    reaction: ""
  });

  const [newDocument, setNewDocument] = useState({
    type: "lab_report" as Document["type"],
    title: "",
    description: "",
    file: null as File | null
  });

  // Get tab from URL search params
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const defaultTab = urlParams.get('tab') || 'overview';

  const { data: patient, isLoading: patientLoading } = useQuery<any>({
    queryKey: [`/api/patient/${patientId}`],
    enabled: !!patientId,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: [`/api/patient/${patientId}/prescriptions`],
    enabled: !!patientId,
  });

  const { data: vitals, isLoading: vitalsLoading } = useQuery<Vital[]>({
    queryKey: [`/api/doctor/patient/${patientId}/vitals`],
    enabled: !!patientId,
  });

  const { data: allergies, isLoading: allergiesLoading } = useQuery<Allergy[]>({
    queryKey: [`/api/doctor/patient/${patientId}/allergies`],
    enabled: !!patientId,
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: [`/api/patient/${patientId}/documents`],
    enabled: !!patientId,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<any[]>({
    queryKey: [`/api/patient/${patientId}/appointments`],
    enabled: !!patientId,
  });

  const { data: bills, isLoading: billsLoading } = useQuery<any[]>({
    queryKey: [`/api/patient/${patientId}/bills`],
    enabled: !!patientId,
  });

  const { data: vaccinations, isLoading: vaccinationsLoading } = useQuery<any[]>({
    queryKey: [`/api/patient/${patientId}/vaccinations`],
    enabled: !!patientId,
  });

  // Mutations for CRUD operations
  const addVitalMutation = useMutation({
    mutationFn: async (vital: typeof newVital) => {
      return apiRequest("POST", `/api/doctor/patient/${patientId}/vitals`, vital);
    },
    onSuccess: () => {
      toast({
        title: "Vital Added",
        description: "Vital sign has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/vitals`] });
      setShowAddVitalDialog(false);
      setNewVital({ type: "bp", value: "", unit: "", notes: "" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Vital",
        description: error.message || "Failed to record vital sign",
        variant: "destructive",
      });
    },
  });

  const updateVitalMutation = useMutation({
    mutationFn: async ({ id, ...vital }: Vital) => {
      return apiRequest("PUT", `/api/doctor/patient/${patientId}/vitals/${id}`, vital);
    },
    onSuccess: () => {
      toast({
        title: "Vital Updated",
        description: "Vital sign has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/vitals`] });
      setEditingVital(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Vital",
        description: error.message || "Failed to update vital sign",
        variant: "destructive",
      });
    },
  });

  const deleteVitalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/doctor/patient/${patientId}/vitals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Vital Deleted",
        description: "Vital sign has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/vitals`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Vital",
        description: error.message || "Failed to delete vital sign",
        variant: "destructive",
      });
    },
  });

  const addAllergyMutation = useMutation({
    mutationFn: async (allergy: typeof newAllergy) => {
      return apiRequest("POST", `/api/doctor/patient/${patientId}/allergies`, allergy);
    },
    onSuccess: () => {
      toast({
        title: "Allergy Added",
        description: "Allergy has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/allergies`] });
      setShowAddAllergyDialog(false);
      setNewAllergy({ type: "medicine", allergen: "", severity: "moderate", reaction: "" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Allergy",
        description: error.message || "Failed to record allergy",
        variant: "destructive",
      });
    },
  });

  const updateAllergyMutation = useMutation({
    mutationFn: async ({ id, ...allergy }: Allergy) => {
      return apiRequest("PUT", `/api/doctor/patient/${patientId}/allergies/${id}`, allergy);
    },
    onSuccess: () => {
      toast({
        title: "Allergy Updated",
        description: "Allergy has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/allergies`] });
      setEditingAllergy(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Allergy",
        description: error.message || "Failed to update allergy",
        variant: "destructive",
      });
    },
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/doctor/patient/${patientId}/allergies/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Allergy Deleted",
        description: "Allergy has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/doctor/patient/${patientId}/allergies`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Allergy",
        description: error.message || "Failed to delete allergy",
        variant: "destructive",
      });
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (document: typeof newDocument) => {
      const formData = new FormData();
      formData.append("type", document.type);
      formData.append("title", document.title);
      formData.append("description", document.description || "");
      if (document.file) {
        formData.append("file", document.file);
      }
      return apiRequest("POST", `/api/patient/${patientId}/documents`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Document Added",
        description: "Document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patient/${patientId}/documents`] });
      setShowAddDocumentDialog(false);
      setNewDocument({ type: "lab_report", title: "", description: "", file: null });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Document",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  if (!patientId) {
    return <div>Patient ID not found</div>;
  }

  const isLoading = patientLoading || prescriptionsLoading || vitalsLoading || allergiesLoading || documentsLoading || appointmentsLoading || billsLoading || vaccinationsLoading;

  // Handler functions
  const handleAddVital = () => {
    if (!newVital.value || !newVital.unit) {
      toast({
        title: "Incomplete Information",
        description: "Please enter both value and unit for the vital sign.",
        variant: "destructive",
      });
      return;
    }
    addVitalMutation.mutate(newVital);
  };

  const handleEditVital = (vital: Vital) => {
    setEditingVital(vital);
  };

  const handleUpdateVital = () => {
    if (!editingVital) return;
    updateVitalMutation.mutate(editingVital);
  };

  const handleDeleteVital = (id: number) => {
    deleteVitalMutation.mutate(id);
  };

  const handleAddAllergy = () => {
    if (!newAllergy.allergen) {
      toast({
        title: "Incomplete Information",
        description: "Please enter the allergen name.",
        variant: "destructive",
      });
      return;
    }
    addAllergyMutation.mutate(newAllergy);
  };

  const handleEditAllergy = (allergy: Allergy) => {
    setEditingAllergy(allergy);
  };

  const handleUpdateAllergy = () => {
    if (!editingAllergy) return;
    updateAllergyMutation.mutate(editingAllergy);
  };

  const handleDeleteAllergy = (id: number) => {
    deleteAllergyMutation.mutate(id);
  };

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.file) {
      toast({
        title: "Incomplete Information",
        description: "Please enter a title and select a file.",
        variant: "destructive",
      });
      return;
    }
    addDocumentMutation.mutate(newDocument);
  };

  const handleViewDocument = (document: Document) => {
    if (document.fileUrl) {
      // Open document in new tab
      window.open(document.fileUrl, '_blank');
    } else {
      toast({
        title: "Document Not Available",
        description: "This document file is not available for viewing.",
        variant: "destructive",
      });
    }
  };

  const handleViewPrescriptionDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetails(true);
  };

  const generatePrescriptionPDF = (prescription: Prescription) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Prescription", 20, 30);

    doc.setFontSize(12);
    doc.text(`Patient: ${patient?.firstName} ${patient?.lastName}`, 20, 50);
    doc.text(`Patient ID: ${prescription.patientId}`, 20, 60);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 70);
    doc.text(`Date: ${format(new Date(prescription.createdAt!), "MMMM d, yyyy")}`, 20, 80);

    let yPosition = 100;

    // Medicines
    doc.setFontSize(14);
    doc.text("Prescribed Medicines:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    if (prescription.items && prescription.items.length > 0) {
      prescription.items.forEach((item, index) => {
        const medicineName = item.medicine?.name || 'Unknown Medicine';
        doc.text(`${index + 1}. ${medicineName}`, 20, yPosition);
        yPosition += 6;
        doc.text(`   Dosage: ${item.dosage || 'Not specified'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`   Frequency: ${item.frequency || 'Not specified'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`   Duration: ${item.duration || 'Not specified'}`, 20, yPosition);
        if (item.instructions) {
          yPosition += 6;
          doc.text(`   Instructions: ${item.instructions}`, 20, yPosition);
        }
        yPosition += 10;
      });
    } else {
      doc.text("No medicines prescribed", 20, yPosition);
      yPosition += 10;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, 20, pageHeight - 20);

    // Save the PDF
    const fileName = `Prescription_${patient?.firstName}_${patient?.lastName}_${prescription.id}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Generated",
      description: "Prescription PDF has been downloaded.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/doctor/patients")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <p className="text-muted-foreground">
            {patient ? `${patient.firstName} ${patient.lastName}` : "Loading patient..."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Patient Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-lg font-medium">
                      {patient?.firstName} {patient?.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                    <p className="text-lg">
                      {patient?.dateOfBirth ?
                        Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
                        "N/A"
                      } years
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <p className="text-lg">{patient?.gender || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-lg">{patient?.phone || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Pill className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{prescriptions?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{vitals?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Vital Readings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{allergies?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{documents?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-indigo-500" />
                    <div>
                      <p className="text-2xl font-bold">{vaccinations?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Vaccinations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest medical activities for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Combine recent events from different categories
                    const recentEvents: Array<{
                      id: string;
                      type: string;
                      title: string;
                      description: string;
                      date: Date;
                      icon: any;
                      color: string;
                    }> = [];

                    // Add recent prescriptions
                    prescriptions?.slice(0, 2).forEach(prescription => {
                      recentEvents.push({
                        id: `rx-${prescription.id}`,
                        type: 'prescription',
                        title: 'New Prescription',
                        description: prescription.diagnosis || "General prescription",
                        date: new Date(prescription.createdAt!),
                        icon: Pill,
                        color: 'text-blue-500'
                      });
                    });

                    // Add recent vitals
                    vitals?.slice(0, 2).forEach(vital => {
                      recentEvents.push({
                        id: `vital-${vital.id}`,
                        type: 'vital',
                        title: 'Vital Signs Recorded',
                        description: `${vital.type.replace('_', ' ')}: ${vital.value} ${vital.unit}`,
                        date: new Date(vital.recordedAt!),
                        icon: Activity,
                        color: 'text-green-500'
                      });
                    });

                    // Add recent appointments
                    appointments?.slice(0, 2).forEach(apt => {
                      recentEvents.push({
                        id: `apt-${apt.id}`,
                        type: 'appointment',
                        title: 'Appointment',
                        description: `${apt.reason || 'General consultation'} - ${apt.status}`,
                        date: new Date(apt.appointmentDate),
                        icon: Calendar,
                        color: apt.status === 'completed' ? 'text-green-500' : 'text-blue-500'
                      });
                    });

                    // Add recent documents
                    documents?.slice(0, 1).forEach(doc => {
                      recentEvents.push({
                        id: `doc-${doc.id}`,
                        type: 'document',
                        title: 'Document Added',
                        description: doc.title,
                        date: new Date(doc.createdAt!),
                        icon: FileText,
                        color: 'text-purple-500'
                      });
                    });

                    // Sort by date and take top 5
                    recentEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
                    const topEvents = recentEvents.slice(0, 5);

                    if (topEvents.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-8">
                          No recent activity found
                        </p>
                      );
                    }

                    return topEvents.map(event => (
                      <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <event.icon className={`h-5 w-5 ${event.color}`} />
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description} • {format(event.date, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Patient History</CardTitle>
                <CardDescription>Chronological timeline of all patient appointments, treatments, tests, and medical events</CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="appointment">Appointments</SelectItem>
                      <SelectItem value="prescription">Prescriptions</SelectItem>
                      <SelectItem value="vital">Vitals</SelectItem>
                      <SelectItem value="allergy">Allergies</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="vaccination">Vaccinations</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Combine all events into a single timeline
                  const allEvents: Array<{
                    id: string;
                    type: string;
                    title: string;
                    description: string;
                    date: Date;
                    icon: any;
                    color: string;
                    details?: any;
                  }> = [];

                  // Add appointments
                  appointments?.forEach(apt => {
                    allEvents.push({
                      id: `apt-${apt.id}`,
                      type: 'appointment',
                      title: `Appointment with ${apt.doctor?.user?.firstName} ${apt.doctor?.user?.lastName}`,
                      description: `${apt.reason || 'General consultation'} - ${apt.status}`,
                      date: new Date(apt.appointmentDate),
                      icon: Calendar,
                      color: apt.status === 'completed' ? 'text-green-600' : apt.status === 'cancelled' ? 'text-red-600' : 'text-blue-600',
                      details: apt
                    });
                  });

                  // Add prescriptions
                  prescriptions?.forEach(prescription => {
                    allEvents.push({
                      id: `rx-${prescription.id}`,
                      type: 'prescription',
                      title: 'Prescription Issued',
                      description: prescription.diagnosis || 'Prescription for treatment',
                      date: new Date(prescription.createdAt!),
                      icon: Pill,
                      color: 'text-blue-600',
                      details: prescription
                    });
                  });

                  // Add vitals
                  vitals?.forEach(vital => {
                    allEvents.push({
                      id: `vital-${vital.id}`,
                      type: 'vital',
                      title: `${vital.type.replace('_', ' ').toUpperCase()} Recorded`,
                      description: `${vital.value} ${vital.unit} ${vital.notes ? ` - ${vital.notes}` : ''}`,
                      date: new Date(vital.recordedAt!),
                      icon: Activity,
                      color: 'text-green-600',
                      details: vital
                    });
                  });

                  // Add allergies
                  allergies?.forEach(allergy => {
                    allEvents.push({
                      id: `allergy-${allergy.id}`,
                      type: 'allergy',
                      title: 'Allergy Recorded',
                      description: `${allergy.allergen} (${allergy.type}) - ${allergy.severity} severity`,
                      date: new Date(allergy.createdAt!),
                      icon: Heart,
                      color: 'text-red-600',
                      details: allergy
                    });
                  });

                  // Add documents
                  documents?.forEach(doc => {
                    allEvents.push({
                      id: `doc-${doc.id}`,
                      type: 'document',
                      title: `${doc.type.replace('_', ' ').toUpperCase()} Added`,
                      description: doc.title,
                      date: new Date(doc.createdAt!),
                      icon: FileText,
                      color: 'text-purple-600',
                      details: doc
                    });
                  });

                  // Add bills
                  bills?.forEach(bill => {
                    allEvents.push({
                      id: `bill-${bill.id}`,
                      type: 'billing',
                      title: bill.status === 'paid' ? 'Payment Processed' : 'Bill Generated',
                      description: `${bill.description} - ₹${bill.amount}`,
                      date: new Date(bill.createdAt!),
                      icon: FileText,
                      color: bill.status === 'paid' ? 'text-green-600' : 'text-orange-600',
                      details: bill
                    });
                  });

                  // Add vaccinations
                  vaccinations?.forEach(vaccination => {
                    allEvents.push({
                      id: `vaccination-${vaccination.id}`,
                      type: 'vaccination',
                      title: 'Vaccination Administered',
                      description: `${vaccination.vaccineName} (${vaccination.vaccineType}) - Dose ${vaccination.doseNumber}`,
                      date: new Date(vaccination.administeredDate!),
                      icon: Activity,
                      color: 'text-blue-600',
                      details: vaccination
                    });
                  });

                  // Sort events by date (newest first)
                  allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

                  // Apply filters
                  let filteredEvents = allEvents;

                  if (historyFilter !== "all") {
                    filteredEvents = filteredEvents.filter(event => event.type === historyFilter);
                  }

                  if (historySearch) {
                    const searchLower = historySearch.toLowerCase();
                    filteredEvents = filteredEvents.filter(event =>
                      event.title.toLowerCase().includes(searchLower) ||
                      event.description.toLowerCase().includes(searchLower)
                    );
                  }

                  if (filteredEvents.length === 0) {
                    return (
                      <p className="text-center text-muted-foreground py-8">
                        No history events found
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredEvents.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${event.color}`}>
                            <event.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            {event.details && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {event.type === 'appointment' && event.details.notes && (
                                  <p><strong>Notes:</strong> {event.details.notes}</p>
                                )}
                                {event.type === 'prescription' && event.details.notes && (
                                  <p><strong>Notes:</strong> {event.details.notes}</p>
                                )}
                                {event.type === 'document' && event.details.description && (
                                  <p><strong>Description:</strong> {event.details.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prescription History</CardTitle>
                <CardDescription>All prescriptions for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions?.length ? (
                  <div className="space-y-4">
                    {prescriptions.map(prescription => (
                      <Card key={prescription.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Pill className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">Prescription #{prescription.id}</span>
                                <Badge variant="outline">
                                  {format(new Date(prescription.createdAt!), "MMM d, yyyy")}
                                </Badge>
                              </div>
                              {prescription.diagnosis && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Diagnosis:</strong> {prescription.diagnosis}
                                </p>
                              )}
                              {prescription.notes && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {prescription.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generatePrescriptionPDF(prescription)}
                              >
                                <FileDown className="h-4 w-4 mr-1" />
                                Print
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPrescriptionDetails(prescription)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No prescriptions found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vital Signs History</CardTitle>
                    <CardDescription>Patient's vital signs over time</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddVitalDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vital
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {vitals?.length ? (
                  <div className="space-y-4">
                    {vitals.map(vital => (
                      <Card key={vital.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                {vital.type === 'bp' && <Activity className="h-5 w-5 text-green-600" />}
                                {vital.type === 'glucose' && <Activity className="h-5 w-5 text-blue-600" />}
                                {vital.type === 'heart_rate' && <Heart className="h-5 w-5 text-red-600" />}
                                {vital.type === 'weight' && <Weight className="h-5 w-5 text-purple-600" />}
                                {vital.type === 'temperature' && <Thermometer className="h-5 w-5 text-orange-600" />}
                                {vital.type === 'bmi' && <Ruler className="h-5 w-5 text-indigo-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {vital.type.replace('_', ' ').toUpperCase()}: {vital.value} {vital.unit}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(vital.recordedAt!), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {vital.notes && (
                                <Badge variant="outline">{vital.notes}</Badge>
                              )}
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditVital(vital)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteVital(vital.id)}
                                  disabled={deleteVitalMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No vital signs recorded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allergies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Allergies & Reactions</CardTitle>
                    <CardDescription>Known allergies and adverse reactions</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddAllergyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Allergy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {allergies?.length ? (
                  <div className="space-y-4">
                    {allergies.map(allergy => (
                      <Card key={allergy.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="font-medium">{allergy.allergen}</span>
                                <Badge variant={
                                  allergy.severity === 'severe' ? 'destructive' :
                                  allergy.severity === 'moderate' ? 'default' : 'secondary'
                                }>
                                  {allergy.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Type:</strong> {allergy.type}
                              </p>
                              {allergy.reaction && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Reaction:</strong> {allergy.reaction}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAllergy(allergy)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAllergy(allergy.id)}
                                disabled={deleteAllergyMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No allergies recorded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Documents</CardTitle>
                    <CardDescription>Lab reports, imaging, and other documents</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setNewDocument(prev => ({ ...prev, type: "lab_report" }));
                      setShowAddDocumentDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lab Report
                    </Button>
                    <Button onClick={() => setShowAddDocumentDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {documents?.length ? (
                  <div className="space-y-4">
                    {documents.map(document => (
                      <Card key={document.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <FileText className="h-8 w-8 text-blue-500 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium">{document.title}</h4>
                                {document.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {document.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{document.type.replace('_', ' ')}</span>
                                  <span>{format(new Date(document.createdAt!), "MMM d, yyyy")}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(document)}
                            >
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No documents found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add Vital Dialog */}
      <Dialog open={showAddVitalDialog} onOpenChange={setShowAddVitalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vital Sign</DialogTitle>
            <DialogDescription>
              Record a new vital sign measurement for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vital-type">Type</Label>
                <Select value={newVital.type} onValueChange={(value: Vital["type"]) => setNewVital(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bp">Blood Pressure</SelectItem>
                    <SelectItem value="glucose">Glucose</SelectItem>
                    <SelectItem value="heart_rate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="bmi">BMI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vital-value">Value</Label>
                <Input
                  id="vital-value"
                  type="number"
                  step="0.1"
                  value={newVital.value}
                  onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vital-unit">Unit</Label>
              <Input
                id="vital-unit"
                value={newVital.unit}
                onChange={(e) => setNewVital(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., mmHg, mg/dL, bpm, kg, °C"
              />
            </div>
            <div>
              <Label htmlFor="vital-notes">Notes (Optional)</Label>
              <Textarea
                id="vital-notes"
                value={newVital.notes}
                onChange={(e) => setNewVital(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVitalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVital} disabled={addVitalMutation.isPending}>
              {addVitalMutation.isPending ? "Adding..." : "Add Vital"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vital Dialog */}
      <Dialog open={!!editingVital} onOpenChange={() => setEditingVital(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vital Sign</DialogTitle>
            <DialogDescription>
              Modify the vital sign measurement
            </DialogDescription>
          </DialogHeader>
          {editingVital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={editingVital.type} onValueChange={(value: Vital["type"]) => setEditingVital(prev => prev ? { ...prev, type: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bp">Blood Pressure</SelectItem>
                      <SelectItem value="glucose">Glucose</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="bmi">BMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingVital.value}
                    onChange={(e) => setEditingVital(prev => prev ? { ...prev, value: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={editingVital.unit || ""}
                  onChange={(e) => setEditingVital(prev => prev ? { ...prev, unit: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={editingVital.notes || ""}
                  onChange={(e) => setEditingVital(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVital(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVital} disabled={updateVitalMutation.isPending}>
              {updateVitalMutation.isPending ? "Updating..." : "Update Vital"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Allergy Dialog */}
      <Dialog open={showAddAllergyDialog} onOpenChange={setShowAddAllergyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
            <DialogDescription>
              Record a new allergy for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allergy-type">Type</Label>
                <Select value={newAllergy.type} onValueChange={(value: Allergy["type"]) => setNewAllergy(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="allergy-severity">Severity</Label>
                <Select value={newAllergy.severity} onValueChange={(value: Allergy["severity"]) => setNewAllergy(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="allergen">Allergen</Label>
              <Input
                id="allergen"
                value={newAllergy.allergen}
                onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                placeholder="Enter allergen name"
              />
            </div>
            <div>
              <Label htmlFor="reaction">Reaction (Optional)</Label>
              <Textarea
                id="reaction"
                value={newAllergy.reaction}
                onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                placeholder="Describe the reaction"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAllergyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllergy} disabled={addAllergyMutation.isPending}>
              {addAllergyMutation.isPending ? "Adding..." : "Add Allergy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Allergy Dialog */}
      <Dialog open={!!editingAllergy} onOpenChange={() => setEditingAllergy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergy</DialogTitle>
            <DialogDescription>
              Modify allergy information
            </DialogDescription>
          </DialogHeader>
          {editingAllergy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={editingAllergy.type} onValueChange={(value: Allergy["type"]) => setEditingAllergy(prev => prev ? { ...prev, type: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={editingAllergy.severity || "moderate"} onValueChange={(value) => setEditingAllergy(prev => prev ? { ...prev, severity: value as Allergy["severity"] } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Allergen</Label>
                <Input
                  value={editingAllergy.allergen}
                  onChange={(e) => setEditingAllergy(prev => prev ? { ...prev, allergen: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Reaction (Optional)</Label>
                <Textarea
                  value={editingAllergy.reaction || ""}
                  onChange={(e) => setEditingAllergy(prev => prev ? { ...prev, reaction: e.target.value } : null)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAllergy(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAllergy} disabled={updateAllergyMutation.isPending}>
              {updateAllergyMutation.isPending ? "Updating..." : "Update Allergy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocumentDialog} onOpenChange={setShowAddDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a medical document for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={newDocument.type} onValueChange={(value: Document["type"]) => setNewDocument(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab_report">Lab Report</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                  <SelectItem value="visit_summary">Visit Summary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <Label htmlFor="doc-description">Description (Optional)</Label>
              <Textarea
                id="doc-description"
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="doc-file">File</Label>
              <Input
                id="doc-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocumentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={addDocumentMutation.isPending}>
              {addDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog open={showPrescriptionDetails} onOpenChange={setShowPrescriptionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Complete prescription information
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6">
              {/* Prescription Header */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Prescription #{selectedPrescription.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Issued on {format(new Date(selectedPrescription.createdAt!), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {selectedPrescription.status}
                </Badge>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div>
                  <Label className="text-sm font-medium">Diagnosis</Label>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/30 rounded">
                    {selectedPrescription.diagnosis}
                  </p>
                </div>
              )}

              {/* Medicines */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Prescribed Medicines</Label>
                <div className="space-y-3">
                  {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                    selectedPrescription.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.medicine?.name || 'Unknown Medicine'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Dosage:</span>
                                <span className="ml-1 font-medium">{item.dosage || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Frequency:</span>
                                <span className="ml-1 font-medium">{item.frequency || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="ml-1 font-medium">{item.duration || 'Not specified'}</span>
                              </div>
                            </div>
                            {item.instructions && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Instructions:</span>
                                <span className="ml-1">{item.instructions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No medicines prescribed
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/30 rounded">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patient?.firstName} {patient?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedPrescription.patientId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {selectedPrescription.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(selectedPrescription.createdAt!), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedPrescription && generatePrescriptionPDF(selectedPrescription)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Print PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPrescriptionDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
