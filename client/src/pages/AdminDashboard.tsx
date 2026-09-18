import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Stethoscope,
  Building2,
  Pill,
  Calendar,
  CreditCard,
  TrendingUp,
  Activity,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Doctor, Department, Appointment } from "@shared/schema";

// Mock data for when database is not available
const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: "mock-user-id-1",
    departmentId: 1,
    specialty: "Cardiologist",
    qualification: "MD, FACC",
    experience: 10,
    consultationFee: "150.00",
    bio: "Board-certified cardiologist with expertise in heart conditions",
    isAvailable: true,
    createdAt: new Date()
  },
  {
    id: 2,
    userId: "mock-user-id-2",
    departmentId: 2,
    specialty: "Orthopedic Surgeon",
    qualification: "MD, MS Ortho",
    experience: 8,
    consultationFee: "200.00",
    bio: "Specialized in joint replacements and sports injuries",
    isAvailable: true,
    createdAt: new Date()
  },
  {
    id: 3,
    userId: "mock-user-id-3",
    departmentId: 3,
    specialty: "Pediatrician",
    qualification: "MD Pediatrics",
    experience: 12,
    consultationFee: "120.00",
    bio: "Experienced in children's health and development",
    isAvailable: true,
    createdAt: new Date()
  }
];

const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart and cardiovascular system care",
    icon: "heart",
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Orthopedics",
    description: "Bone and muscle care",
    icon: "bone",
    createdAt: new Date()
  },
  {
    id: 3,
    name: "Pediatrics",
    description: "Children's health care",
    icon: "baby",
    createdAt: new Date()
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: "mock-patient-id-1",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "09:30:00",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: "Regular checkup for hypertension",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: "mock-patient-id-2",
    doctorId: 2,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "10:30:00",
    status: "completed",
    reason: "Follow-up consultation",
    notes: "Checking recovery after knee surgery",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    patientId: "mock-patient-id-3",
    doctorId: 3,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "11:00:00",
    status: "confirmed",
    reason: "Child vaccination",
    notes: "6-month vaccinations for infant",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    patientId: "mock-patient-id-4",
    doctorId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: "14:00:00",
    status: "pending",
    reason: "Chest pain evaluation",
    notes: "Patient reported chest discomfort",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: doctors, isLoading: doctorsLoading, isError: doctorsError } = useQuery<Doctor[]>({
    queryKey: ["/api/admin/doctors"],
  });

  const { data: departments, isLoading: departmentsLoading, isError: departmentsError } = useQuery<Department[]>({
    queryKey: ["/api/admin/departments"],
  });

  const { data: todayAppointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery<Appointment[]>({
    queryKey: ["/api/admin/appointments/today"],
  });

  // Use real data safely - ensure array types
  const effectiveDoctors = Array.isArray(doctors) ? doctors : [];
  const effectiveDepartments = Array.isArray(departments) ? departments : [];
  const effectiveAppointments = Array.isArray(todayAppointments) ? todayAppointments : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-welcome">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")} | Welcome, {user?.firstName || "Admin"}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<Stethoscope className="h-5 w-5" />}
          label="Total Doctors"
          value={(effectiveDoctors?.length || 0).toString()}
          loading={doctorsLoading}
          trend="+2 this month"
        />
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Departments"
          value={(effectiveDepartments?.length || 0).toString()}
          loading={departmentsLoading}
          trend="+1 this month"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Today's Appointments"
          value={(effectiveAppointments?.length || 0).toString()}
          loading={appointmentsLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Patients"
          value="127"
          loading={false}
          trend="+12 this week"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Revenue Today"
          value="$2,450"
          loading={false}
          trend="+15%"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Reports Pending"
          value="8"
          loading={false}
          variant="warning"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/doctors">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Manage Doctors</h3>
              <p className="text-sm text-muted-foreground">Add, edit, or remove doctors and their schedules</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/departments">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 text-chart-2 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Departments</h3>
              <p className="text-sm text-muted-foreground">Manage hospital departments and specialties</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/medicines">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 text-chart-4 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Medicine Warehouse</h3>
              <p className="text-sm text-muted-foreground">Manage the master list of medicines</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/appointments">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Appointments</h3>
              <p className="text-sm text-muted-foreground">View and manage all patient appointments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/billing">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 text-chart-5 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Billing & Payments</h3>
              <p className="text-sm text-muted-foreground">Monitor transactions and manage invoices</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-muted text-foreground flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage patient and doctor accounts</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 text-chart-1 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Report Management</h3>
              <p className="text-sm text-muted-foreground">Upload and manage medical reports</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/medicines">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 text-chart-4 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Medicine Warehouse</h3>
              <p className="text-sm text-muted-foreground">Manage the master list of medicines</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg">Today's Appointments</CardTitle>
            <Link href="/admin/appointments">
              <Button variant="ghost" size="sm" data-testid="link-view-all-admin-appointments">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : effectiveAppointments && effectiveAppointments.length > 0 ? (
              <div className="space-y-3">
                {effectiveAppointments.slice(0, 5).map(appointment => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-sm font-medium min-w-[60px]">
                        {appointment.appointmentTime}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">John Doe</p>
                        <p className="text-xs text-muted-foreground">Dr. Sarah Smith</p>
                      </div>
                    </div>
                    <Badge 
                      variant={appointment.status === "confirmed" ? "default" : "secondary"}
                      className="flex-shrink-0"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OverviewItem
                icon={<Activity className="h-4 w-4" />}
                label="System Status"
                value="Operational"
                status="success"
              />
              <OverviewItem
                icon={<TrendingUp className="h-4 w-4" />}
                label="This Week's Bookings"
                value="42"
              />
              <OverviewItem
                icon={<Users className="h-4 w-4" />}
                label="New Patients (This Month)"
                value="18"
              />
              <OverviewItem
                icon={<CreditCard className="h-4 w-4" />}
                label="Revenue (This Month)"
                value="$8,450"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  trend,
  variant
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
  trend?: string;
  variant?: "warning";
}) {
  const bgColor = variant === "warning" ? "bg-orange-500/10" : "bg-muted";
  const textColor = variant === "warning" ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center ${textColor} flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {trend && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewItem({ 
  icon, 
  label, 
  value, 
  status 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  status?: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      <span className={`font-medium ${status ? statusColors[status] : ""}`}>
        {value}
      </span>
    </div>
  );
}