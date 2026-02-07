import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import NotificationsDropdown from "./NotificationsDropdown";
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
import { Home, Calendar, FileText, User, Users, TestTube, CreditCard, LogOut, Search, Heart, MessageSquare } from "lucide-react";

interface PatientLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/appointments", icon: Calendar, label: "Appointments" },
  { href: "/records", icon: FileText, label: "Records" },
  { href: "/family", icon: Users, label: "Family" },
  { href: "/lab-tests", icon: TestTube, label: "Lab Tests" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function PatientLayout({ children }: PatientLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logout button clicked");
    // Clear the query cache before logout
    queryClient.clear();
    console.log("Query cache cleared");
    // Redirect directly to the logout endpoint
    console.log("Redirecting to logout endpoint");
    window.location.href = '/api/logout';
  };

  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b bg-background">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-foreground bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    HealthConnect
                  </span>
                  <span className="text-sm text-muted-foreground">Patient Portal</span>
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
                      (item.href !== "/" && location.startsWith(item.href));
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
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Open global search"
                aria-keyshortcuts="Control+K"
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline">Search</span>
              </button>
              <NotificationsDropdown />
              <ThemeToggle />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-red-100 text-red-500 text-sm">
                    {user?.firstName?.[0] || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <span className="font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/50" role="main" aria-label="Main content" id="main-content">
            {children}
          </main>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}