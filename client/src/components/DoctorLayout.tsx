import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  LogOut,
  User,
  Users,
  Settings,
  Pill,
  Clock,
  Stethoscope,
  FileText,
  BarChart3,
  MessageSquare,
  Heart
} from "lucide-react";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { href: "/doctor/patients", icon: Users, label: "Patients" },
  { href: "/doctor/prescriptions", icon: Pill, label: "Prescriptions" },
  { href: "/doctor/schedule", icon: Clock, label: "Schedule" },
  { href: "/doctor/document-review", icon: FileText, label: "Document Review" },
  { href: "/doctor/reports", icon: BarChart3, label: "Reports" },
  { href: "/doctor/messages", icon: MessageSquare, label: "Messages" },
];

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    console.log("Doctor logout button clicked");
    // Clear the query cache before logout
    queryClient.clear();
    console.log("Query cache cleared");
    // Redirect directly to the logout endpoint
    console.log("Redirecting to logout endpoint");
    window.location.href = '/api/logout';
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b bg-background">
            <Link href="/doctor">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-foreground bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    HealthConnect
                  </span>
                  <span className="text-sm text-muted-foreground">Doctor Portal</span>
                </div>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location === item.href ||
                      (item.href !== "/doctor" && location.startsWith(item.href));
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/doctor/profile">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background shadow-sm h-16">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-red-100 text-red-500 text-sm">
                    {user?.firstName?.[0] || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <span className="font-medium text-foreground">
                    Dr. {user?.firstName} {user?.lastName}
                  </span>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}