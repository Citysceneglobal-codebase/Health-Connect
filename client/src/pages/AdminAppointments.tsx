import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  UserX,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import type { AppointmentWithDetails } from "@shared/schema";

// Mock data for appointments
const mockAppointments: AppointmentWithDetails[] = [
  {
    id: 1,
    patientId: "patient-1",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "09:00:00",
    status: "confirmed",
    reason: "Regular checkup",
    notes: "Annual physical examination",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "patient-1",
      email: "john.doe@example.com",
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
    },
    doctor: {
      id: 1,
      userId: "doctor-1",
      departmentId: 1,
      specialty: "Cardiologist",
      qualification: "MD, FACC",
      experience: 10,
      consultationFee: "150.00",
      bio: "Board-certified cardiologist",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "doctor-1",
        email: "dr.smith@hospital.com",
        firstName: "Sarah",
        lastName: "Smith",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 111-2222",
        dateOfBirth: "1980-01-10",
        gender: "female",
        address: "Medical Center",
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 1,
        name: "Cardiology",
        description: "Heart and cardiovascular system care",
        icon: "heart",
        createdAt: new Date()
      }
    }
  },
  {
    id: 2,
    patientId: "patient-2",
    doctorId: 2,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "10:30:00",
    status: "pending",
    reason: "Follow-up consultation",
    notes: "Post-surgery check",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "patient-2",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 234-5678",
      dateOfBirth: "1990-03-22",
      gender: "female",
      address: "456 Oak Ave",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 2,
      userId: "doctor-2",
      departmentId: 2,
      specialty: "Orthopedic Surgeon",
      qualification: "MD, MS Ortho",
      experience: 8,
      consultationFee: "200.00",
      bio: "Specialized in joint replacements",
      isAvailable: true,
      createdAt: new Date(),
      firstName: "Michael",
      lastName: "Johnson",
      email: "dr.johnson@hospital.com",
      phone: "+1 (555) 333-4444",
      profileImageUrl: "",
      department: {
        id: 2,
        name: "Orthopedics",
        description: "Bone and muscle care",
        icon: "bone",
        createdAt: new Date()
      }
    }
  },
  {
    id: 3,
    patientId: "patient-3",
    doctorId: 3,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "14:00:00",
    status: "completed",
    reason: "Vaccination",
    notes: "COVID-19 booster",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "patient-3",
      email: "bob.wilson@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 345-6789",
      dateOfBirth: "1978-11-08",
      gender: "male",
      address: "789 Pine St",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 3,
      userId: "doctor-3",
      departmentId: 3,
      specialty: "Dermatologist",
      qualification: "MD, FAAD",
      experience: 12,
      consultationFee: "120.00",
      bio: "Specialized in skin disorders and cosmetic dermatology",
      isAvailable: true,
      createdAt: new Date(),
      firstName: "Emily",
      lastName: "Brown",
      email: "dr.brown@hospital.com",
      phone: "+1 (555) 555-6666",
      profileImageUrl: "",
      department: {
        id: 3,
        name: "Dermatology",
        description: "Skin care and treatment",
        icon: "skin",
        createdAt: new Date()
      }
    }
  },
  {
    id: 4,
    patientId: "patient-4",
    doctorId: 1,
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    appointmentTime: "11:00:00",
    status: "confirmed",
    reason: "Cardiac consultation",
    notes: "Chest pain evaluation",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "patient-4",
      email: "alice.johnson@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 456-7890",
      dateOfBirth: "1982-07-30",
      gender: "female",
      address: "321 Elm St",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 4,
      userId: "doctor-1",
      departmentId: 1,
      specialty: "Cardiologist",
      qualification: "MD, FACC",
      experience: 10,
      consultationFee: "150.00",
      bio: "Board-certified cardiologist",
      isAvailable: true,
      createdAt: new Date(),
      firstName: "Sarah",
      lastName: "Smith",
      email: "dr.smith@hospital.com",
      phone: "+1 (555) 111-2222",
      profileImageUrl: "",
      department: {
        id: 1,
        name: "Cardiology",
        description: "Heart and cardiovascular system care",
        icon: "heart",
        createdAt: new Date()
      }
    }
  }
];

