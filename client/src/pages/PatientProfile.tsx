import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Heart, Shield, Bell, Upload, Save, Calendar, Phone, Mail, MapPin, Activity, Camera, X } from "lucide-react";
import { format } from "date-fns";

export default function PatientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insuranceFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [insuranceCardFile, setInsuranceCardFile] = useState<File | null>(null);
  const [privacySettings, setPrivacySettings] = useState({
    shareHealthData: true,
    familyAccess: false,
    researchParticipation: false
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    height: "",
    weight: "",
    medicalConditions: "",
    currentMedications: "",
    allergies: "",
    insuranceProvider: "",
    insuranceNumber: "",
    preferredLanguage: "English",
    communicationPreferences: {
      email: true,
      sms: false,
      push: true,
    }
  });

  // Health data state
  const [healthData, setHealthData] = useState({
    bloodType: "O+",
    height: "5'10\" (178 cm)",
    weight: "165 lbs (75 kg)",
    bmi: "23.6",
    medicalConditions: "None",
    currentMedications: "None",
    allergies: "Penicillin",
    smokingStatus: "Non-smoker",
    alcoholConsumption: "Occasional",
    exerciseFrequency: "3-4 times per week"
  });

  // Fetch patient data
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["/api/patient/profile"],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest("PATCH", "/api/patient/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/profile"] });
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

  // Update health data mutation
  const updateHealthMutation = useMutation({
    mutationFn: async (data: typeof healthData) => {
      return apiRequest("PATCH", "/api/patient/health", data);
    },
    onSuccess: () => {
      toast({
        title: "Health Data Updated",
        description: "Your health information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update health data",
        variant: "destructive",
      });
    },
  });

  // Update privacy settings mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: typeof privacySettings) => {
      return apiRequest("PATCH", "/api/patient/privacy", data);
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update privacy settings",
        variant: "destructive",
      });
    },
  });

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      return apiRequest("POST", "/api/patient/upload-profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/profile"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  // Upload insurance card mutation
  const uploadInsuranceCardMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("insuranceCard", file);
      return apiRequest("POST", "/api/patient/upload-insurance-card", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Insurance Card Uploaded",
        description: "Your insurance card has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload insurance card",
        variant: "destructive",
      });
    },
  });

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        address: user.address || "",
        emergencyContact: "",
        bloodType: "",
        height: "",
        weight: "",
        medicalConditions: "",
        currentMedications: "",
        allergies: "",
        insuranceProvider: "",
        insuranceNumber: "",
        preferredLanguage: "English",
        communicationPreferences: {
          email: true,
          sms: false,
          push: true,
        }
      });
    }
  }, [user]);

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleHealthChange = (field: string, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const handleHealthSave = () => {
    updateHealthMutation.mutate(healthData);
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    const newSettings = { ...privacySettings, [field]: value };
    setPrivacySettings(newSettings);
    updatePrivacyMutation.mutate(newSettings);
  };

  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleInsuranceCardUpload = () => {
    insuranceFileInputRef.current?.click();
  };

  const handleInsuranceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type === 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select an image or PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setInsuranceCardFile(file);
      uploadInsuranceCardMutation.mutate(file);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Profile Management</h1>
          <p className="text-muted-foreground">Manage your personal and health information</p>
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
          {activeTab === "health" && (
            <Button
              onClick={handleHealthSave}
              disabled={updateHealthMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Health Data
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="mb-8 shadow-xl bg-gradient-to-r from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950 border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-muted-foreground text-xl font-medium mt-1">
                {calculateAge(profileData.dateOfBirth)} years old • {profileData.gender}
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    DOB: {profileData.dateOfBirth ? format(new Date(profileData.dateOfBirth), "MMM d, yyyy") : "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Blood Type: {healthData.bloodType}</span>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-slate-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Patient
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Activity className="h-5 w-5" />
                  BMI: {healthData.bmi}
                </div>
                <p className="text-sm opacity-90 mt-1">
                  {healthData.height.split(" ")[0]} • {healthData.weight.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="health">Health Info</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
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
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProfilePictureUpload}
                      disabled={uploadProfilePictureMutation.isPending}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadProfilePictureMutation.isPending ? "Uploading..." : "Change Photo"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Personal Details */}
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {profileData.dateOfBirth ? format(new Date(profileData.dateOfBirth), "MMM d, yyyy") : "Not set"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.gender}
                        onChange={(e) => handleProfileChange("gender", e.target.value)}
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">{profileData.gender}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.preferredLanguage}
                        onChange={(e) => handleProfileChange("preferredLanguage", e.target.value)}
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">{profileData.preferredLanguage}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={profileData.address}
                      onChange={(e) => handleProfileChange("address", e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <div className="flex items-start gap-2 py-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{profileData.address}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.emergencyContact}
                      onChange={(e) => handleProfileChange("emergencyContact", e.target.value)}
                      placeholder="Name - Phone number"
                    />
                  ) : (
                    <p className="text-muted-foreground py-2">{profileData.emergencyContact || "Not set"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Information Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="text-lg font-bold text-blue-600">{healthData.bloodType}</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-lg font-bold text-green-600">{healthData.height.split(" ")[0]}</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-lg font-bold text-orange-600">{healthData.weight.split(" ")[0]}</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="text-lg font-bold text-purple-600">{healthData.bmi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <Textarea
                    value={healthData.medicalConditions}
                    onChange={(e) => handleHealthChange("medicalConditions", e.target.value)}
                    rows={3}
                    placeholder="List any chronic conditions, past surgeries, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Medications</Label>
                  <Textarea
                    value={healthData.currentMedications}
                    onChange={(e) => handleHealthChange("currentMedications", e.target.value)}
                    rows={3}
                    placeholder="List all current medications and dosages"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Known Allergies</Label>
                <Textarea
                  value={healthData.allergies}
                  onChange={(e) => handleHealthChange("allergies", e.target.value)}
                  rows={2}
                  placeholder="List all known allergies (medications, foods, etc.)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Smoking Status</Label>
                  <Input
                    value={healthData.smokingStatus}
                    onChange={(e) => handleHealthChange("smokingStatus", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alcohol Consumption</Label>
                  <Input
                    value={healthData.alcoholConsumption}
                    onChange={(e) => handleHealthChange("alcoholConsumption", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exercise Frequency</Label>
                  <Input
                    value={healthData.exerciseFrequency}
                    onChange={(e) => handleHealthChange("exerciseFrequency", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Provider</Label>
                  <Input
                    value={profileData.insuranceProvider}
                    onChange={(e) => handleProfileChange("insuranceProvider", e.target.value)}
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Insurance Number</Label>
                  <Input
                    value={profileData.insuranceNumber}
                    onChange={(e) => handleProfileChange("insuranceNumber", e.target.value)}
                    placeholder="Policy or member ID number"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Insurance Card Upload</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a photo of your insurance card for quick reference during appointments.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsuranceCardUpload}
                  disabled={uploadInsuranceCardMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadInsuranceCardMutation.isPending ? "Uploading..." : "Upload Insurance Card"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive appointment reminders and updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.communicationPreferences.email}
                    onCheckedChange={(checked) =>
                      handleProfileChange("communicationPreferences", {
                        ...profileData.communicationPreferences,
                        email: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive text messages for urgent updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.communicationPreferences.sms}
                    onCheckedChange={(checked) =>
                      handleProfileChange("communicationPreferences", {
                        ...profileData.communicationPreferences,
                        sms: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications in the app</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.communicationPreferences.push}
                    onCheckedChange={(checked) =>
                      handleProfileChange("communicationPreferences", {
                        ...profileData.communicationPreferences,
                        push: checked
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share Health Data</p>
                    <p className="text-sm text-muted-foreground">Allow doctors to access your complete health history</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareHealthData}
                    onCheckedChange={(checked) => handlePrivacyChange("shareHealthData", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Family Access</p>
                    <p className="text-sm text-muted-foreground">Allow family members to view your basic health info</p>
                  </div>
                  <Switch
                    checked={privacySettings.familyAccess}
                    onCheckedChange={(checked) => handlePrivacyChange("familyAccess", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Research Participation</p>
                    <p className="text-sm text-muted-foreground">Opt-in to anonymized health research studies</p>
                  </div>
                  <Switch
                    checked={privacySettings.researchParticipation}
                    onCheckedChange={(checked) => handlePrivacyChange("researchParticipation", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}