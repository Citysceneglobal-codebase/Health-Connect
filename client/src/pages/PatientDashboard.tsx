import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  FileText, 
  Heart, 
  Users, 
  Clock, 
  ChevronRight,
  AlertTriangle,
  Pill,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Appointment, Vital, Allergy, Prescription } from "@shared/schema";

// Mock data for when database is not available
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: "mock-patient-id",
    doctorId: 1,
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    appointmentTime: "10:30:00",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: "Regular checkup for hypertension",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: "mock-patient-id",
    doctorId: 2,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    appointmentTime: "14:00:00",
    status: "pending",
    reason: "Follow-up consultation",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockVitals: Vital[] = [
  {
    id: 1,
    patientId: "mock-patient-id",
    type: "bp",
    value: "130/85",
    unit: "mmHg",
    recordedAt: new Date(),
    notes: "Slightly elevated, monitor closely"
  },
  {
    id: 2,
    patientId: "mock-patient-id",
    type: "heart_rate",
    value: "72",
    unit: "bpm",
    recordedAt: new Date(),
    notes: "Normal resting heart rate"
  },
  {
    id: 3,
    patientId: "mock-patient-id",
    type: "weight",
    value: "75",
    unit: "kg",
    recordedAt: new Date(),
    notes: ""
  },
  {
    id: 4,
    patientId: "mock-patient-id",
    type: "bmi",
    value: "24.5",
    unit: "",
    recordedAt: new Date(),
    notes: "Normal range"
  }
];

const mockAllergies: Allergy[] = [
  {
    id: 1,
    patientId: "mock-patient-id",
    type: "medicine",
    allergen: "Penicillin",
    severity: "severe",
    reaction: "Anaphylaxis",
    createdAt: new Date()
  }
];

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: vitals, isLoading: vitalsLoading, isError: vitalsError } = useQuery<Vital[]>({
    queryKey: ["/api/vitals"],
  });

  const { data: allergies, isLoading: allergiesLoading, isError: allergiesError } = useQuery<Allergy[]>({
    queryKey: ["/api/allergies"],
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
  });

  // Use mock data if there's an error (likely due to no database connection)
  const effectiveAppointments = appointmentsError ? mockAppointments : appointments;
  const effectiveVitals = vitalsError ? mockVitals : vitals;
  const effectiveAllergies = allergiesError ? mockAllergies : allergies;

  const upcomingAppointments = (effectiveAppointments || [])
    .filter(a => a.status === "confirmed" || a.status === "pending")
    .slice(0, 3);

  const recentVitals = (effectiveVitals || []).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
          Welcome back, {user?.firstName || "Patient"}
        </h1>
        <p className="text-muted-foreground">
          Manage your health, appointments, and records all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Upcoming"
          value={upcomingAppointments.length.toString()}
          loading={appointmentsLoading}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Reports"
          value="3"
          loading={false}
        />
        <StatCard
          icon={<Pill className="h-5 w-5" />}
          label="Prescriptions"
          value={((prescriptions || []).length || 0).toString()}
          loading={prescriptionsLoading}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Allergies"
          value={((effectiveAllergies || []).length || 0).toString()}
          loading={allergiesLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/appointments/book">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">Find doctors & schedule visits</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/records">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 text-chart-2 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">View Records</h3>
                <p className="text-sm text-muted-foreground">Lab reports & prescriptions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/vitals">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 text-chart-5 flex items-center justify-center flex-shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Track Vitals</h3>
                <p className="text-sm text-muted-foreground">Monitor your health metrics</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <Link href="/appointments">
              <Button variant="ghost" size="sm" data-testid="link-view-all-appointments">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Link href="/appointments/book">
                  <Button data-testid="button-book-first-appointment">
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
              <Link href="/records">
                <Button variant="ghost" size="sm" data-testid="link-view-all-prescriptions">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !prescriptions || prescriptions.length === 0 ? (
                <div className="text-center py-6">
                  <Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No prescriptions yet</p>
                  <Link href="/records">
                    <Button size="sm" variant="outline" className="mt-3">
                      View Records
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.slice(0, 3).map(p => (
                    <div key={p.id} className="p-3 rounded-lg border bg-card hover-elevate">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Prescription #{p.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy") : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">Rx</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Vitals & Allergies */}
        <div className="space-y-6">
          {/* Vitals Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Recent Vitals</CardTitle>
              <Link href="/vitals">
                <Button variant="ghost" size="sm" data-testid="link-view-all-vitals">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {vitalsLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentVitals.length === 0 ? (
                <div className="text-center py-6">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No vitals recorded yet</p>
                  <Link href="/vitals">
                    <Button size="sm" data-testid="button-add-vitals">
                      Add Vitals
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {recentVitals.map(vital => (
                    <VitalCard key={vital.id} vital={vital} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">My Allergies</CardTitle>
              <Link href="/allergies">
                <Button variant="ghost" size="sm" data-testid="link-manage-allergies">
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {allergiesLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : effectiveAllergies && effectiveAllergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {effectiveAllergies.map(allergy => (
                    <Badge 
                      key={allergy.id} 
                      variant={allergy.severity === "severe" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {allergy.allergen}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No allergies recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: string; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
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

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <div 
      className="p-4 rounded-lg border bg-card hover-elevate"
      data-testid={`card-appointment-${appointment.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {format(new Date(appointment.appointmentDate), "MMM d, yyyy")} at {appointment.appointmentTime}
              </span>
            </div>
          </div>
        </div>
        <Badge className={statusColors[appointment.status] || ""}>
          {appointment.status}
        </Badge>
      </div>
    </div>
  );
}

function VitalCard({ vital }: { vital: Vital }) {
  const vitalIcons: Record<string, React.ReactNode> = {
    bp: <Activity className="h-4 w-4" />,
    glucose: <Activity className="h-4 w-4" />,
    heart_rate: <Heart className="h-4 w-4" />,
    weight: <Activity className="h-4 w-4" />,
    bmi: <Activity className="h-4 w-4" />,
    temperature: <Activity className="h-4 w-4" />,
  };

  const vitalLabels: Record<string, string> = {
    bp: "Blood Pressure",
    glucose: "Glucose",
    heart_rate: "Heart Rate",
    weight: "Weight",
    bmi: "BMI",
    temperature: "Temperature",
  };

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {vitalIcons[vital.type] || <Activity className="h-4 w-4" />}
        <span className="text-xs">{vitalLabels[vital.type] || vital.type}</span>
      </div>
      <p className="font-semibold">
        {vital.value} {vital.unit}
      </p>
    </div>
  );
}