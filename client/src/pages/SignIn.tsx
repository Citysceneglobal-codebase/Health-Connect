import React from "react";
import { Heart, User, UserCheck, Settings } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function SignIn() {
  const [role, setRole] = React.useState("patient");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setError("");
      console.log("SignIn: handleLogin called with role:", role, "email:", email);
      // Simple mock validation for demo
      if (!email || !password) {
        console.log("SignIn: Email or password missing");
        setError("Email and password are required.");
        return;
      }
      // Demo credentials (replace with real backend call)
      const demoUsers = {
        patient: { email: "patient@demo.com", password: "patient123" },
        doctor: { email: "doctor@demo.com", password: "doctor123" },
        admin: { email: "admin@demo.com", password: "admin123" },
      };
      if (
        email === demoUsers[role as keyof typeof demoUsers].email &&
        password === demoUsers[role as keyof typeof demoUsers].password
      ) {
        console.log("SignIn: Credentials match, setting role to " + role);
        // Set the devRole cookie
        document.cookie = `devRole=${role}; path=/; max-age=900000`;
        // Refetch the user query to get updated data with new role
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }).then(() => {
          // Navigate to the appropriate dashboard
          const dashboardPath = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/";
          setLocation(dashboardPath);
        });
      } else {
        console.log("SignIn: Invalid credentials for role:", role);
        setError("Invalid credentials for " + role);
      }
    } catch (error) {
      console.error("SignIn: Error in handleLogin:", error);
      setError("An error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Select your role and enter credentials</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin} action="#">
          <div className="flex gap-2 justify-center mb-4">
            <button type="button" className={`px-4 py-2 rounded-lg flex items-center gap-2 ${role === "patient" ? "bg-red-500 text-white" : "bg-gray-100"}`} onClick={() => setRole("patient")}> <User className="h-5 w-5" /> Patient </button>
            <button type="button" className={`px-4 py-2 rounded-lg flex items-center gap-2 ${role === "doctor" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setRole("doctor")}> <UserCheck className="h-5 w-5" /> Doctor </button>
            <button type="button" className={`px-4 py-2 rounded-lg flex items-center gap-2 ${role === "admin" ? "bg-green-500 text-white" : "bg-gray-100"}`} onClick={() => setRole("admin")}> <Settings className="h-5 w-5" /> Admin </button>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="mt-1 block w-full px-3 py-2 border rounded-lg"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full px-3 py-2 border rounded-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className={`w-full py-3 rounded-lg font-semibold ${role === "patient" ? "bg-red-500" : role === "doctor" ? "bg-blue-500" : "bg-green-500"} text-white hover:opacity-90 transition-colors`}>Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}</button>
        </form>
      </div>
    </div>
  );
}