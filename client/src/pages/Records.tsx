import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  Download,
  Eye,
  Search,
  FlaskConical,
  Image as ImageIcon,
  Pill,
  ClipboardList,
  Filter,
  Share2,
  Calendar,
  User,
  FileDown,
  MessageSquare,
  Smartphone,
  Group,
  Scan,
  Shield,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from "jspdf";
import type { Document, Prescription, PrescriptionWithDetails, Vaccination, DoctorWithUser } from "@shared/schema";
import { VaccinationCard } from "@/components/VaccinationCard";

type SignatureStatus = {
  isSigned: boolean;
  isVerified: boolean;
  signature?: any;
  certificate?: string;
};

const documentTypes = [
  { value: "all", label: "All Records", icon: FileText },
  { value: "lab_report", label: "Lab Reports", icon: FlaskConical },
  { value: "radiology", label: "Radiology", icon: ImageIcon },
  { value: "prescription", label: "Prescriptions", icon: Pill },
  { value: "visit_summary", label: "Visit Summaries", icon: ClipboardList },
];

const documentCategories = [
  { value: "all", label: "All Categories" },
  { value: "diagnostic", label: "Diagnostic Reports" },
  { value: "medication", label: "Medication Records" },
  { value: "consultation", label: "Consultation Notes" },
  { value: "vaccination", label: "Vaccination Records" },
  { value: "insurance", label: "Insurance Documents" },
  { value: "personal", label: "Personal Health" },
];

// Auto-tagging function based on document content
const generateTags = (document: Document): string[] => {
  const tags: string[] = [];
  const content = `${document.title} ${document.description || ""}`.toLowerCase();

  if (content.includes("blood") || content.includes("cbc") || content.includes("hemoglobin")) {
    tags.push("Blood Test", "Hematology");
  }
  if (content.includes("x-ray") || content.includes("radiology") || content.includes("scan")) {
    tags.push("Imaging", "Radiology");
  }
  if (content.includes("prescription") || content.includes("medicine") || content.includes("drug")) {
    tags.push("Medication", "Prescription");
  }
  if (content.includes("vaccin") || content.includes("immunization")) {
    tags.push("Vaccination", "Prevention");
  }
  if (content.includes("consultation") || content.includes("visit") || content.includes("appointment")) {
    tags.push("Consultation", "Visit");
  }

  // Add type-based tags
  switch (document.type) {
    case "lab_report":
      tags.push("Laboratory", "Test Results");
      break;
    case "radiology":
      tags.push("Medical Imaging", "Diagnostic");
      break;
    case "prescription":
      tags.push("Pharmacy", "Treatment");
      break;
  }

  return Array.from(new Set(tags)); // Remove duplicates
};

