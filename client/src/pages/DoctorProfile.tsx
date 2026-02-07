import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, DollarSign, Award, MapPin, Phone, Mail, Save, Upload, Shield, Smartphone, Key, AlertTriangle, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DoctorSchedule } from "@shared/schema";

export default function DoctorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    clinicAddress: "",
    consultationFee: "",
    isAvailable: true,
    licenseNumber: "",
    languages: [] as string[],
    emergencyContact: "",
    website: ""
  });

  // Schedule data
  const [scheduleData, setScheduleData] = useState({
    monday: { start: "09:00", end: "17:00", active: true },
    tuesday: { start: "09:00", end: "17:00", active: true },
    wednesday: { start: "09:00", end: "17:00", active: true },
    thursday: { start: "09:00", end: "17:00", active: true },
    friday: { start: "09:00", end: "17:00", active: true },
    saturday: { start: "10:00", end: "14:00", active: false },
    sunday: { start: "10:00", end: "14:00", active: false }
  });

  // MFA data
  const [mfaCode, setMfaCode] = useState("");
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<'totp' | 'sms' | 'hardware'>('totp');

  // Fetch doctor data
  const { data: doctorData, isLoading } = useQuery({
    queryKey: ["/api/doctor/profile"],
    enabled: !!user,
  });

  // Fetch doctor schedules
  const { data: schedules } = useQuery<DoctorSchedule[]>({
    queryKey: ["/api/doctor-schedules"],
    enabled: !!user,
  });

  // Fetch MFA status
  const { data: mfaStatus } = useQuery({
    queryKey: ["/api/mfa/status"],
    enabled: !!user,
  });

  // MFA mutations
  const setupMfaMutation = useMutation({
    mutationFn: async (data: { method: 'totp' | 'sms' | 'hardware'; phoneNumber?: string }) => {
      return apiRequest("POST", "/api/mfa/setup", data);
    },
    onSuccess: (data) => {
      toast({
        title: "MFA Setup Initiated",
        description: data.message || "MFA setup has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mfa/status"] });
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup MFA",
        variant: "destructive",
      });
    },
  });

  const verifyMfaMutation = useMutation({
    mutationFn: async (data: { code: string; method: string }) => {
      return apiRequest("POST", "/api/mfa/verify", data);
    },
    onSuccess: (data) => {
      toast({
        title: "MFA Verified",
        description: data.message || "MFA has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mfa/status"] });
      setMfaCode("");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "MFA verification failed",
        variant: "destructive",
      });
    },
  });

  const disableMfaMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/mfa/disable"),
    onSuccess: () => {
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mfa/status"] });
    },
    onError: (error) => {
      toast({
        title: "Disable Failed",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest("PATCH", "/api/doctor/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/profile"] });
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

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: typeof scheduleData) => {
      return apiRequest("PATCH", "/api/doctor/schedule", data);
    },
    onSuccess: () => {
      toast({
        title: "Schedule Updated",
        description: "Your schedule has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-schedules"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  // Initialize profile data
  useEffect(() => {
    if (user && doctorData) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: doctorData.specialty || "",
        qualification: doctorData.qualification || "",
        experience: doctorData.experience?.toString() || "",
        bio: doctorData.bio || "",
        clinicAddress: "",
        consultationFee: doctorData.consultationFee || "",
        isAvailable: doctorData.isAvailable ?? true,
        licenseNumber: "",
        languages: [],
        emergencyContact: "",
        website: ""
      });
    }
  }, [user, doctorData]);

  // Initialize schedule data
  useEffect(() => {
    if (schedules) {
      const newScheduleData = { ...scheduleData };
      schedules.forEach(schedule => {
        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][schedule.dayOfWeek];
        if (dayName) {
          newScheduleData[dayName as keyof typeof scheduleData] = {
            start: schedule.startTime,
            end: schedule.endTime,
            active: schedule.isActive
          };
        }
      });
      setScheduleData(newScheduleData);
    }
  }, [schedules]);

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleScheduleSave = () => {
    updateScheduleMutation.mutate(scheduleData);
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof scheduleData], [field]: value }
    }));
  };

  const switchDoctorAccount = (doctorId: string) => {
    // Set the devRole cookie to switch accounts
    document.cookie = `devRole=${doctorId}; path=/; max-age=86400`;
    // Reload the page to apply the new account
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Profile Management</h1>
          <p className="text-muted-foreground">Manage your professional profile, schedule, and settings</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "profile" && (
            <Button
              onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              disabled={updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          )}
          {activeTab === "schedule" && (
            <Button
              onClick={handleScheduleSave}
              disabled={updateScheduleMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="mb-8 shadow-xl bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-slate-900 dark:to-green-950 border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-2xl font-bold">
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Dr. {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-muted-foreground text-xl font-medium mt-1">{profileData.specialization}</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{profileData.qualification}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{profileData.experience} years experience</span>
                </div>
                <Badge variant={profileData.isAvailable ? "default" : "secondary"} className="px-3 py-1">
                  {profileData.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <DollarSign className="h-6 w-6" />
                  {profileData.consultationFee}
                </div>
                <p className="text-sm opacity-90">Consultation Fee</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">{profileData.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">{profileData.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{profileData.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{profileData.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.specialization}
                      onChange={(e) => handleProfileChange("specialization", e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground py-2">{profileData.specialization}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.qualification}
                      onChange={(e) => handleProfileChange("qualification", e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground py-2">{profileData.qualification}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.experience}
                      onChange={(e) => handleProfileChange("experience", e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground py-2">{profileData.experience} years</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.consultationFee}
                      onChange={(e) => handleProfileChange("consultationFee", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{profileData.consultationFee}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground py-2">{profileData.bio}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="available">Available for appointments</Label>
                  <Switch
                    id="available"
                    checked={profileData.isAvailable}
                    onCheckedChange={(checked) => handleProfileChange("isAvailable", checked)}
                    disabled={!isEditing}
                  />
                </div>
                <Badge variant={profileData.isAvailable ? "default" : "secondary"}>
                  {profileData.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scheduleData).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <h4 className="font-medium capitalize">{day}</h4>
                      </div>
                      <Switch
                        checked={schedule.active}
                        onCheckedChange={(checked) => handleScheduleChange(day, "active", checked)}
                      />
                    </div>
                    {schedule.active && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleScheduleChange(day, "start", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleScheduleChange(day, "end", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                    <Badge variant={schedule.active ? "default" : "secondary"}>
                      {schedule.active ? `${schedule.start} - ${schedule.end}` : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Factor Authentication (MFA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with multi-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MFA Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {mfaStatus?.enabled ? (
                    <Shield className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <h4 className="font-medium">
                      {mfaStatus?.enabled ? "MFA Enabled" : "MFA Not Enabled"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {mfaStatus?.enabled
                        ? "Your account is protected with multi-factor authentication"
                        : "Enable MFA to add an extra layer of security"
                      }
                    </p>
                  </div>
                </div>
                {mfaStatus?.enabled && (
                  <Button
                    variant="outline"
                    onClick={() => disableMfaMutation.mutate()}
                    disabled={disableMfaMutation.isPending}
                  >
                    Disable MFA
                  </Button>
                )}
              </div>

              {/* MFA Setup */}
              {!mfaStatus?.enabled && (
                <div className="space-y-4">
                  <h4 className="font-medium">Set up Multi-Factor Authentication</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                      className="cursor-pointer hover-elevate"
                      onClick={() => {
                        setSelectedMfaMethod('totp');
                        setupMfaMutation.mutate({ method: 'totp' });
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h5 className="font-medium">Authenticator App</h5>
                        <p className="text-sm text-muted-foreground">
                          Use Google Authenticator or similar apps
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover-elevate"
                      onClick={() => {
                        setSelectedMfaMethod('sms');
                        setupMfaMutation.mutate({
                          method: 'sms',
                          phoneNumber: profileData.phone
                        });
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Phone className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <h5 className="font-medium">SMS</h5>
                        <p className="text-sm text-muted-foreground">
                          Receive codes via text message
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover-elevate opacity-50">
                      <CardContent className="p-4 text-center">
                        <Key className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <h5 className="font-medium">Hardware Key</h5>
                        <p className="text-sm text-muted-foreground">
                          Use YubiKey or similar devices
                        </p>
                        <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* MFA Verification (when setting up) */}
              {setupMfaMutation.isSuccess && !mfaStatus?.enabled && (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-medium mb-2">Verify Your Setup</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the verification code to complete MFA setup.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter verification code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      onClick={() => verifyMfaMutation.mutate({
                        code: mfaCode,
                        method: selectedMfaMethod
                      })}
                      disabled={verifyMfaMutation.isPending || !mfaCode}
                    >
                      {verifyMfaMutation.isPending ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Login Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Timeout</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input
                  value={profileData.licenseNumber}
                  onChange={(e) => handleProfileChange("licenseNumber", e.target.value)}
                  placeholder="Medical license number"
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={profileData.emergencyContact}
                  onChange={(e) => handleProfileChange("emergencyContact", e.target.value)}
                  placeholder="Emergency contact information"
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={profileData.website}
                  onChange={(e) => handleProfileChange("website", e.target.value)}
                  placeholder="Personal or clinic website"
                />
              </div>
            </CardContent>
          </Card>

          {/* Development: Doctor Account Switcher */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Account Switcher (Development)</CardTitle>
              <CardDescription>
                Switch between different doctor accounts for testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => switchDoctorAccount('dev-doctor')}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dr. Dev User (General Medicine)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => switchDoctorAccount('doctor-1-user')}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dr. Sarah Smith (Cardiology)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => switchDoctorAccount('doctor-2-user')}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dr. Michael Johnson (Orthopedics)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => switchDoctorAccount('doctor-3-user')}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dr. Emily Brown (Dermatology)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Document Management</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your medical license, certifications, and other professional documents
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}