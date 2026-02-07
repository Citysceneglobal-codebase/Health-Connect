import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Mail, Phone, Building2, Shield, FileText, Calendar, Clock, ShieldCheck } from "lucide-react";

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Admin data initialized with user data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "Admin",
    lastName: user?.lastName || "User",
    email: user?.email || "admin@hospital.com",
    phone: user?.phone || "+1 (555) 777-8888",
    position: "System Administrator",
    department: "IT Department",
    permissions: "Full Access",
    bio: `Administrator responsible for managing the healthcare portal system, user accounts, and ensuring smooth operation of all platform features.`
  });

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "Admin",
        lastName: user.lastName || "User",
        email: user.email || "",
        phone: user.phone || "",
        position: "System Administrator",
        department: "IT Department",
        permissions: "Full Access",
        bio: `Administrator ${user.firstName || ""} ${user.lastName || ""} is responsible for managing the healthcare portal system and ensuring smooth operation.`
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest("PATCH", "/api/admin/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </span>
            </div>
            {isEditing && (
              <Button variant="outline" size="sm" className="hover:bg-blue-50">
                Change Photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Administrative Information */}
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrative Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              ) : (
                <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Position
                </Label>
                {isEditing ? (
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.position}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Department
                </Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.department}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissions" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Permissions
              </Label>
              {isEditing ? (
                <Input
                  id="permissions"
                  value={profileData.permissions}
                  onChange={(e) => handleChange("permissions", e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              ) : (
                <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md">{profileData.permissions}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows={4}
                  className="border-blue-200 focus:border-blue-400"
                />
              ) : (
                <p className="text-muted-foreground py-2 px-3 bg-muted/50 rounded-md leading-relaxed">{profileData.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="mt-8 shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Last Login</h3>
              </div>
              <p className="text-muted-foreground text-sm">Today, 9:30 AM</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Account Created</h3>
              </div>
              <p className="text-muted-foreground text-sm">January 15, 2023</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-purple-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Security Level</h3>
              </div>
              <p className="text-muted-foreground text-sm">Level 5 (Highest)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}