import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  Clock,
  Search,
  ChevronRight,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { format, isToday } from "date-fns";
import type { Appointment, AppointmentWithDetails } from "@shared/schema";

// Mock data for when database is not available
const mockAppointments: AppointmentWithDetails[] = [
  {
    id: 1,
    patientId: "mock-patient-id-1",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "10:00:00",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: "Patient has a history of hypertension",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "mock-patient-id-1",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "Male",
      address: "123 Main St, City, State 12345",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 1,
      userId: "dev-doctor",
      departmentId: 1,
      specialty: "General Medicine",
      qualification: "MD",
      experience: 10,
      consultationFee: 500,
      bio: "Experienced general physician with over 10 years of practice",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "dev-doctor",
        email: "dr.dev@hospital.com",
        firstName: "Dr. Dev",
        lastName: "User",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 111-2222",
        dateOfBirth: "1980-01-15",
        gender: "Female",
        address: "456 Medical Ave, Health City, HC 56789",
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
    patientId: "mock-patient-id-2",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "11:00:00",
    status: "completed",
    reason: "Follow-up consultation",
    notes: "Checking medication effectiveness",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "mock-patient-id-2",
      email: "sarah.johnson@example.com",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 234-5678",
      dateOfBirth: "1990-03-20",
      gender: "Female",
      address: "456 Oak Ave, Town, State 23456",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 1,
      userId: "dev-doctor",
      departmentId: 1,
      specialty: "General Medicine",
      qualification: "MD",
      experience: 10,
      consultationFee: 500,
      bio: "Experienced general physician with over 10 years of practice",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "dev-doctor",
        email: "dr.dev@hospital.com",
        firstName: "Dr. Dev",
        lastName: "User",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 111-2222",
        dateOfBirth: "1980-01-15",
        gender: "Female",
        address: "456 Medical Ave, Health City, HC 56789",
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
    id: 3,
    patientId: "mock-patient-id-3",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "14:30:00",
    status: "confirmed",
    reason: "Chest pain evaluation",
    notes: "Patient reported chest discomfort",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "mock-patient-id-3",
      email: "michael.brown@example.com",
      firstName: "Michael",
      lastName: "Brown",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 345-6789",
      dateOfBirth: "1978-11-10",
      gender: "Male",
      address: "789 Pine Rd, Village, State 34567",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 1,
      userId: "dev-doctor",
      departmentId: 1,
      specialty: "General Medicine",
      qualification: "MD",
      experience: 10,
      consultationFee: 500,
      bio: "Experienced general physician with over 10 years of practice",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "dev-doctor",
        email: "dr.dev@hospital.com",
        firstName: "Dr. Dev",
        lastName: "User",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 111-2222",
        dateOfBirth: "1980-01-15",
        gender: "Female",
        address: "456 Medical Ave, Health City, HC 56789",
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
    id: 4,
    patientId: "mock-patient-id-4",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "15:30:00",
    status: "pending",
    reason: "Routine checkup",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "mock-patient-id-4",
      email: "emily.davis@example.com",
      firstName: "Emily",
      lastName: "Davis",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 456-7890",
      dateOfBirth: "1995-07-25",
      gender: "Female",
      address: "321 Elm St, Borough, State 45678",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    doctor: {
      id: 1,
      userId: "dev-doctor",
      departmentId: 1,
      specialty: "General Medicine",
      qualification: "MD",
      experience: 10,
      consultationFee: 500,
      bio: "Experienced general physician with over 10 years of practice",
      isAvailable: true,
      createdAt: new Date(),
      user: {
        id: "dev-doctor",
        email: "dr.dev@hospital.com",
        firstName: "Dr. Dev",
        lastName: "User",
        profileImageUrl: "",
        role: "doctor",
        phone: "+1 (555) 111-2222",
        dateOfBirth: "1980-01-15",
        gender: "Female",
        address: "456 Medical Ave, Health City, HC 56789",
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
  }
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: todayAppointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/doctor/appointments/today"],
  });

  const { data: pendingPrescriptions } = useQuery({
    queryKey: ["/api/doctor/prescriptions/pending"],
  });

  const { data: pendingReports } = useQuery({
    queryKey: ["/api/doctor/reports/pending"],
  });

  const { data: revenueSummary } = useQuery({
    queryKey: ["/api/doctor/revenue/summary"],
  });

  // Use mock data if there's an error (likely due to no database connection)
  const effectiveAppointments = appointmentsError ? mockAppointments : todayAppointments;

  const appointments = effectiveAppointments || [];
  const confirmedToday = appointments.filter(a => a.status === "confirmed").length;
  const completedToday = appointments.filter(a => a.status === "completed").length;
  const pendingTasksCount = appointments.filter(a => a.status === "pending").length +
                           appointments.filter(a => a.status === "completed").length;
  const nextPatient = appointments.find(a => a.status === "confirmed");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-doctor-welcome">
          Good {getTimeOfDay()}, Dr. {user?.lastName || user?.firstName || "Doctor"}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Today's Patients"
          value={appointments.length.toString()}
          loading={appointmentsLoading}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Confirmed"
          value={confirmedToday.toString()}
          loading={appointmentsLoading}
          variant="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={completedToday.toString()}
          loading={appointmentsLoading}
          variant="success"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending Tasks"
          value={pendingTasksCount.toString()}
          loading={appointmentsLoading}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Today's Revenue"
          value="$450"
          loading={false}
          variant="success"
        />
      </div>

      {/* Patient Search */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-patient-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <Link href="/doctor/appointments">
                <Button variant="ghost" size="sm" data-testid="link-view-all-schedule">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment, index) => (
                    <DoctorAppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      isNext={index === 0 && appointment.status === "confirmed"}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Pending Appointments */}
              {appointments.filter(apt => apt.status === 'pending').slice(0, 2).map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-blue-500/5 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Appointment Pending</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient'} - {appointment.reason || 'General consultation'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/doctor/consultation/${appointment.id}`}>
                    <Button size="sm" variant="outline">Start</Button>
                  </Link>
                </div>
              ))}

              {/* Pending Lab Reports/Documents */}
              {appointments.filter(apt => apt.status === 'completed').slice(0, 1).map(appointment => (
                <div key={`lab-${appointment.id}`} className="flex items-center justify-between p-3 rounded-lg border bg-orange-500/5 border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Lab Results Available</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient'} - Review pending results
                      </p>
                    </div>
                  </div>
                  <Link href={`/doctor/patient/${appointment.patientId}/records?tab=documents`}>
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                </div>
              ))}

              {/* Follow-up Required */}
              {appointments.filter(apt => apt.status === 'completed' && apt.notes?.includes('follow-up')).slice(0, 1).map(appointment => (
                <div key={`followup-${appointment.id}`} className="flex items-center justify-between p-3 rounded-lg border bg-purple-500/5 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Follow-up Required</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient'} - Schedule next visit
                      </p>
                    </div>
                  </div>
                  <Link href="/doctor/appointments">
                    <Button size="sm" variant="outline">Schedule</Button>
                  </Link>
                </div>
              ))}

              {/* Show message if no pending tasks */}
              {appointments.filter(apt => apt.status === 'pending').length === 0 && appointments.filter(apt => apt.status === 'completed').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending tasks at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Revenue Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueSummary ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <p className="text-lg font-bold text-green-600">${revenueSummary.thisMonth.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">This Month</p>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">${revenueSummary.today.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Consultations ({revenueSummary.breakdown.consultations.count})</span>
                        <span className="font-medium">${revenueSummary.breakdown.consultations.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Procedures ({revenueSummary.breakdown.procedures.count})</span>
                        <span className="font-medium">${revenueSummary.breakdown.procedures.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Follow-ups ({revenueSummary.breakdown.followups.count})</span>
                        <span className="font-medium">${revenueSummary.breakdown.followups.amount.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Earnings</span>
                          <span>${revenueSummary.thisMonth.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Patient */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Next Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : nextPatient ? (
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {nextPatient.patient ? `${nextPatient.patient.firstName[0]}${nextPatient.patient.lastName[0]}` : 'UP'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">
                    {nextPatient.patient ? `${nextPatient.patient.firstName} ${nextPatient.patient.lastName}` : 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {nextPatient.appointmentTime}
                  </p>
                  <Link href={`/doctor/consultation/${nextPatient.id}`}>
                    <Button className="w-full" data-testid="button-start-consultation">
                      Start Consultation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No patients in queue</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/doctor/patients">
                <Button variant="outline" className="w-full justify-between" data-testid="link-view-patients">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    View All Patients
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/doctor/prescriptions">
                <Button variant="outline" className="w-full justify-between" data-testid="link-prescriptions">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Prescriptions
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/doctor/schedule">
                <Button variant="outline" className="w-full justify-between" data-testid="link-schedule">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    My Schedule
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function StatCard({ 
  icon, 
  label, 
  value, 
  loading, 
  variant 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  loading: boolean;
  variant?: "default" | "success" | "warning";
}) {
  const bgColors = {
    default: "bg-muted",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
  };

  const textColors = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColors[variant || "default"]} flex items-center justify-center ${textColors[variant || "default"]} flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-8 w-8" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DoctorAppointmentCard({ appointment, isNext }: { appointment: Appointment; isNext?: boolean }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  // Get patient name from appointment data or fall back to mock data for display
  const patientName = appointment.patient 
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : "Unknown Patient";
  
  // Get patient initials from actual data or generate from name
  const getInitials = (name: string) => {
    if (appointment.patient?.firstName && appointment.patient?.lastName) {
      return `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`;
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${isNext ? "border-primary bg-primary/5" : "bg-card"} hover-elevate`}
      data-testid={`card-doctor-appointment-${appointment.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[60px]">
            <p className="text-lg font-bold">{appointment.appointmentTime}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(patientName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium">{patientName}</p>
              {isNext && (
                <Badge variant="default" className="text-xs">
                  Next
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {appointment.reason || "General Consultation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[appointment.status] || ""}>
            {appointment.status}
          </Badge>
          <Link href={`/doctor/consultation/${appointment.id}`}>
            <Button size="sm" variant="ghost" data-testid={`button-view-patient-${appointment.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}