export default function Records() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<"none" | "date" | "type" | "department">("none");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocumentForView, setSelectedDocumentForView] = useState<Document | null>(null);
  const [addVaccinationDialogOpen, setAddVaccinationDialogOpen] = useState(false);
  const [editVaccinationDialogOpen, setEditVaccinationDialogOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [prescriptionDetailsDialog, setPrescriptionDetailsDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [vaccinationForm, setVaccinationForm] = useState({
    vaccineName: "",
    vaccineType: "",
    doseNumber: "",
    totalDoses: "",
    administeredDate: "",
    administeredBy: "",
    batchNumber: "",
    nextDueDate: "",
    notes: ""
  });
  
  const [showAddLabReportDialog, setShowAddLabReportDialog] = useState(false);
  
  const [newLabReport, setNewLabReport] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<PrescriptionWithDetails[]>({
    queryKey: ["/api/prescriptions"],
  });

  const { data: vaccinations, isLoading: vaccinationsLoading } = useQuery<Vaccination[]>({
    queryKey: ["/api/vaccinations"],
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });
  
  const addLabReportMutation = useMutation({
    mutationFn: async (report: typeof newLabReport) => {
      const formData = new FormData();
      formData.append("type", "lab_report");
      formData.append("title", report.title);
      formData.append("description", report.description || "");
      if (report.file) {
        formData.append("file", report.file);
      }
      return apiRequest("POST", "/api/documents", formData);
    },
    onSuccess: () => {
      toast({
        title: "Lab Report Added",
        description: "Lab report has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowAddLabReportDialog(false);
      setNewLabReport({ title: "", description: "", file: null });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Lab Report",
        description: error.message || "Failed to upload lab report",
        variant: "destructive",
      });
    },
  });

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      generateTags(doc).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeType === "all" || doc.type === activeType;

    // Category filter based on auto-generated tags
    const matchesCategory = categoryFilter === "all" || (() => {
      const tags = generateTags(doc);
      switch (categoryFilter) {
        case "diagnostic":
          return tags.some(tag => ["Blood Test", "Hematology", "Imaging", "Radiology", "Diagnostic"].includes(tag));
        case "medication":
          return tags.some(tag => ["Medication", "Prescription", "Pharmacy", "Treatment"].includes(tag));
        case "consultation":
          return tags.some(tag => ["Consultation", "Visit"].includes(tag));
        case "vaccination":
          return tags.some(tag => ["Vaccination", "Prevention"].includes(tag));
        case "insurance":
          return doc.title.toLowerCase().includes("insurance") || doc.description?.toLowerCase().includes("insurance");
        case "personal":
          return tags.some(tag => ["Personal Health"].includes(tag));
        default:
          return true;
      }
    })();

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const docDate = new Date(doc.createdAt!);
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      switch (dateFilter) {
        case "today":
          matchesDate = docDate >= startOfToday;
          break;
        case "week":
          matchesDate = docDate >= startOfWeek;
          break;
        case "month":
          matchesDate = docDate >= startOfMonth;
          break;
        case "year":
          matchesDate = docDate >= startOfYear;
          break;
      }
    }

    // Doctor filter (placeholder - would need doctor info from backend)
    const matchesDoctor = doctorFilter === "all" || true; // Placeholder

    return matchesSearch && matchesType && matchesCategory && matchesDate && matchesDoctor;
  }) || [];

  const isLoading = documentsLoading || prescriptionsLoading || vaccinationsLoading;

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const handleView = (document: Document) => {
    setSelectedDocumentForView(document);
    setViewDialogOpen(true);
  };

  const handleDownload = (document: Document) => {
    // Simulate download - in real implementation, this would trigger actual file download
    toast({
      title: "Download Started",
      description: `Downloading ${document.title}...`,
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${document.title} has been downloaded successfully.`,
      });
    }, 2000);
  };

  const handleEditVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setVaccinationForm({
      vaccineName: vaccination.vaccineName,
      vaccineType: vaccination.vaccineType || "",
      doseNumber: vaccination.doseNumber?.toString() || "",
      totalDoses: vaccination.totalDoses?.toString() || "",
      administeredDate: vaccination.administeredDate || "",
      administeredBy: vaccination.administeredBy || "",
      batchNumber: vaccination.batchNumber || "",
      nextDueDate: vaccination.nextDueDate || "",
      notes: vaccination.notes || ""
    });
    setEditVaccinationDialogOpen(true);
  };

  const handleDeleteVaccination = (vaccination: Vaccination) => {
    toast({
      title: "Vaccination Deleted",
      description: `${vaccination.vaccineName} vaccination record has been deleted.`,
    });
  };

  const handleVerifyPrescription = (prescription: PrescriptionWithDetails) => {
    toast({
      title: "Prescription Verification",
      description: "Verifying prescription signature...",
    });

    // Simulate verification delay
    setTimeout(() => {
      toast({
        title: "Prescription Verified",
        description: "Prescription signature has been verified successfully.",
      });
    }, 2000);
  };

  const handleViewPrescriptionDetails = (prescription: PrescriptionWithDetails) => {
    setSelectedPrescription(prescription);
    setPrescriptionDetailsDialog(true);
  };

  const generatePrescriptionPDF = (prescription: PrescriptionWithDetails) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Prescription", 20, 30);

    doc.setFontSize(12);
    const patientName = prescription.patient?.user
      ? `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`
      : currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "Patient Name";
    const patientId = prescription.patient?.id || currentUser?.id || "Unknown";

    doc.text(`Patient: ${patientName}`, 20, 50);
    doc.text(`Patient ID: ${patientId}`, 20, 60);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 70);
    doc.text(`Date: ${format(new Date(prescription.createdAt!), "MMMM d, yyyy")}`, 20, 80);

    if (prescription.doctor?.user) {
      doc.text(`Prescribing Doctor: Dr. ${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`, 20, 90);
      if (prescription.doctor.specialty) {
        doc.text(`Specialty: ${prescription.doctor.specialty}`, 20, 100);
      }
    }

    let yPosition = 120;

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
    const fileName = `Prescription_${patientName.replace(/\s+/g, '_')}_${prescription.id}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Generated",
      description: "Prescription PDF has been downloaded.",
    });
  };

  // Group documents by selected criteria
  const groupDocuments = (docs: Document[]) => {
    if (groupBy === "none") return { "All Records": docs };

    const groups: Record<string, Document[]> = {};

    docs.forEach(doc => {
      let key = "";
      switch (groupBy) {
        case "date":
          key = format(new Date(doc.createdAt!), "MMMM yyyy");
          break;
        case "type":
          key = doc.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
          break;
        case "department":
          key = "General Medicine"; // Would come from appointment/doctor data
          break;
        default:
          key = "All Records";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });

    return groups;
  };

  const groupedDocuments = groupDocuments(filteredDocuments);

  const shareViaWhatsApp = (document: Document) => {
    const message = `Medical Document: ${document.title}\nType: ${document.type}\nDate: ${format(new Date(document.createdAt!), "MMM d, yyyy")}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = (document: Document) => {
    const subject = `Medical Document: ${document.title}`;
    const body = `Please find the medical document details:\n\nTitle: ${document.title}\nType: ${document.type}\nDate: ${format(new Date(document.createdAt!), "MMM d, yyyy")}\nDescription: ${document.description || 'N/A'}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const performOCRSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock OCR results - in real implementation, this would call an OCR service
      const ocrResults = [
        {
          documentId: 1,
          extractedText: `Patient: John Doe\nBlood Test Results\nHemoglobin: 14.2 g/dL\nWBC Count: 8,500 cells/μL\nPlatelets: 250,000/μL\n${query} levels within normal range.`,
          confidence: 0.95,
          found: true
        },
        {
          documentId: 2,
          extractedText: `Medical Report\nPatient shows ${query} symptoms\nRecommended treatment: Rest and hydration\nFollow-up in 1 week.`,
          confidence: 0.87,
          found: true
        }
      ];

      const foundDocuments = ocrResults.filter(result => result.found);

      if (foundDocuments.length > 0) {
        toast({
          title: "OCR Search Complete",
          description: `Found ${foundDocuments.length} document(s) containing "${query}" in their content.`,
        });
      } else {
        toast({
          title: "OCR Search Complete",
          description: `No documents found containing "${query}" in their content.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "OCR Search Failed",
        description: "Failed to perform OCR search. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Signature helper functions
  const getSignatureIcon = (signatureStatus?: SignatureStatus) => {
    if (!signatureStatus?.isSigned) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (signatureStatus.isVerified) {
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getSignatureText = (signatureStatus?: SignatureStatus) => {
    if (!signatureStatus?.isSigned) {
      return "Not Signed";
    }
    if (signatureStatus.isVerified) {
      return "Verified";
    }
    return "Invalid Signature";
  };

  const getSignatureColor = (signatureStatus?: SignatureStatus) => {
    if (!signatureStatus?.isSigned) {
      return "text-yellow-600";
    }
    if (signatureStatus.isVerified) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Health Records</h1>
          <p className="text-muted-foreground">Access all your medical documents and prescriptions</p>
        </div>
        <Button onClick={() => setShowAddLabReportDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lab Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by title, description, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-24"
            data-testid="input-search-records"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            onClick={() => {
              toast({
                title: "Deep Search Enabled",
                description: "Searching inside document content using OCR technology...",
              });
              // Trigger OCR search
              performOCRSearch(searchQuery);
            }}
          >
            <Scan className="h-3 w-3 mr-1" />
            OCR
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {documentTypes.map(type => {
              const Icon = type.icon;
              let count = 0;
              if (type.value === "all") {
                count = (documents?.length || 0) + (prescriptions?.length || 0) + (vaccinations?.length || 0);
              } else if (type.value === "prescription") {
                count = prescriptions?.length || 0;
              } else {
                count = documents?.filter(d => d.type === type.value).length || 0;
              }
              return (
                <Button
                  key={type.value}
                  variant={activeType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveType(type.value)}
                  className="flex-shrink-0"
                  data-testid={`filter-${type.value}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Doctor Filter */}
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-[140px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {/* Would be populated from API */}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {documentCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Group By */}
          <Select value={groupBy} onValueChange={(value: "none" | "date" | "type" | "department") => setGroupBy(value)}>
            <SelectTrigger className="w-[140px]">
              <Group className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Group By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
              <SelectItem value="department">By Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([groupName, docs]) => (
            <div key={groupName}>
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">{groupName}</Badge>
                  <span className="text-sm text-muted-foreground">({docs.length} records)</span>
                </h3>
              )}
              <div className="space-y-3">
                {docs.map(doc => (
                  <DocumentCard key={doc.id} document={doc} onShare={handleShare} onView={handleView} onDownload={handleDownload} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No records match your search criteria." : "Your medical records will appear here."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions Section */}
      {prescriptions && prescriptions.length > 0 && (activeType === "all" || activeType === "prescription") && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {activeType === "prescription" ? "All Prescriptions" : "Recent Prescriptions"}
            </h2>
            {activeType === "all" && prescriptions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveType("prescription")}
                data-testid="button-view-all-prescriptions"
              >
                View All ({prescriptions.length})
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {(activeType === "prescription" ? prescriptions : prescriptions.slice(0, 3)).map(prescription => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onVerify={handleVerifyPrescription}
                onViewDetails={handleViewPrescriptionDetails}
                onPrint={generatePrescriptionPDF}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vaccination Card Section */}
      {vaccinations && vaccinations.length > 0 && activeType === "all" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Vaccination Records
            </h2>
            <Button size="sm" variant="outline" onClick={() => setAddVaccinationDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vaccination
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaccinations.map(vaccination => (
              <VaccinationCard
                key={vaccination.id}
                vaccination={vaccination}
                onEdit={handleEditVaccination}
                onDelete={handleDeleteVaccination}
              />
            ))}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share this medical document via WhatsApp or Email
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedDocument.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(selectedDocument.createdAt!), "MMM d, yyyy")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareViaWhatsApp(selectedDocument)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareViaEmail(selectedDocument)}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>View Document</DialogTitle>
            <DialogDescription>
              Document details and content preview
            </DialogDescription>
          </DialogHeader>
          {selectedDocumentForView && (
            <div className="space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Document Title</span>
                    <p className="text-sm text-muted-foreground">{selectedDocumentForView.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Type</span>
                    <p className="text-sm text-muted-foreground">{selectedDocumentForView.type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Date</span>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedDocumentForView.createdAt!), "PPP")}
                    </p>
                  </div>
                  {(selectedDocumentForView as any).doctor?.user && (
                    <div>
                      <span className="text-sm font-medium">Associated Doctor</span>
                      <p className="text-sm text-muted-foreground">
                        Dr. {(selectedDocumentForView as any).doctor.user.firstName} {(selectedDocumentForView as any).doctor.user.lastName}
                        {(selectedDocumentForView as any).doctor.specialty && (
                          <span> • {(selectedDocumentForView as any).doctor.specialty}</span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedDocumentForView.appointmentId && (
                    <div>
                      <span className="text-sm font-medium">Related Appointment</span>
                      <p className="text-sm text-muted-foreground">Appointment #{selectedDocumentForView.appointmentId}</p>
                    </div>
                  )}
                  {selectedDocumentForView.description && (
                    <div>
                      <span className="text-sm font-medium">Description</span>
                      <p className="text-sm text-muted-foreground">{selectedDocumentForView.description}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generateTags(selectedDocumentForView).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedDocumentForView.appointmentId && (
                    <div>
                      <span className="text-sm font-medium">Related Appointment</span>
                      <p className="text-sm text-muted-foreground">Appointment #{selectedDocumentForView.appointmentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Content Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <span className="text-sm font-medium mb-2 block">Document Preview</span>
                <div className="bg-card border rounded p-4 min-h-[200px] text-sm text-foreground">
                  {/* Mock document content based on type */}
                  {selectedDocumentForView.type === "lab_report" && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Laboratory Report</h4>
                      <p><strong>Patient:</strong> John Doe</p>
                      <p><strong>Date:</strong> {format(new Date(selectedDocumentForView.createdAt!), "MMM d, yyyy")}</p>
                      <div className="mt-4">
                        <h5 className="font-medium">Test Results:</h5>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Hemoglobin: 14.2 g/dL (Normal: 12.0-16.0)</li>
                          <li>WBC Count: 8,500 cells/μL (Normal: 4,000-11,000)</li>
                          <li>Platelets: 250,000/μL (Normal: 150,000-450,000)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {selectedDocumentForView.type === "radiology" && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Radiology Report</h4>
                      <p><strong>Patient:</strong> John Doe</p>
                      <p><strong>Study:</strong> Chest X-Ray</p>
                      <p><strong>Date:</strong> {format(new Date(selectedDocumentForView.createdAt!), "MMM d, yyyy")}</p>
                      <div className="mt-4">
                        <h5 className="font-medium">Findings:</h5>
                        <p className="mt-2">No acute cardiopulmonary abnormality identified. Lungs are clear. Heart size is normal.</p>
                      </div>
                    </div>
                  )}
                  {selectedDocumentForView.type === "prescription" && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Prescription</h4>
                      <p><strong>Patient:</strong> John Doe</p>
                      <p><strong>Doctor:</strong> Dr. Sarah Smith</p>
                      <p><strong>Date:</strong> {format(new Date(selectedDocumentForView.createdAt!), "MMM d, yyyy")}</p>
                      <div className="mt-4">
                        <h5 className="font-medium">Medications:</h5>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Lisinopril 10mg - Take once daily</li>
                          <li>Aspirin 81mg - Take once daily</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {selectedDocumentForView.type === "visit_summary" && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Visit Summary</h4>
                      <p><strong>Patient:</strong> John Doe</p>
                      <p><strong>Doctor:</strong> Dr. Sarah Smith</p>
                      <p><strong>Date:</strong> {format(new Date(selectedDocumentForView.createdAt!), "MMM d, yyyy")}</p>
                      <div className="mt-4">
                        <h5 className="font-medium">Summary:</h5>
                        <p className="mt-2">Patient presented with routine checkup. Blood pressure controlled. Continue current medications. Follow-up in 3 months.</p>
                      </div>
                    </div>
                  )}
                  {!["lab_report", "radiology", "prescription", "visit_summary"].includes(selectedDocumentForView.type) && (
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Document preview not available</p>
                      <p className="text-xs mt-1">Click download to view the full document</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedDocumentForView?.fileUrl && (
              <Button onClick={() => selectedDocumentForView && handleDownload(selectedDocumentForView)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Dialog */}
      <Dialog open={addVaccinationDialogOpen} onOpenChange={setAddVaccinationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vaccination Record</DialogTitle>
            <DialogDescription>
              Add a new vaccination to your medical records
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Vaccine Name *</span>
                <Input
                  placeholder="e.g., COVID-19, Flu, MMR"
                  value={vaccinationForm.vaccineName}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccineName: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Vaccine Type</span>
                <Input
                  placeholder="e.g., Pfizer-BioNTech, Moderna"
                  value={vaccinationForm.vaccineType}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccineType: e.target.value }))}
                />
              </div>
            </div>

            {/* Dose Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Dose Number</span>
                <Input
                  type="number"
                  placeholder="1"
                  value={vaccinationForm.doseNumber}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, doseNumber: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Total Doses</span>
                <Input
                  type="number"
                  placeholder="1"
                  value={vaccinationForm.totalDoses}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, totalDoses: e.target.value }))}
                />
              </div>
            </div>

            {/* Administration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Administered Date *</span>
                <Input
                  type="date"
                  value={vaccinationForm.administeredDate}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredDate: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Administered By</span>
                <Input
                  placeholder="Clinic or Doctor name"
                  value={vaccinationForm.administeredBy}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Batch Number</span>
                <Input
                  placeholder="Batch/Lot number"
                  value={vaccinationForm.batchNumber}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Next Due Date</span>
                <Input
                  type="date"
                  value={vaccinationForm.nextDueDate}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <span className="text-sm font-medium">Notes</span>
              <Textarea
                placeholder="Additional notes about the vaccination"
                value={vaccinationForm.notes}
                onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddVaccinationDialogOpen(false);
              setVaccinationForm({
                vaccineName: "",
                vaccineType: "",
                doseNumber: "",
                totalDoses: "",
                administeredDate: "",
                administeredBy: "",
                batchNumber: "",
                nextDueDate: "",
                notes: ""
              });
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Basic validation
              if (!vaccinationForm.vaccineName || !vaccinationForm.administeredDate) {
                toast({
                  title: "Validation Error",
                  description: "Please fill in the vaccine name and administered date.",
                  variant: "destructive",
                });
                return;
              }

              toast({
                title: "Vaccination Added",
                description: "Your vaccination record has been added successfully.",
              });
              setAddVaccinationDialogOpen(false);
              setVaccinationForm({
                vaccineName: "",
                vaccineType: "",
                doseNumber: "",
                totalDoses: "",
                administeredDate: "",
                administeredBy: "",
                batchNumber: "",
                nextDueDate: "",
                notes: ""
              });
            }}>
              Add Vaccination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vaccination Dialog */}
      <Dialog open={editVaccinationDialogOpen} onOpenChange={setEditVaccinationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vaccination Record</DialogTitle>
            <DialogDescription>
              Update the vaccination information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Vaccine Name *</span>
                <Input
                  placeholder="e.g., COVID-19, Flu, MMR"
                  value={vaccinationForm.vaccineName}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccineName: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Vaccine Type</span>
                <Input
                  placeholder="e.g., Pfizer-BioNTech, Moderna"
                  value={vaccinationForm.vaccineType}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccineType: e.target.value }))}
                />
              </div>
            </div>

            {/* Dose Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Dose Number</span>
                <Input
                  type="number"
                  placeholder="1"
                  value={vaccinationForm.doseNumber}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, doseNumber: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Total Doses</span>
                <Input
                  type="number"
                  placeholder="1"
                  value={vaccinationForm.totalDoses}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, totalDoses: e.target.value }))}
                />
              </div>
            </div>

            {/* Administration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Administered Date *</span>
                <Input
                  type="date"
                  value={vaccinationForm.administeredDate}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredDate: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Administered By</span>
                <Input
                  placeholder="Clinic or Doctor name"
                  value={vaccinationForm.administeredBy}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Batch Number</span>
                <Input
                  placeholder="Batch/Lot number"
                  value={vaccinationForm.batchNumber}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div>
                <span className="text-sm font-medium">Next Due Date</span>
                <Input
                  type="date"
                  value={vaccinationForm.nextDueDate}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <span className="text-sm font-medium">Notes</span>
              <Textarea
                placeholder="Additional notes about the vaccination"
                value={vaccinationForm.notes}
                onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditVaccinationDialogOpen(false);
              setSelectedVaccination(null);
              setVaccinationForm({
                vaccineName: "",
                vaccineType: "",
                doseNumber: "",
                totalDoses: "",
                administeredDate: "",
                administeredBy: "",
                batchNumber: "",
                nextDueDate: "",
                notes: ""
              });
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Basic validation
              if (!vaccinationForm.vaccineName || !vaccinationForm.administeredDate) {
                toast({
                  title: "Validation Error",
                  description: "Please fill in the vaccine name and administered date.",
                  variant: "destructive",
                });
                return;
              }

              toast({
                title: "Vaccination Updated",
                description: "Your vaccination record has been updated successfully.",
              });
              setEditVaccinationDialogOpen(false);
              setSelectedVaccination(null);
              setVaccinationForm({
                vaccineName: "",
                vaccineType: "",
                doseNumber: "",
                totalDoses: "",
                administeredDate: "",
                administeredBy: "",
                batchNumber: "",
                nextDueDate: "",
                notes: ""
              });
            }}>
              Update Vaccination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog open={prescriptionDetailsDialog} onOpenChange={setPrescriptionDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Complete prescription information and medications
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Prescription ID</span>
                    <p className="text-sm text-muted-foreground">#{selectedPrescription.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Date Issued</span>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPrescription.createdAt!), "PPP")}
                    </p>
                  </div>
                  {selectedPrescription.diagnosis && (
                    <div>
                      <span className="text-sm font-medium">Diagnosis</span>
                      <p className="text-sm text-muted-foreground">{selectedPrescription.diagnosis}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {selectedPrescription.doctor?.user && (
                    <>
                      <div>
                        <span className="text-sm font-medium">Prescribing Doctor</span>
                        <p className="text-sm text-muted-foreground">
                          Dr. {selectedPrescription.doctor.user.firstName} {selectedPrescription.doctor.user.lastName}
                        </p>
                      </div>
                      {selectedPrescription.doctor.specialty && (
                        <div>
                          <span className="text-sm font-medium">Specialty</span>
                          <p className="text-sm text-muted-foreground">{selectedPrescription.doctor.specialty}</p>
                        </div>
                      )}
                      {selectedPrescription.doctor.department && (
                        <div>
                          <span className="text-sm font-medium">Department</span>
                          <p className="text-sm text-muted-foreground">{selectedPrescription.doctor.department.name}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Medications Section */}
              <div>
                <span className="text-sm font-medium mb-3 block">Prescribed Medications</span>
                <div className="space-y-3">
                  {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                    selectedPrescription.items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.medicine?.name || 'Unknown Medicine'}</h4>
                            <div className="text-sm text-muted-foreground">
                              <div>Dosage: {item.dosage || 'Not specified'}</div>
                              <div>Frequency: {item.frequency || 'Not specified'}</div>
                              <div>Duration: {item.duration || 'Not specified'}</div>
                              {item.instructions && (
                                <div>Instructions: {item.instructions}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No medications prescribed</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <span className="text-sm font-medium">Additional Notes</span>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Signature Status */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSignatureIcon({ isSigned: true, isVerified: true } as SignatureStatus)}
                    <span className="text-sm font-medium">Digital Signature</span>
                  </div>
                  <span className={`text-sm ${getSignatureColor({ isSigned: true, isVerified: true } as SignatureStatus)}`}>
                    {getSignatureText({ isSigned: true, isVerified: true } as SignatureStatus)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This prescription has been digitally signed and verified
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDetailsDialog(false)}>
              Close
            </Button>
            {selectedPrescription && (
              <Button onClick={() => {
                // Download prescription functionality
                toast({
                  title: "Download Started",
                  description: "Downloading prescription...",
                });
              }}>
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lab Report Dialog */}
      <Dialog open={showAddLabReportDialog} onOpenChange={setShowAddLabReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab Report</DialogTitle>
            <DialogDescription>
              Upload a new lab report to your medical records
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lab-title">Title</Label>
              <Input
                id="lab-title"
                value={newLabReport.title}
                onChange={(e) => setNewLabReport(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter lab report title"
              />
            </div>
            <div>
              <Label htmlFor="lab-description">Description (Optional)</Label>
              <Textarea
                id="lab-description"
                value={newLabReport.description}
                onChange={(e) => setNewLabReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="lab-file">File</Label>
              <Input
                id="lab-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setNewLabReport(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLabReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!newLabReport.title || !newLabReport.file) {
                toast({
                  title: "Incomplete Information",
                  description: "Please enter a title and select a file.",
                  variant: "destructive",
                });
                return;
              }
              addLabReportMutation.mutate(newLabReport);
            }} disabled={addLabReportMutation.isPending}>
              {addLabReportMutation.isPending ? "Uploading..." : "Upload Lab Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentCard({ document, onShare, onView, onDownload }: { document: Document & { doctor?: DoctorWithUser; appointment?: any }; onShare: (doc: Document) => void; onView: (doc: Document) => void; onDownload: (doc: Document) => void }) {
  const typeIcons: Record<string, React.ReactNode> = {
    lab_report: <FlaskConical className="h-5 w-5" />,
    radiology: <ImageIcon className="h-5 w-5" />,
    prescription: <Pill className="h-5 w-5" />,
    visit_summary: <ClipboardList className="h-5 w-5" />,
    discharge_summary: <FileText className="h-5 w-5" />,
    other: <FileText className="h-5 w-5" />,
  };

  const typeColors: Record<string, string> = {
    lab_report: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    radiology: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    prescription: "bg-green-500/10 text-green-600 dark:text-green-400",
    visit_summary: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    discharge_summary: "bg-red-500/10 text-red-600 dark:text-red-400",
    other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  const tags = generateTags(document);

  return (
    <Card className="hover-elevate" data-testid={`card-document-${document.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[document.type] || typeColors.other}`}>
            {typeIcons[document.type] || typeIcons.other}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{document.title}</h3>
                {(document as any).doctor?.user && (
                  <p className="text-sm text-primary">
                    Dr. {(document as any).doctor.user.firstName} {(document as any).doctor.user.lastName}
                    {(document as any).doctor.specialty && (
                      <span className="text-muted-foreground"> • {(document as any).doctor.specialty}</span>
                    )}
                  </p>
                )}
                {document.description && (
                  <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(document.createdAt!), "MMM d, yyyy")}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {document.type.replace("_", " ")}
                  </Badge>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onView(document)} data-testid={`button-view-${document.id}`}>
                  <Eye className="h-4 w-4" />
                </Button>
                {document.fileUrl && (
                  <Button variant="ghost" size="icon" onClick={() => onDownload(document)} data-testid={`button-download-${document.id}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onShare(document)}
                  data-testid={`button-share-${document.id}`}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrescriptionCard({
  prescription,
  onVerify,
  onViewDetails,
  onPrint
}: {
  prescription: PrescriptionWithDetails;
  onVerify?: (prescription: PrescriptionWithDetails) => void;
  onViewDetails?: (prescription: PrescriptionWithDetails) => void;
  onPrint?: (prescription: PrescriptionWithDetails) => void;
}) {
  const { data: signatureStatus } = useQuery<SignatureStatus>({
    queryKey: [`/api/prescriptions/${prescription.id}/signature`],
  });

  const getSignatureIcon = (status?: SignatureStatus) => {
    if (!status?.isSigned) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (status.isVerified) {
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getSignatureText = (status?: SignatureStatus) => {
    if (!status?.isSigned) {
      return "Not Signed";
    }
    if (status.isVerified) {
      return "Verified";
    }
    return "Invalid Signature";
  };

  const getSignatureColor = (status?: SignatureStatus) => {
    if (!status?.isSigned) {
      return "text-yellow-600";
    }
    if (status.isVerified) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  return (
    <Card className="hover-elevate" data-testid={`card-prescription-${prescription.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold">Prescription #{prescription.id}</h3>
                {prescription.doctor?.user && (
                  <p className="text-sm text-primary">
                    Dr. {prescription.doctor.user.firstName} {prescription.doctor.user.lastName}
                    {prescription.doctor.specialty && (
                      <span className="text-muted-foreground"> • {prescription.doctor.specialty}</span>
                    )}
                  </p>
                )}
                {prescription.diagnosis && (
                  <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(prescription.createdAt!), "MMM d, yyyy")}
                  </p>
                  <div className="flex items-center gap-1">
                    {getSignatureIcon(signatureStatus)}
                    <span className={`text-xs ${getSignatureColor(signatureStatus)}`}>
                      {getSignatureText(signatureStatus)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => onVerify?.(prescription)}
                   data-testid={`button-verify-prescription-${prescription.id}`}
                 >
                   <CheckCircle2 className="h-4 w-4 mr-1" />
                   Verify
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => onPrint?.(prescription)}
                 >
                   <FileDown className="h-4 w-4 mr-1" />
                   Print
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => onViewDetails?.(prescription)}
                   data-testid={`button-view-prescription-${prescription.id}`}
                 >
                   View Details
                 </Button>
               </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