export default function AdminAppointments() {
  const { data: appointments, isLoading, isError } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/admin/appointments/all"],
  });

  // Use real data only - no fallback to mock data
  const effectiveAppointments = appointments;

  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; appointment: AppointmentWithDetails | null }>({
    open: false,
    appointment: null,
  });

  const handleViewDetails = (appointment: AppointmentWithDetails) => {
    setDetailsDialog({ open: true, appointment });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "no_show":
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      case "no_show":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const canMarkAsNoShow = (appointment: AppointmentWithDetails) => {
    if (appointment.status !== "confirmed") return false;

    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const now = new Date();
    return appointmentDateTime < now;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Appointment Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all patient appointments and queue flow
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                <SelectItem value="1">Dr. Smith</SelectItem>
                <SelectItem value="2">Dr. Johnson</SelectItem>
                <SelectItem value="3">Dr. Williams</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : effectiveAppointments && effectiveAppointments.length > 0 ? (
            <div className="space-y-4">
              {effectiveAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <p className="font-medium text-sm">
                          {format(new Date(appointment.appointmentDate), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium truncate">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground truncate">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{appointment.reason}</p>
                      {appointment.notes && (
                        <p className="text-xs text-muted-foreground truncate">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status.replace("_", " ")}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Reschedule</DropdownMenuItem>
                        {appointment.status === "confirmed" && (
                          <DropdownMenuItem>Cancel</DropdownMenuItem>
                        )}
                        {canMarkAsNoShow(appointment) && (
                          <DropdownMenuItem className="text-orange-600">
                            <UserX className="h-4 w-4 mr-2" />
                            Mark as No Show
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Management Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Queue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <p className="text-sm text-muted-foreground">Waiting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ open, appointment: open ? detailsDialog.appointment : null })}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>

          {detailsDialog.appointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={detailsDialog.appointment.patient?.profileImageUrl || ""} />
                        <AvatarFallback>
                          {detailsDialog.appointment.patient?.firstName?.[0]}{detailsDialog.appointment.patient?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {detailsDialog.appointment.patient?.firstName} {detailsDialog.appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {detailsDialog.appointment.patient?.gender} • {detailsDialog.appointment.patient?.dateOfBirth &&
                            Math.floor((new Date().getTime() - new Date(detailsDialog.appointment.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{detailsDialog.appointment.patient?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{detailsDialog.appointment.patient?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{detailsDialog.appointment.patient?.address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Doctor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={detailsDialog.appointment.doctor?.profileImageUrl || ""} />
                        <AvatarFallback>
                          Dr. {detailsDialog.appointment.doctor?.firstName?.[0]}{detailsDialog.appointment.doctor?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          Dr. {detailsDialog.appointment.doctor?.firstName} {detailsDialog.appointment.doctor?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {detailsDialog.appointment.doctor?.specialty}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {detailsDialog.appointment.doctor?.department?.name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{detailsDialog.appointment.doctor?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{detailsDialog.appointment.doctor?.phone}</span>
                      </div>
                      <div className="text-sm">
                        <Label className="text-xs font-medium">Experience:</Label>
                        <p className="text-muted-foreground">{detailsDialog.appointment.doctor?.experience} years</p>
                      </div>
                      <div className="text-sm">
                        <Label className="text-xs font-medium">Consultation Fee:</Label>
                        <p className="text-muted-foreground">${detailsDialog.appointment.doctor?.consultationFee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date & Time</Label>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(detailsDialog.appointment.appointmentDate), "PPP")}
                        <Clock className="h-3 w-3 ml-2" />
                        {detailsDialog.appointment.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(detailsDialog.appointment.status)}>
                          {detailsDialog.appointment.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reason for Visit</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {detailsDialog.appointment.reason || "No reason specified"}
                    </p>
                  </div>
                  {detailsDialog.appointment.notes && (
                    <div>
                      <Label className="text-sm font-medium">Additional Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {detailsDialog.appointment.notes}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created: {format(new Date(detailsDialog.appointment.createdAt), "PPp")}
                    {detailsDialog.appointment.updatedAt !== detailsDialog.appointment.createdAt && (
                      <> • Updated: {format(new Date(detailsDialog.appointment.updatedAt), "PPp")}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialog({ open: false, appointment: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}