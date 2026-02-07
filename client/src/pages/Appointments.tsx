import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Plus,
  MapPin,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format, isPast, parseISO } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment, AppointmentWithDetails } from "@shared/schema";

// Mock data for when database is not available
const mockAppointments: AppointmentWithDetails[] = [
 {
   id: 1,
   patientId: "dev-user",
   doctorId: 1,
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    appointmentTime: "10:30:00",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: "Regular checkup for hypertension",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 1,
      userId: "mock-doctor-user-id",
      departmentId: 1,
      specialty: "Cardiologist",
      qualification: "MD, FACC",
      experience: 10,
      consultationFee: "150.00",
      bio: "Board-certified cardiologist",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id",
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
  },
  {
    id: 2,
    patientId: "dev-user",
    doctorId: 2,
    appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    appointmentTime: "14:00:00",
    status: "completed",
    reason: "Follow-up consultation",
    notes: "Checking medication effectiveness",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 2,
      userId: "mock-doctor-user-id-2",
      departmentId: 2,
      specialty: "Orthopedic Surgeon",
      qualification: "MD, MS Ortho",
      experience: 8,
      consultationFee: "200.00",
      bio: "Specialized in joint replacements",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-2",
        email: "dr.johnson@hospital.com",
        firstName: "Michael",
        lastName: "Johnson",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 333-4444",
        dateOfBirth: "1975-05-20",
        gender: "male",
        address: "Medical Center",
        pushToken: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 2,
        name: "Orthopedics",
        description: "Bone and muscle care",
        icon: "bone",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 3,
    patientId: "dev-user",
    doctorId: 3,
    appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    appointmentTime: "09:00:00",
    status: "confirmed",
    reason: "Dermatology consultation",
    notes: "Skin condition evaluation",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 3,
      userId: "mock-doctor-user-id-3",
      departmentId: 3,
      specialty: "Dermatologist",
      qualification: "MD, FAAD",
      experience: 12,
      consultationFee: "120.00",
      bio: "Specialized in skin disorders and cosmetic dermatology",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-3",
        email: "dr.brown@hospital.com",
        firstName: "Emily",
        lastName: "Brown",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 555-6666",
        dateOfBirth: "1978-03-15",
        gender: "female",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 3,
        name: "Dermatology",
        description: "Skin care and treatment",
        icon: "skin",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 4,
    patientId: "dev-user",
    doctorId: 4,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    appointmentTime: "11:30:00",
    status: "pending",
    reason: "Neurology consultation",
    notes: "Headache evaluation",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 4,
      userId: "mock-doctor-user-id-4",
      departmentId: 4,
      specialty: "Neurologist",
      qualification: "MD, PhD",
      experience: 15,
      consultationFee: "180.00",
      bio: "Expert in neurological disorders and brain health",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-4",
        email: "dr.davis@hospital.com",
        firstName: "Robert",
        lastName: "Davis",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 777-8888",
        dateOfBirth: "1970-08-22",
        gender: "male",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 4,
        name: "Neurology",
        description: "Brain and nervous system care",
        icon: "brain",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 5,
    patientId: "dev-user",
    doctorId: 5,
    appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    appointmentTime: "15:30:00",
    status: "completed",
    reason: "Pediatric checkup",
    notes: "Routine child health examination",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 5,
      userId: "mock-doctor-user-id-5",
      departmentId: 5,
      specialty: "Pediatrician",
      qualification: "MD, FAAP",
      experience: 9,
      consultationFee: "100.00",
      bio: "Dedicated to children's health and development",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-5",
        email: "dr.wilson@hospital.com",
        firstName: "Lisa",
        lastName: "Wilson",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 999-0000",
        dateOfBirth: "1982-11-30",
        gender: "female",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 5,
        name: "Pediatrics",
        description: "Children's health care",
        icon: "baby",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 6,
    patientId: "dev-user",
    doctorId: 6,
    appointmentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
    appointmentTime: "13:00:00",
    status: "confirmed",
    reason: "Gynecology consultation",
    notes: "Annual women's health check",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 6,
      userId: "mock-doctor-user-id-6",
      departmentId: 6,
      specialty: "Gynecologist",
      qualification: "MD, FACOG",
      experience: 11,
      consultationFee: "140.00",
      bio: "Specialized in women's reproductive health",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-6",
        email: "dr.garcia@hospital.com",
        firstName: "Maria",
        lastName: "Garcia",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 222-3333",
        dateOfBirth: "1979-07-12",
        gender: "female",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 6,
        name: "Gynecology",
        description: "Women's reproductive health",
        icon: "female",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 7,
    patientId: "dev-user",
    doctorId: 7,
    appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    appointmentTime: "16:00:00",
    status: "confirmed",
    reason: "Ophthalmology checkup",
    notes: "Vision screening and eye health",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 7,
      userId: "mock-doctor-user-id-7",
      departmentId: 7,
      specialty: "Ophthalmologist",
      qualification: "MD, FACS",
      experience: 14,
      consultationFee: "160.00",
      bio: "Expert in eye care and vision correction",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-7",
        email: "dr.miller@hospital.com",
        firstName: "James",
        lastName: "Miller",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 444-5555",
        dateOfBirth: "1972-12-05",
        gender: "male",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 7,
        name: "Ophthalmology",
        description: "Eye care and vision",
        icon: "eye",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 8,
    patientId: "dev-user",
    doctorId: 8,
    appointmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
    appointmentTime: "10:00:00",
    status: "completed",
    reason: "Psychiatry session",
    notes: "Mental health consultation",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 8,
      userId: "mock-doctor-user-id-8",
      departmentId: 8,
      specialty: "Psychiatrist",
      qualification: "MD, ABPN",
      experience: 13,
      consultationFee: "170.00",
      bio: "Specialized in mental health and therapy",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-8",
        email: "dr.anderson@hospital.com",
        firstName: "Jennifer",
        lastName: "Anderson",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 666-7777",
        dateOfBirth: "1976-04-18",
        gender: "female",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 8,
        name: "Psychiatry",
        description: "Mental health care",
        icon: "brain",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 9,
    patientId: "dev-user",
    doctorId: 9,
    appointmentDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
    appointmentTime: "14:30:00",
    status: "pending",
    reason: "Urology consultation",
    notes: "Kidney function check",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 9,
      userId: "mock-doctor-user-id-9",
      departmentId: 9,
      specialty: "Urologist",
      qualification: "MD, FACS",
      experience: 16,
      consultationFee: "190.00",
      bio: "Expert in urinary tract and male reproductive health",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-9",
        email: "dr.taylor@hospital.com",
        firstName: "David",
        lastName: "Taylor",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 888-9999",
        dateOfBirth: "1968-09-25",
        gender: "male",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 9,
        name: "Urology",
        description: "Urinary system care",
        icon: "kidney",
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
  },
  {
    id: 10,
    patientId: "dev-user",
    doctorId: 10,
    appointmentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    appointmentTime: "11:00:00",
    status: "confirmed",
    reason: "Endocrinology consultation",
    notes: "Thyroid function evaluation",
    createdAt: new Date(),
    updatedAt: new Date(),
    doctor: {
      id: 10,
      userId: "mock-doctor-user-id-10",
      departmentId: 10,
      specialty: "Endocrinologist",
      qualification: "MD, FACE",
      experience: 17,
      consultationFee: "175.00",
      bio: "Specialized in hormone disorders and diabetes",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "mock-doctor-user-id-10",
        email: "dr.white@hospital.com",
        firstName: "Amanda",
        lastName: "White",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 000-1111",
        dateOfBirth: "1967-02-14",
        gender: "female",
        address: "Medical Center",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      department: {
        id: 10,
        name: "Endocrinology",
        description: "Hormone and metabolic disorders",
        icon: "gland",
        createdAt: new Date()
      }
    },
    patient: {
      id: "mock-patient-id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

export default function Appointments() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: number | null }>({
    open: false,
    appointmentId: null,
  });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; appointment: AppointmentWithDetails | null }>({
    open: false,
    appointment: null,
  });

  const handleViewDetails = (appointment: AppointmentWithDetails) => {
    setDetailsDialog({ open: true, appointment });
  };

  const handleReschedule = (appointment: AppointmentWithDetails) => {
    // Navigate to booking page with pre-filled data
    navigate(`/appointments/book?reschedule=${appointment.id}&doctor=${appointment.doctorId}&date=${appointment.appointmentDate}&time=${appointment.appointmentTime}&reason=${encodeURIComponent(appointment.reason || '')}`);
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

  const { data: appointments, isLoading, isError } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  // Use API data if available, otherwise fall back to mock data
  const effectiveAppointments = appointments || mockAppointments;

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/appointments/${id}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setCancelDialog({ open: false, appointmentId: null });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    },
  });

  const upcomingAppointments = (effectiveAppointments || []).filter(
    a => (a.status === "confirmed" || a.status === "pending") && !isPast(parseISO(a.appointmentDate))
  );

  const pastAppointments = (effectiveAppointments || []).filter(
    a => a.status === "completed" || isPast(parseISO(a.appointmentDate))
  );

  const cancelledAppointments = (effectiveAppointments || []).filter(
    a => a.status === "cancelled"
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your scheduled visits</p>
        </div>
        <Link href="/appointments/book">
          <Button data-testid="button-new-appointment">
            <Plus className="h-4 w-4 mr-2" />
            Book New
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState 
              message="No upcoming appointments"
              action={
                <Link href="/appointments/book">
                  <Button data-testid="button-book-empty">
                    Book an Appointment
                  </Button>
                </Link>
              }
            />
          ) : (
            upcomingAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={() => setCancelDialog({ open: true, appointmentId: appointment.id })}
                onViewDetails={() => handleViewDetails(appointment)}
                onReschedule={() => handleReschedule(appointment)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : pastAppointments.length === 0 ? (
            <EmptyState message="No past appointments" />
          ) : (
            pastAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isPast
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : cancelledAppointments.length === 0 ? (
            <EmptyState message="No cancelled appointments" />
          ) : (
            cancelledAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isCancelled
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, appointmentId: open ? cancelDialog.appointmentId : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, appointmentId: null })}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialog.appointmentId && cancelMutation.mutate(cancelDialog.appointmentId)}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ open, appointment: open ? detailsDialog.appointment : null })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about your appointment
            </DialogDescription>
          </DialogHeader>

          {detailsDialog.appointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.patient?.firstName} {detailsDialog.appointment.patient?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.patient?.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.patient?.phone}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Doctor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground">
                        Dr. {detailsDialog.appointment.doctor?.firstName} {detailsDialog.appointment.doctor?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Specialty</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.specialty}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Qualification</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.qualification || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Experience</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.experience ? `${detailsDialog.appointment.doctor.experience} years` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.department?.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Consultation Fee</Label>
                      <p className="text-sm text-muted-foreground">
                        ${detailsDialog.appointment.doctor?.consultationFee || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.phone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.doctor?.email || "Not specified"}
                      </p>
                    </div>
                    {detailsDialog.appointment.doctor?.bio && (
                      <div>
                        <Label className="text-sm font-medium">Bio</Label>
                        <p className="text-sm text-muted-foreground">
                          {detailsDialog.appointment.doctor.bio}
                        </p>
                      </div>
                    )}
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
                        {format(parseISO(detailsDialog.appointment.appointmentDate), "PPP")} at {detailsDialog.appointment.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.reason || "No reason specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={getStatusVariant(detailsDialog.appointment.status)}>
                        {detailsDialog.appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground">
                        {detailsDialog.appointment.notes || "No additional notes"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleReschedule(detailsDialog.appointment!)}
                  className="flex-1"
                >
                  Reschedule Appointment
                </Button>
                {detailsDialog.appointment.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialog({ open: true, appointmentId: detailsDialog.appointment!.id })}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Appointment
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialog({ open: false, appointment: null })}
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

function AppointmentCard({
  appointment,
  isPast,
  isCancelled,
  onCancel,
  onViewDetails,
  onReschedule
}: {
  appointment: AppointmentWithDetails;
  isPast?: boolean;
  isCancelled?: boolean;
  onCancel?: () => void;
  onViewDetails?: () => void;
  onReschedule?: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className={isPast || isCancelled ? "opacity-75" : ""} data-testid={`card-appointment-${appointment.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarImage src={appointment.doctor?.profileImageUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {appointment.doctor?.firstName?.[0] || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold">
                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
              </h3>
              <p className="text-sm text-primary">{appointment.doctor?.specialty}</p>
              {appointment.reason && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {appointment.reason}
                </p>
              )}
            </div>
          </div>

          {/* Date, Time & Status */}
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <Badge className={statusColors[appointment.status] || ""}>
              {appointment.status}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {format(parseISO(appointment.appointmentDate), "MMM d, yyyy")}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {appointment.appointmentTime}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isPast && !isCancelled && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              data-testid={`button-view-${appointment.id}`}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              data-testid={`button-reschedule-${appointment.id}`}
            >
              Reschedule
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                data-testid={`button-cancel-${appointment.id}`}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {isPast && appointment.status === "completed" && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              data-testid={`button-view-summary-${appointment.id}`}
            >
              View Summary
            </Button>
            <Link href={`/records`}>
              <Button variant="outline" size="sm" data-testid={`button-view-prescription-${appointment.id}`}>
                View Prescription
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {action}
    </div>
  );
}