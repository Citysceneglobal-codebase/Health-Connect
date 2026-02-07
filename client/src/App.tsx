import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, User, UserCheck, Settings } from "lucide-react";
import { createSkipLinks, ScreenReader, HighContrastMode, ReducedMotion } from "@/lib/accessibility";
import { useEffect } from "react";

import { PatientLayout } from "@/components/PatientLayout";
import { DoctorLayout } from "@/components/DoctorLayout";
import { AdminLayout } from "@/components/AdminLayout";

import SignIn from "@/pages/SignIn";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import PatientDashboard from "@/pages/PatientDashboard";
import Appointments from "@/pages/Appointments";
import BookAppointment from "@/pages/BookAppointment";
import Vitals from "@/pages/Vitals";
import Allergies from "@/pages/Allergies";
import Records from "@/pages/Records";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorConsultation from "@/pages/DoctorConsultation";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDoctors from "@/pages/AdminDoctors";
import AdminDepartments from "@/pages/AdminDepartments";
import AdminMedicines from "@/pages/AdminMedicines";
import AdminPatients from "@/pages/AdminPatients";
// Newly added pages
import FamilyMembers from "@/pages/FamilyMembers";
import LabTests from "@/pages/LabTests";
import Payments from "@/pages/Payments";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
// Doctor pages
import DoctorAppointments from "@/pages/DoctorAppointments";
import DoctorPatients from "@/pages/DoctorPatients";
import DoctorPatientRecords from "@/pages/DoctorPatientRecords";
import DoctorPrescriptions from "@/pages/DoctorPrescriptions";
import DoctorSchedule from "@/pages/DoctorSchedule";
import DoctorDocumentReview from "@/pages/DoctorDocumentReview";
import DoctorReports from "@/pages/DoctorReports";
import DoctorMessages from "@/pages/DoctorMessages";
import DoctorSettings from "@/pages/DoctorSettings";
// Profile pages
import PatientProfile from "@/pages/PatientProfile";
import PatientSettings from "@/pages/PatientSettings";
import DoctorProfile from "@/pages/DoctorProfile";
import AdminProfile from "@/pages/AdminProfile";
// Admin management pages
import AdminAppointments from "@/pages/AdminAppointments";
import AdminReports from "@/pages/AdminReports";
import AdminBilling from "@/pages/AdminBilling";
import AdminUsers from "@/pages/AdminUsers";
import AdminSchedules from "@/pages/AdminSchedules";
import AdminFinancial from "@/pages/AdminFinancial";

function PatientRoutes() {
  return (
    <PatientLayout>
      <Switch>
        <Route path="/" component={PatientDashboard} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/appointments/book" component={BookAppointment} />
        <Route path="/vitals" component={Vitals} />
        <Route path="/allergies" component={Allergies} />
        <Route path="/records" component={Records} />
        <Route path="/family" component={FamilyMembers} />
        <Route path="/lab-tests" component={LabTests} />
        <Route path="/payments" component={Payments} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/messages" component={Messages} />
        <Route path="/profile" component={PatientProfile} />
        <Route component={NotFound} />
      </Switch>
    </PatientLayout>
  );
}

function DoctorRoutes() {
  return (
    <DoctorLayout>
      <Switch>
        <Route path="/doctor" component={DoctorDashboard} />
        <Route path="/doctor/appointments" component={DoctorAppointments} />
        <Route path="/doctor/consultation/:id" component={DoctorConsultation} />
        <Route path="/doctor/patients" component={DoctorPatients} />
        <Route path="/doctor/patient/:patientId/records" component={DoctorPatientRecords} />
        <Route path="/doctor/prescriptions" component={DoctorPrescriptions} />
        <Route path="/doctor/schedule" component={DoctorSchedule} />
        <Route path="/doctor/document-review" component={DoctorDocumentReview} />
        <Route path="/doctor/reports" component={DoctorReports} />
        <Route path="/doctor/messages" component={DoctorMessages} />
        <Route path="/doctor/profile" component={DoctorProfile} />
        <Route component={NotFound} />
      </Switch>
    </DoctorLayout>
  );
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/doctors" component={AdminDoctors} />
        <Route path="/admin/departments" component={AdminDepartments} />
        <Route path="/admin/medicines" component={AdminMedicines} />
        <Route path="/admin/patients" component={AdminPatients} />
        <Route path="/admin/appointments" component={AdminAppointments} />
        <Route path="/admin/reports" component={AdminReports} />
        <Route path="/admin/billing" component={AdminBilling} />
        <Route path="/admin/financial" component={AdminFinancial} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/schedules" component={AdminSchedules} />
        <Route path="/admin/settings">
          {() => (
            <div className="max-w-6xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-muted-foreground">Settings coming soon.</p>
            </div>
          )}
        </Route>
        <Route path="/admin/profile" component={AdminProfile} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminRoutes />;
  }

  if (user?.role === "doctor") {
    return <DoctorRoutes />;
  }

  return <PatientRoutes />;
}

function AuthenticatedApp() {
  const { user: authUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Show SignIn page if not authenticated
  if (!authUser) {
    return <SignIn />;
  }

  return <DashboardRouter />;
}


function App() {
  useEffect(() => {
    // Initialize accessibility features
    const skipLinks = createSkipLinks();
    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Monitor accessibility preferences
    const cleanupHighContrast = HighContrastMode.watchForChanges((enabled) => {
      document.documentElement.setAttribute('data-high-contrast', enabled.toString());
    });

    const cleanupReducedMotion = ReducedMotion.watchForChanges((enabled) => {
      document.documentElement.setAttribute('data-reduced-motion', enabled.toString());
    });

    // Announce page load for screen readers
    ScreenReader.announce('Health Connect application loaded');

    return () => {
      // Cleanup
      if (skipLinks.parentNode) {
        skipLinks.parentNode.removeChild(skipLinks);
      }
      cleanupHighContrast();
      cleanupReducedMotion();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <div id="main-content">
            <AuthenticatedApp />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
