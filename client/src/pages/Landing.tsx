
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  FileText, 
  Heart, 
  Shield, 
  Users, 
  Stethoscope,
  Clock,
  ChevronRight,
  User,
  UserCheck,
  Settings
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Landing() {
  const { user } = useAuth();
  const handleRoleLogin = (role: string) => {
    // In development mode, we'll simulate role selection
    if (process.env.NODE_ENV !== "production") {
      window.location.href = `/api/set-role/${role}`;
    } else {
      window.location.href = "/api/login";
    }
  };

  const handleLogout = () => {
    // Go to logout endpoint, then reload after redirect
    window.location.href = '/api/logout';
  };

  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const handleSignIn = () => {
    setShowRoleSelect(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthCare Portal</span>
            {user && user.role && (
              <span className="ml-4 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                Logged in as <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                {!showRoleSelect ? (
                  <Button
                    data-testid="button-login"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleSignIn}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleRoleLogin("patient")} className="bg-blue-500 hover:bg-blue-600 text-white">Patient</Button>
                    <Button onClick={() => handleRoleLogin("doctor")} className="bg-green-500 hover:bg-green-600 text-white">Doctor</Button>
                    <Button onClick={() => handleRoleLogin("admin")} className="bg-gray-700 hover:bg-gray-800 text-white">Admin</Button>
                  </div>
                )}
              </>
            ) : (
              <Button onClick={handleLogout} variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">Logout</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
              Your Health, <span className="text-red-500">Simplified</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Book appointments, access medical records, track vitals, and manage your family's health - all in one secure platform designed for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="lg" 
                    data-testid="button-get-started"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => handleRoleLogin("patient")}>
                    <User className="mr-2 h-4 w-4" />
                    As Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleLogin("doctor")}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    As Doctor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleLogin("admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    As Admin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-learn-more"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            Everything You Need for Better Healthcare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Easy Appointment Booking"
              description="Search doctors by specialty, view availability, and book appointments in just a few taps."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Digital Health Records"
              description="Access lab reports, prescriptions, and visit summaries anytime, anywhere."
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Track Your Vitals"
              description="Monitor blood pressure, glucose, heart rate, weight, and BMI with visual graphs."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Allergy Management"
              description="Store allergy information that's automatically shown to doctors during visits."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Family Profiles"
              description="Manage health records for your entire family from a single account."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Real-time Updates"
              description="Get instant notifications for appointments, new reports, and prescription updates."
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard
              icon={<Users className="h-8 w-8" />}
              title="For Patients"
              features={[
                "Book appointments online",
                "View all health records",
                "Track vitals & allergies",
                "Manage family profiles",
                "Digital payments"
              ]}
            />
            <RoleCard
              icon={<Stethoscope className="h-8 w-8" />}
              title="For Doctors"
              features={[
                "Manage appointments",
                "View patient history",
                "Create prescriptions",
                "Access lab reports",
                "Add visit notes"
              ]}
              highlighted
            />
            <RoleCard
              icon={<Shield className="h-8 w-8" />}
              title="For Admins"
              features={[
                "Manage doctors",
                "Configure schedules",
                "Handle billing",
                "Upload reports",
                "Monitor system"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of users who trust our platform for their healthcare needs.
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="lg" 
                variant="secondary"
                data-testid="button-cta-signup"
                className="bg-background text-primary hover:bg-muted"
              >
                Create Free Account
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleRoleLogin("patient")}>
                <User className="mr-2 h-4 w-4" />
                As Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleLogin("doctor")}>
                <UserCheck className="mr-2 h-4 w-4" />
                As Doctor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleLogin("admin")}>
                <Settings className="mr-2 h-4 w-4" />
                As Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>HealthCare Portal - Secure, Simple, Smart Healthcare Management</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow bg-card">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-lg bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function RoleCard({ 
  icon, 
  title, 
  features, 
  highlighted 
}: { 
  icon: React.ReactNode; 
  title: string; 
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={`${highlighted ? "border-primary border-2" : "border-border"} bg-card`}>
      <CardContent className="p-6">
        <div className={`w-16 h-16 rounded-xl ${highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} flex items-center justify-center mb-4 mx-auto`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-center mb-4 text-foreground">{title}</h3>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
