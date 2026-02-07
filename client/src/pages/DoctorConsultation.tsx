import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronLeft,
  User,
  Calendar,
  Phone,
  AlertTriangle,
  Activity,
  FileText,
  Pill,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Upload,
  Flag,
  RotateCcw,
  Bell
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AppointmentWithDetails, Vital, Allergy, Prescription, Medicine, Vaccination, FamilyMember, Document, Bill, Message } from "@shared/schema";
import jsPDF from "jspdf";

interface PrescriptionItem {
  medicineId?: number; // Optional for custom medicines
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  isCustom?: boolean;
}

export default function DoctorConsultation() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showReprescribeDialog, setShowReprescribeDialog] = useState(false);
  const [showFlagAlertDialog, setShowFlagAlertDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [quickAddMedicineName, setQuickAddMedicineName] = useState("");
  const [alertNote, setAlertNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for consultation
  const mockAppointment: AppointmentWithDetails = {
    id: parseInt(id || "1"),
    patientId: "dev-user",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "10:00:00",
    status: "confirmed",
    reason: "Regular checkup",
    notes: "Patient reports feeling well",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 1,
      userId: "mock-doctor-user-id",
      departmentId: 1,
      specialty: "General Medicine",
      qualification: "MD",
      experience: 10,
      consultationFee: "100.00",
      bio: "Experienced general practitioner",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id",
        email: "dr.smith@hospital.com",
        firstName: "John",
        lastName: "Smith",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1980-01-01",
        gender: "male",
        address: "Medical Center",
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 1,
        name: "General Medicine",
        description: "Primary healthcare",
        icon: "stethoscope",
        createdAt: new Date()
      }
    },
    patient: {
      id: "dev-user",
      email: "patient@localhost",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  const mockPatientVitals: Vital[] = [
    {
      id: 1,
      patientId: "dev-user",
      type: "bp",
      value: "120/80",
      unit: "mmHg",
      recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: "Normal blood pressure"
    },
    {
      id: 2,
      patientId: "dev-user",
      type: "glucose",
      value: "95",
      unit: "mg/dL",
      recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: "Fasting glucose"
    },
    {
      id: 3,
      patientId: "dev-user",
      type: "weight",
      value: "70",
      unit: "kg",
      recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: "Body weight"
    }
  ];

  const mockPatientAllergies: Allergy[] = [
    {
      id: 1,
      patientId: "dev-user",
      type: "medicine",
      allergen: "Penicillin",
      severity: "moderate",
      reaction: "Rash",
      createdAt: new Date()
    }
  ];

  const mockPatientHistory: Prescription[] = [
    {
      id: 1,
      appointmentId: 1,
      patientId: "dev-user",
      doctorId: 1,
      diagnosis: "Hypertension",
      notes: "Prescribed medication for blood pressure",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockMedicines: Medicine[] = [
    {
      id: 1,
      name: "Amlodipine",
      genericName: "Amlodipine",
      category: "Antihypertensive",
      manufacturer: "Generic",
      dosageForm: "Tablet",
      strength: "5mg",
      description: "Calcium channel blocker for hypertension",
      createdAt: new Date()
    },
    {
      id: 2,
      name: "Metformin",
      genericName: "Metformin",
      category: "Antidiabetic",
      manufacturer: "Generic",
      dosageForm: "Tablet",
      strength: "500mg",
      description: "Oral hypoglycemic agent",
      createdAt: new Date()
    },
    {
      id: 3,
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      category: "NSAID",
      manufacturer: "Generic",
      dosageForm: "Tablet",
      strength: "400mg",
      description: "Non-steroidal anti-inflammatory drug",
      createdAt: new Date()
    },
    {
      id: 4,
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      category: "Antibiotic",
      manufacturer: "Generic",
      dosageForm: "Capsule",
      strength: "500mg",
      description: "Beta-lactam antibiotic",
      createdAt: new Date()
    }
  ];

  // Simulate loading and set data
  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(null);
  const [patientVitals, setPatientVitals] = useState<Vital[]>([]);
  const [patientAllergies, setPatientAllergies] = useState<Allergy[]>([]);
  const [patientHistory, setPatientHistory] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Fetch existing prescriptions for this appointment
  const { data: existingPrescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: [`/api/appointments/${id}/prescriptions`],
    enabled: !!id,
  });

  // Fetch medicines from API
  const { data: apiMedicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ["/api/medicines"],
    enabled: true,
  });

  // Load mock data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAppointment(mockAppointment);
      setPatientVitals(mockPatientVitals);
      setPatientAllergies(mockPatientAllergies);
      setPatientHistory(mockPatientHistory);

      setIsLoading(false);
    };

    loadData();
  }, [id]);

  // Set medicines when API data is loaded
  React.useEffect(() => {
    if (apiMedicines) {
      setMedicines(apiMedicines);
    }
  }, [apiMedicines]);

  // Load existing prescriptions into state when they are fetched
  React.useEffect(() => {
    if (existingPrescriptions && existingPrescriptions.length > 0) {
      const prescription = existingPrescriptions[0]; // Get the most recent prescription
      if (prescription.items && prescription.items.length > 0) {
        const items: PrescriptionItem[] = prescription.items.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicine?.name || 'Unknown Medicine',
          dosage: item.dosage || '',
          frequency: item.frequency || '',
          duration: item.duration || '',
          instructions: item.instructions || '',
          isCustom: false,
        }));
        setPrescriptionItems(items);
      }
      // Also set diagnosis and notes if available
      if (prescription.diagnosis) {
        setDiagnosis(prescription.diagnosis);
      }
      if (prescription.notes) {
        setNotes(prescription.notes);
      }
    }
  }, [existingPrescriptions]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Process prescription items for API
      const processedItems = prescriptionItems.map(item => {
        if (item.isCustom) {
          // For custom medicines, send medicineName
          return {
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
          };
        } else {
          // For regular medicines, send medicineId
          return {
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
          };
        }
      });

      const response = await apiRequest("POST", `/api/doctor/appointments/${id}/complete`, {
        diagnosis,
        notes,
        prescriptionItems: processedItems,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Consultation Completed",
        description: "The appointment has been marked as complete and prescription saved.",
      });
      // Invalidate prescription queries so they refresh
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });
      setLocation("/doctor");
    },
    onError: (error) => {
      toast({
        title: "Failed to Complete",
        description: error.message || "Failed to complete consultation",
        variant: "destructive",
      });
    },
  });

  const filteredMedicines = medicines?.filter(m => {
    if (!medicineSearch) return true;
    const searchLower = medicineSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchLower) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchLower)) ||
      (m.category && m.category.toLowerCase().includes(searchLower)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(searchLower))
    );
  });

  const checkAllergyConflicts = (medicine: Medicine) => {
    if (!patientAllergies || patientAllergies.length === 0) return [];

    const medicineText = `${medicine.name} ${medicine.genericName || ""} ${medicine.category || ""}`.toLowerCase();
    const conflictingAllergies = patientAllergies.filter(allergy => {
      const allergenText = allergy.allergen.toLowerCase();

      // Check for direct matches
      if (medicineText.includes(allergenText) || allergenText.includes(medicineText.split(" ")[0])) {
        return true;
      }

      // Check for common drug class allergies
      const drugClasses: Record<string, string[]> = {
        "penicillin": ["penicillin", "amoxicillin", "ampicillin", "cephalosporin"],
        "sulfa": ["sulfamethoxazole", "sulfasalazine", "sulfadiazine", "bactrim"],
        "nsaid": ["ibuprofen", "aspirin", "naproxen", "diclofenac", "indomethacin"],
        "opioid": ["morphine", "codeine", "oxycodone", "hydrocodone", "fentanyl"],
        "beta_lactam": ["penicillin", "cephalosporin", "carbapenem", "monobactam"],
      };

      // Check if medicine belongs to an allergic drug class
      for (const [className, drugs] of Object.entries(drugClasses)) {
        if (drugs.some(drug => medicineText.includes(drug)) &&
            (allergenText.includes(className) || drugs.some(drug => allergenText.includes(drug)))) {
          return true;
        }
      }

      return false;
    });

    return conflictingAllergies;
  };

  const addMedicine = (medicine: Medicine, isCustom = false) => {
    const conflictingAllergies = checkAllergyConflicts(medicine);

    if (conflictingAllergies.length > 0) {
      const severeAllergies = conflictingAllergies.filter(a => a.severity === "severe");
      const moderateAllergies = conflictingAllergies.filter(a => a.severity === "moderate");

      toast({
        title: severeAllergies.length > 0 ? "SEVERE ALLERGY ALERT!" : "Allergy Warning!",
        description: `Patient allergic to: ${conflictingAllergies.map(a => a.allergen).join(", ")}. ${severeAllergies.length > 0 ? "DO NOT prescribe!" : "Please confirm before prescribing."}`,
        variant: severeAllergies.length > 0 ? "destructive" : "destructive",
      });

      // For severe allergies, don't add the medicine automatically
      if (severeAllergies.length > 0) {
        return;
      }
    }

    setPrescriptionItems(prev => [...prev, {
      ...(isCustom ? {} : { medicineId: medicine.id }),
      medicineName: medicine.name,
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      isCustom,
    }]);
    setShowMedicineDialog(false);
    setMedicineSearch("");
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDFSummary = () => {
    if (!appointment) {
      toast({
        title: "Error",
        description: "Appointment data not available",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Patient Medical Summary", 20, 30);

    doc.setFontSize(12);
    doc.text(`Patient: ${appointment.patient?.firstName} ${appointment.patient?.lastName}`, 20, 50);
    doc.text(`Date: ${format(new Date(), "MMMM d, yyyy")}`, 20, 60);
    doc.text(`Doctor: Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`, 20, 70);

    let yPosition = 90;

    // Current Visit
    doc.setFontSize(14);
    doc.text("Current Visit", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(appointment.appointmentDate), "MMM d, yyyy")}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Time: ${appointment.appointmentTime}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Reason: ${appointment.reason || "General Consultation"}`, 20, yPosition);
    yPosition += 15;

    // Diagnosis
    if (diagnosis) {
      doc.setFontSize(12);
      doc.text("Diagnosis:", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      const diagnosisLines = doc.splitTextToSize(diagnosis, 170);
      doc.text(diagnosisLines, 20, yPosition);
      yPosition += diagnosisLines.length * 5 + 10;
    }

    // Current Prescription
    if (prescriptionItems.length > 0) {
      doc.setFontSize(12);
      doc.text("Current Prescription:", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      prescriptionItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.medicineName}`, 20, yPosition);
        yPosition += 6;
        doc.text(`   Dosage: ${item.dosage || 'Not specified'} | Frequency: ${item.frequency || 'Not specified'} | Duration: ${item.duration || 'Not specified'}`, 20, yPosition);
        yPosition += 6;
        if (item.instructions) {
          doc.text(`   Instructions: ${item.instructions}`, 20, yPosition);
          yPosition += 6;
        }
        yPosition += 4;
      });
      yPosition += 10;
    }

    // Recent Vitals
    if (patientVitals && patientVitals.length > 0) {
      doc.setFontSize(12);
      doc.text("Recent Vitals:", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      patientVitals.slice(0, 5).forEach(vital => {
        const vitalType = vital.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`${vitalType}: ${vital.value} ${vital.unit}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Allergies
    if (patientAllergies && patientAllergies.length > 0) {
      doc.setFontSize(12);
      doc.text("Allergies:", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      patientAllergies.forEach(allergy => {
        doc.text(`${allergy.allergen} (${allergy.severity})`, 20, yPosition);
        yPosition += 6;
        if (allergy.reaction) {
          doc.text(`  Reaction: ${allergy.reaction}`, 20, yPosition);
          yPosition += 6;
        }
      });
      yPosition += 10;
    }

    // Visit Notes
    if (notes) {
      doc.setFontSize(12);
      doc.text("Visit Notes:", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(notes, 170);
      doc.text(notesLines, 20, yPosition);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, 20, pageHeight - 20);

    // Save the PDF
    const fileName = `Patient_Summary_${appointment.patient?.firstName}_${appointment.patient?.lastName}_${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Generated",
      description: "Patient summary PDF has been downloaded.",
    });
  };

  if (isLoading || medicinesLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground">Appointment not found</p>
        <Link href="/doctor">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const severeAllergies = patientAllergies?.filter(a => a.severity === "severe") || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/doctor">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Consultation</h1>
          <p className="text-muted-foreground">
            {format(new Date(appointment.appointmentDate), "MMMM d, yyyy")} at {appointment.appointmentTime}
          </p>
        </div>
        <Button 
          onClick={() => setShowCompleteDialog(true)}
          data-testid="button-complete-consultation"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Visit
        </Button>
      </div>

      {/* Allergy Alert */}
      {severeAllergies.length > 0 && (
        <Card className="mb-6 border-red-500/50 bg-red-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Severe Allergies Alert</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {severeAllergies.map(allergy => (
                  <Badge key={allergy.id} variant="destructive">
                    {allergy.allergen}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescription Management
                </CardTitle>
                <CardDescription>Create and manage patient prescriptions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowMedicineDialog(true)}
                  data-testid="button-add-medicine"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prescriptionItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No medicines added yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowMedicineDialog(true)}
                  >
                    Add Medicine
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptionItems.map((item, index) => {
                    // Find the medicine object to check for allergies
                    const medicineObj = item.medicineId ? medicines?.find(m => m.id === item.medicineId) : null;
                    // For custom medicines, create a mock medicine object for allergy checking
                    const mockMedicineForAllergy = item.isCustom ? {
                      id: 0,
                      name: item.medicineName,
                      genericName: item.medicineName,
                      category: 'General',
                      manufacturer: 'Unknown',
                      dosageForm: 'tablet',
                      strength: 'Unknown',
                      description: '',
                      createdAt: new Date()
                    } : medicineObj;
                    const allergyConflicts = mockMedicineForAllergy ? checkAllergyConflicts(mockMedicineForAllergy) : [];
                    const hasSevereAllergy = allergyConflicts.some(a => a.severity === "severe");
                    const hasModerateAllergy = allergyConflicts.some(a => a.severity === "moderate");

                    return (
                      <div key={index} className={`p-4 rounded-lg border bg-card ${hasSevereAllergy ? "border-red-500 bg-red-500/5" : hasModerateAllergy ? "border-orange-500 bg-orange-500/5" : ""}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.medicineName}</h4>
                            {hasSevereAllergy && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Severe Allergy
                              </Badge>
                            )}
                            {hasModerateAllergy && !hasSevereAllergy && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Allergy Warning
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrescriptionItem(index)}
                            data-testid={`button-remove-medicine-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>

                        {allergyConflicts.length > 0 && (
                          <div className="mb-3 p-2 rounded bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                              <AlertTriangle className="h-4 w-4 inline mr-1" />
                              Patient allergic to: {allergyConflicts.map(a => a.allergen).join(", ")}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">Dosage</label>
                            <Input
                              placeholder="e.g., 500mg"
                              value={item.dosage}
                              onChange={(e) => updatePrescriptionItem(index, "dosage", e.target.value)}
                              className="mt-1"
                              data-testid={`input-dosage-${index}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Frequency</label>
                            <Input
                              placeholder="e.g., Twice daily"
                              value={item.frequency}
                              onChange={(e) => updatePrescriptionItem(index, "frequency", e.target.value)}
                              className="mt-1"
                              data-testid={`input-frequency-${index}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Duration</label>
                            <Input
                              placeholder="e.g., 7 days"
                              value={item.duration}
                              onChange={(e) => updatePrescriptionItem(index, "duration", e.target.value)}
                              className="mt-1"
                              data-testid={`input-duration-${index}`}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs text-muted-foreground">Instructions</label>
                          <Input
                            placeholder="Special instructions..."
                            value={item.instructions}
                            onChange={(e) => updatePrescriptionItem(index, "instructions", e.target.value)}
                            className="mt-1"
                            data-testid={`input-instructions-${index}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Prescription Display */}
          {prescriptionItems.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Prescription
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    {prescriptionItems.length} medicine{prescriptionItems.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96 px-6 pb-6">
                  <div className="space-y-4">
                    {prescriptionItems.map((item, index) => {
                      const medicineObj = item.medicineId ? medicines?.find(m => m.id === item.medicineId) : null;
                      const mockMedicineForAllergy = item.isCustom ? {
                        id: 0,
                        name: item.medicineName,
                        genericName: item.medicineName,
                        category: 'General',
                        manufacturer: 'Unknown',
                        dosageForm: 'tablet',
                        strength: 'Unknown',
                        description: '',
                        createdAt: new Date()
                      } : medicineObj;
                      const allergyConflicts = mockMedicineForAllergy ? checkAllergyConflicts(mockMedicineForAllergy) : [];
                      const hasSevereAllergy = allergyConflicts.some(a => a.severity === "severe");
                      const hasModerateAllergy = allergyConflicts.some(a => a.severity === "moderate");

                      return (
                        <div key={index} className={`p-4 rounded-lg border bg-card/50 backdrop-blur-sm ${hasSevereAllergy ? "border-red-500/50 bg-red-500/10" : hasModerateAllergy ? "border-orange-500/50 bg-orange-500/10" : "border-border/50"}`}>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                              <span className="text-sm font-semibold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <h4 className="font-semibold text-base leading-tight">{item.medicineName}</h4>
                                <div className="flex gap-1 flex-shrink-0">
                                  {hasSevereAllergy && (
                                    <Badge variant="destructive" className="text-xs px-2 py-1">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Severe Allergy
                                    </Badge>
                                  )}
                                  {hasModerateAllergy && !hasSevereAllergy && (
                                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-orange-100 text-orange-800 hover:bg-orange-100">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Allergy Warning
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {allergyConflicts.length > 0 && (
                                <div className="mb-4 p-3 rounded-md bg-muted/70 border border-muted-foreground/20">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Allergy Alert</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Patient allergic to: {allergyConflicts.map(a => a.allergen).join(", ")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                <div className="bg-muted/30 rounded-md p-3">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Dosage</div>
                                  <div className="text-sm font-semibold">{item.dosage || "Not specified"}</div>
                                </div>
                                <div className="bg-muted/30 rounded-md p-3">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Frequency</div>
                                  <div className="text-sm font-semibold">{item.frequency || "Not specified"}</div>
                                </div>
                                <div className="bg-muted/30 rounded-md p-3">
                                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Duration</div>
                                  <div className="text-sm font-semibold">{item.duration || "Not specified"}</div>
                                </div>
                              </div>

                              {item.instructions && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 border border-blue-200 dark:border-blue-800">
                                  <div className="text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wide font-medium mb-1">Special Instructions</div>
                                  <div className="text-sm text-blue-800 dark:text-blue-200">{item.instructions}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis & Visit Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Diagnosis & Visit Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Diagnosis</label>
                <Textarea
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                  className="mt-2"
                  data-testid="textarea-diagnosis"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Visit Notes</label>
                <Textarea
                  placeholder="Clinical notes, treatment plan, and patient advice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                  data-testid="textarea-notes"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lifestyle Advice</label>
                  <Textarea
                    placeholder="Diet, exercise, lifestyle recommendations..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Follow-up Instructions</label>
                  <Textarea
                    placeholder="When to return, warning signs to watch for..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Next Visit Date</label>
                  <Input
                    type="date"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Visit Reason</label>
                  <Input
                    placeholder="Reason for next appointment"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient History Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient History Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-lg">{patientHistory?.length || 0}</p>
                    <p className="text-muted-foreground">Total Visits</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-lg">{patientVitals?.length || 0}</p>
                    <p className="text-muted-foreground">Vital Records</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-lg">{patientAllergies?.length || 0}</p>
                    <p className="text-muted-foreground">Allergies</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-lg">{prescriptionItems.length}</p>
                    <p className="text-muted-foreground">Current Rx</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={generatePDFSummary}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Reports & Documents */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Reports & Documents
              </CardTitle>
              <CardDescription>Upload lab reports, radiology results, discharge summaries, and other medical documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Upload Lab Report Button */}
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Upload Lab Report</span>
                </Button>

                {/* Upload Radiology Report Button */}
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Activity className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Upload Radiology</span>
                </Button>

                {/* Upload Documents Button */}
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-purple-500" />
                  <span className="text-sm font-medium">Upload Documents</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setShowReprescribeDialog(true)}
                >
                  <RotateCcw className="h-5 w-5 mr-3 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Re-prescribe</div>
                    <div className="text-xs text-muted-foreground">Use previous prescription</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setShowFlagAlertDialog(true)}
                >
                  <Flag className="h-5 w-5 mr-3 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Flag Alert</div>
                    <div className="text-xs text-muted-foreground">Mark important health alert</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setShowFollowUpDialog(true)}
                >
                  <Bell className="h-5 w-5 mr-3 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Follow-up Required</div>
                    <div className="text-xs text-muted-foreground">Schedule follow-up visit</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setLocation(`/doctor/patient/${appointment?.patient?.id}/records`)}
                >
                  <FileText className="h-5 w-5 mr-3 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">View History</div>
                    <div className="text-xs text-muted-foreground">Patient medical history</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Patient Info */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={appointment.patient?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {appointment.patient?.firstName?.[0] || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{appointment.patient?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {appointment.patient?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {appointment.patient.phone}
                  </div>
                )}
                {appointment.patient?.dateOfBirth && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(appointment.patient.dateOfBirth), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient History Tabs */}
          <Card>
            <Tabs defaultValue="allergies">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="allergies" data-testid="tab-allergies">Allergies</TabsTrigger>
                  <TabsTrigger value="vitals" data-testid="tab-vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="allergies" className="mt-0">
                  {patientAllergies && patientAllergies.length > 0 ? (
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {patientAllergies.map((allergy, index) => (
                          <div
                            key={allergy.id}
                            className={`p-4 rounded-lg border ${
                              allergy.severity === "severe"
                                ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                                : allergy.severity === "moderate"
                                ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                                : "border-muted bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  allergy.severity === "severe"
                                    ? "bg-red-100 text-red-600"
                                    : allergy.severity === "moderate"
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{allergy.allergen}</h4>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {allergy.type} allergy • {allergy.severity} severity
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={allergy.severity === "severe" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {allergy.severity}
                              </Badge>
                            </div>
                            {allergy.reaction && (
                              <div className="mt-3 p-3 bg-background/50 rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">Reaction:</p>
                                <p className="text-sm">{allergy.reaction}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No allergies recorded</p>
                      <p className="text-xs text-muted-foreground mt-1">Patient has no known allergies</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="vitals" className="mt-0">
                  {patientVitals && patientVitals.length > 0 ? (
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {patientVitals.slice(0, 10).map((vital, index) => (
                          <div
                            key={vital.id}
                            className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Activity className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm capitalize">
                                    {vital.type.replace("_", " ")}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(vital.recordedAt), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {vital.value}
                                  <span className="text-sm font-normal text-muted-foreground ml-1">
                                    {vital.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {vital.notes && (
                              <div className="mt-3 p-3 bg-muted/30 rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                <p className="text-sm">{vital.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No vitals recorded</p>
                      <p className="text-xs text-muted-foreground mt-1">Vital signs will appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  {patientHistory && patientHistory.length > 0 ? (
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {patientHistory.map((rx, index) => (
                          <div
                            key={rx.id}
                            className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {rx.diagnosis || "General Consultation"}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(rx.createdAt!), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {rx.status || "completed"}
                              </Badge>
                            </div>

                            {rx.notes && (
                              <div className="mb-3 p-3 bg-muted/30 rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                <p className="text-sm">{rx.notes}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Prescription #{rx.id}</span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Dr. {rx.doctorId}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No prescription history found</p>
                      <p className="text-xs text-muted-foreground mt-1">Previous consultations will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Quick Add Medicine Dialog */}
      <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Medicine</DialogTitle>
            <DialogDescription>
              Enter the medicine name to add it to the prescription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Medicine Name</label>
              <Input
                placeholder="Enter medicine name..."
                value={quickAddMedicineName}
                onChange={(e) => setQuickAddMedicineName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (quickAddMedicineName.trim()) {
                  const customMedicine: Medicine = {
                    id: Date.now(),
                    name: quickAddMedicineName.trim(),
                    genericName: quickAddMedicineName.trim(),
                    category: 'General',
                    manufacturer: 'Unknown',
                    dosageForm: 'tablet',
                    strength: 'Unknown',
                    description: '',
                    createdAt: new Date()
                  };
                  addMedicine(customMedicine, true);
                  setQuickAddMedicineName("");
                  setShowQuickAddDialog(false);
                }
              }}
              disabled={!quickAddMedicineName.trim()}
            >
              Add Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medicine Search Dialog */}
      <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogDescription>
              Search and select a medicine from the database.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
              className="pl-10"
              data-testid="input-medicine-search"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredMedicines?.map(medicine => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                  onClick={() => addMedicine(medicine)}
                  data-testid={`medicine-option-${medicine.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{medicine.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {medicine.genericName && (
                        <Badge variant="secondary" className="text-xs">
                          Generic: {medicine.genericName}
                        </Badge>
                      )}
                      {(medicine.dosageForm || medicine.strength) && (
                        <Badge variant="outline" className="text-xs">
                          {medicine.dosageForm} {medicine.strength}
                        </Badge>
                      )}
                      {medicine.category && (
                        <Badge variant="outline" className="text-xs">
                          {medicine.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              ))}
              {filteredMedicines?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No medicines found</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Prescription Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Templates</DialogTitle>
            <DialogDescription>
              Select a common prescription template to quickly add medicines.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div
                className="p-4 border rounded-lg hover-elevate cursor-pointer"
                onClick={() => {
                  // Add hypertension template
                  setPrescriptionItems([
                    {
                      medicineId: 1,
                      medicineName: "Amlodipine",
                      dosage: "5mg",
                      frequency: "Once daily",
                      duration: "30 days",
                      instructions: "Take in the morning with food",
                      isCustom: false,
                    },
                    {
                      medicineId: 2,
                      medicineName: "Metoprolol",
                      dosage: "25mg",
                      frequency: "Twice daily",
                      duration: "30 days",
                      instructions: "Take with meals",
                      isCustom: false,
                    }
                  ]);
                  setShowTemplateDialog(false);
                }}
              >
                <h4 className="font-medium">Hypertension Management</h4>
                <p className="text-sm text-muted-foreground">Amlodipine + Metoprolol combination</p>
              </div>

              <div
                className="p-4 border rounded-lg hover-elevate cursor-pointer"
                onClick={() => {
                  // Add diabetes template
                  setPrescriptionItems([
                    {
                      medicineId: 3,
                      medicineName: "Metformin",
                      dosage: "500mg",
                      frequency: "Twice daily",
                      duration: "30 days",
                      instructions: "Take with meals",
                      isCustom: false,
                    },
                    {
                      medicineId: 4,
                      medicineName: "Glimepiride",
                      dosage: "2mg",
                      frequency: "Once daily",
                      duration: "30 days",
                      instructions: "Take 30 minutes before breakfast",
                      isCustom: false,
                    }
                  ]);
                  setShowTemplateDialog(false);
                }}
              >
                <h4 className="font-medium">Diabetes Management</h4>
                <p className="text-sm text-muted-foreground">Metformin + Glimepiride combination</p>
              </div>

              <div
                className="p-4 border rounded-lg hover-elevate cursor-pointer"
                onClick={() => {
                  // Add infection template
                  setPrescriptionItems([
                    {
                      medicineId: 5,
                      medicineName: "Amoxicillin",
                      dosage: "500mg",
                      frequency: "Three times daily",
                      duration: "7 days",
                      instructions: "Take with food, complete full course",
                      isCustom: false,
                    }
                  ]);
                  setShowTemplateDialog(false);
                }}
              >
                <h4 className="font-medium">Bacterial Infection</h4>
                <p className="text-sm text-muted-foreground">Amoxicillin antibiotic course</p>
              </div>

              <div
                className="p-4 border rounded-lg hover-elevate cursor-pointer"
                onClick={() => {
                  // Add pain management template
                  setPrescriptionItems([
                    {
                      medicineId: 6,
                      medicineName: "Ibuprofen",
                      dosage: "400mg",
                      frequency: "Three times daily",
                      duration: "5 days",
                      instructions: "Take with food, maximum 5 days",
                      isCustom: false,
                    }
                  ]);
                  setShowTemplateDialog(false);
                }}
              >
                <h4 className="font-medium">Pain Management</h4>
                <p className="text-sm text-muted-foreground">Ibuprofen for acute pain</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Consultation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Consultation</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this consultation as complete? This will save the prescription and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medicines prescribed:</span>
                <span className="font-medium">{prescriptionItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diagnosis:</span>
                <span className="font-medium">{diagnosis ? "Added" : "Not added"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              data-testid="button-confirm-complete"
            >
              {completeMutation.isPending ? "Completing..." : "Complete Consultation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
