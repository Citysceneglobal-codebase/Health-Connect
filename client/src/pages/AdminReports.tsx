import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Document } from "@shared/schema";
import { mockUsers, mockDoctors, mockDocuments, mockAppointments, mockDepartments } from "@/lib/mockData";

export default function AdminReports() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    patientId: "",
    type: "lab_report" as Document['type'],
    title: "",
    description: ""
  });
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Document | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Mock reports data with local state
  const [reports, setReports] = useState<Document[]>(mockDocuments);

  // Mock patients and doctors for dropdowns
  const mockPatients = mockUsers.filter(u => u.role === "patient").map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`
  }));

  const mockDoctorsList = mockDoctors.map(d => {
    const user = mockUsers.find(u => u.id === d.userId);
    return {
      id: d.userId,
      name: `Dr. ${user?.firstName} ${user?.lastName}`
    };
  });

  // Calculate statistics
  const totalReports = reports.length;
  const labReports = reports.filter(r => r.type === "lab_report").length;
  const radiologyReports = reports.filter(r => r.type === "radiology").length;
  const recentReports = reports.filter(r => {
    const daysSinceUpload = Math.floor((Date.now() - new Date(r.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpload <= 7;
  }).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "assigned":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "uploaded":
        return "default";
      case "assigned":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleAddReport = async () => {
    if (!selectedFile || !uploadFormData.patientId || !uploadFormData.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newReport: Document = {
        id: Math.max(...reports.map(r => r.id)) + 1,
        patientId: uploadFormData.patientId,
        type: uploadFormData.type,
        title: uploadFormData.title,
        description: uploadFormData.description,
        fileUrl: "#", // In real app, this would be the uploaded file URL
        uploadedBy: "user-admin",
        appointmentId: null,
        createdAt: new Date()
      };

      setReports(prev => [...prev, newReport]);
      setDialogOpen(false);
      setSelectedFile(null);
      setUploadFormData({
        patientId: "",
        type: "lab_report",
        title: "",
        description: ""
      });

      toast({
        title: "Report Uploaded",
        description: `${uploadFormData.title} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditReport = async () => {
    if (!selectedReport) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setReports(prev => prev.map(report =>
      report.id === selectedReport.id ? { ...selectedReport, updatedAt: new Date() } : report
    ));

    setEditDialogOpen(false);
    setSelectedReport(null);

    toast({
      title: "Report Updated",
      description: "Report information has been updated successfully.",
    });
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setReports(prev => prev.filter(report => report.id !== selectedReport.id));
    setDeleteDialogOpen(false);
    setSelectedReport(null);

    toast({
      title: "Report Deleted",
      description: "Report has been removed from the system.",
    });
  };

  const handleViewReport = (report: Document) => {
    setViewingReport(report);
    setViewDialogOpen(true);
  };

  const handleDownloadReport = async (report: Document) => {
    try {
      // Simulate download process
      toast({
        title: "Download Started",
        description: `Downloading ${report.title}...`,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would trigger actual file download
      // For demo purposes, we'll simulate a successful download
      toast({
        title: "Download Complete",
        description: `${report.title} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedReports.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select reports to download.",
        variant: "destructive",
      });
      return;
    }

    setIsBulkDownloading(true);

    try {
      toast({
        title: "Bulk Download Started",
        description: `Downloading ${selectedReports.length} reports...`,
      });

      // Simulate bulk download process
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Bulk Download Complete",
        description: `${selectedReports.length} reports have been downloaded successfully.`,
      });

      setSelectedReports([]);
    } catch (error) {
      toast({
        title: "Bulk Download Failed",
        description: "Failed to download selected reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleSelectReport = (reportId: number, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus = statusFilter === "all"; // For now, all reports are considered uploaded

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const reportDate = new Date(report.createdAt || new Date());
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      switch (dateFilter) {
        case "today":
          matchesDate = reportDate >= startOfToday;
          break;
        case "this_week":
          matchesDate = reportDate >= startOfWeek;
          break;
        case "this_month":
          matchesDate = reportDate >= startOfMonth;
          break;
        case "this_year":
          matchesDate = reportDate >= startOfYear;
          break;
        case "custom_date":
          if (customDate) {
            const customDateObj = new Date(customDate);
            const startOfCustomDate = new Date(customDateObj.getFullYear(), customDateObj.getMonth(), customDateObj.getDate());
            const endOfCustomDate = new Date(customDateObj.getFullYear(), customDateObj.getMonth(), customDateObj.getDate() + 1);
            matchesDate = reportDate >= startOfCustomDate && reportDate < endOfCustomDate;
          }
          break;
        case "custom_month":
          if (customMonth) {
            const [year, month] = customMonth.split('-').map(Number);
            const startOfCustomMonth = new Date(year, month - 1, 1);
            const endOfCustomMonth = new Date(year, month, 1);
            matchesDate = reportDate >= startOfCustomMonth && reportDate < endOfCustomMonth;
          }
          break;
      }
    }

    // Patient filtering
    const matchesPatient = patientFilter === "all" || report.patientId === patientFilter;

    // Doctor/uploader filtering
    const matchesDoctor = doctorFilter === "all" || report.uploadedBy === doctorFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDate && matchesPatient && matchesDoctor;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Report Management</h1>
          <p className="text-muted-foreground">Upload and manage medical reports and documents</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              // Reset form when dialog closes
              setSelectedFile(null);
              setUploadFormData({
                patientId: "",
                type: "lab_report",
                title: "",
                description: ""
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-add-report">
              <Plus className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>
                Upload a new medical report or document for a patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Patient *</Label>
                <Select
                  value={uploadFormData.patientId}
                  onValueChange={(value) => setUploadFormData(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Report Type *</Label>
                <Select
                  value={uploadFormData.type}
                  onValueChange={(value) => setUploadFormData(prev => ({ ...prev, type: value as Document['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="radiology">Radiology Report</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                    <SelectItem value="visit_summary">Visit Summary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Report title"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  placeholder="Brief description of the report"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>File *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.png,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReport} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
            <p className="text-xs text-blue-600">All medical documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{labReports}</p>
                <p className="text-xs text-muted-foreground">Lab Reports</p>
              </div>
            </div>
            <p className="text-xs text-green-600">Test results</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{radiologyReports}</p>
                <p className="text-xs text-muted-foreground">Radiology</p>
              </div>
            </div>
            <p className="text-xs text-purple-600">Imaging reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{recentReports}</p>
                <p className="text-xs text-muted-foreground">Recent</p>
              </div>
            </div>
            <p className="text-xs text-orange-600">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title or description..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab_report">Lab Reports</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom_date">Custom Date</SelectItem>
                <SelectItem value="custom_month">Custom Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={patientFilter} onValueChange={setPatientFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {mockPatients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {mockDoctorsList.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dateFilter === "custom_date" && (
            <div className="max-w-xs">
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          )}
          {dateFilter === "custom_month" && (
            <div className="max-w-xs">
              <Input
                type="month"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReports([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkDownload}
                  disabled={isBulkDownloading}
                >
                  {isBulkDownloading ? "Downloading..." : "Download Selected"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reports ({filteredReports.length})</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all reports"
              />
              <Label className="text-sm">Select All</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <Card key={report.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                      aria-label={`Select ${report.title}`}
                    />
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{report.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.createdAt || new Date()), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium truncate">
                          {mockPatients.find(p => p.id === report.patientId)?.name || "Unknown Patient"}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      Uploaded
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-${report.id}`}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                      data-testid={`button-view-${report.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                      data-testid={`button-download-${report.id}`}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setDeleteDialogOpen(true);
                      }}
                      data-testid={`button-delete-${report.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reports found</p>
          </div>
        )}
      </div>

      {/* Edit Report Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Update report information and details.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={selectedReport.title}
                  onChange={(e) => setSelectedReport(prev => prev ? {
                    ...prev,
                    title: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={selectedReport.description || ""}
                  onChange={(e) => setSelectedReport(prev => prev ? {
                    ...prev,
                    description: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select
                  value={selectedReport.type}
                  onValueChange={(value) => setSelectedReport(prev => prev ? {
                    ...prev,
                    type: value as Document['type']
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReport}>
              Update Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedReport?.title}"?
              This action cannot be undone and will permanently remove the report from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewingReport?.title}
            </DialogTitle>
            <DialogDescription>
              Report details and content preview
            </DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-6">
              {/* Report Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm">
                    {mockPatients.find(p => p.id === viewingReport.patientId)?.name || "Unknown Patient"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Report Type</Label>
                  <p className="text-sm">{viewingReport.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded Date</Label>
                  <p className="text-sm">
                    {format(new Date(viewingReport.createdAt || new Date()), "PPP 'at' p")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded By</Label>
                  <p className="text-sm">
                    {mockDoctorsList.find(d => d.id === viewingReport.uploadedBy)?.name || "Unknown Doctor"}
                  </p>
                </div>
              </div>

              {/* Report Description */}
              {viewingReport.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingReport.description}
                  </p>
                </div>
              )}

              {/* Simulated Report Content */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center justify-center h-96 bg-muted/30 rounded border-2 border-dashed">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Report Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      This is a simulated preview of "{viewingReport.title}"
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Type:</strong> {viewingReport.type.replace('_', ' ')}</p>
                      <p><strong>Patient ID:</strong> {viewingReport.patientId}</p>
                      <p><strong>Report ID:</strong> {viewingReport.id}</p>
                      <p><strong>Status:</strong> Available for viewing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReport(viewingReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}