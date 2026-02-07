import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Settings,
  Bell,
  Shield,
  User,
  Save,
  RefreshCw
} from "lucide-react";

export default function PatientSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    labResults: true,
    prescriptionReminders: true,
    paymentNotifications: true,
    healthTips: false,
    newsletter: false,
    reminderTiming: "60" // minutes before appointment
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private",
    medicalHistoryVisibility: "doctors_only",
    familyAccess: true,
    dataSharing: false,
    marketingEmails: false,
    researchParticipation: false,
    anonymizedData: true
  });

  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    theme: "system",
    twoFactorEnabled: false,
    emailVerified: true
  });

  // Fetch current patient settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/patient/settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/patient/settings");
        return response.json();
      } catch (error) {
        // Return default settings if endpoint doesn't exist yet
        return {
          notifications: notificationSettings,
          privacy: privacySettings,
          account: accountSettings
        };
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("PUT", "/api/patient/settings", settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleNotificationSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacySettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountSettingChange = (key: string, value: any) => {
    setAccountSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    const allSettings = {
      notifications: notificationSettings,
      privacy: privacySettings,
      account: accountSettings
    };
    updateSettingsMutation.mutate(allSettings);
  };

  const handleResetToDefaults = () => {
    // Reset to default values
    setNotificationSettings({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      appointmentReminders: true,
      labResults: true,
      prescriptionReminders: true,
      paymentNotifications: true,
      healthTips: false,
      newsletter: false,
      reminderTiming: "60"
    });

    setPrivacySettings({
      profileVisibility: "private",
      medicalHistoryVisibility: "doctors_only",
      familyAccess: true,
      dataSharing: false,
      marketingEmails: false,
      researchParticipation: false,
      anonymizedData: true
    });

    setAccountSettings({
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      theme: "system",
      twoFactorEnabled: false,
      emailVerified: true
    });

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reminderTiming">Appointment Reminder Timing (minutes before)</Label>
                <Input
                  id="reminderTiming"
                  type="number"
                  value={notificationSettings.reminderTiming}
                  onChange={(e) => handleNotificationSettingChange("reminderTiming", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Notification Channels</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications on mobile devices</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("pushNotifications", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Alert Types</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => handleNotificationSettingChange("appointmentReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lab Results</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when lab results are available</p>
                    </div>
                    <Switch
                      checked={notificationSettings.labResults}
                      onCheckedChange={(checked) => handleNotificationSettingChange("labResults", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prescription Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for prescription refills</p>
                    </div>
                    <Switch
                      checked={notificationSettings.prescriptionReminders}
                      onCheckedChange={(checked) => handleNotificationSettingChange("prescriptionReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive payment and billing notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("paymentNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Health Tips</Label>
                      <p className="text-sm text-muted-foreground">Receive health tips and wellness advice</p>
                    </div>
                    <Switch
                      checked={notificationSettings.healthTips}
                      onCheckedChange={(checked) => handleNotificationSettingChange("healthTips", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Newsletter</Label>
                      <p className="text-sm text-muted-foreground">Receive newsletter and updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newsletter}
                      onCheckedChange={(checked) => handleNotificationSettingChange("newsletter", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select value={privacySettings.profileVisibility} onValueChange={(value) => handlePrivacySettingChange("profileVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view basic info</SelectItem>
                      <SelectItem value="doctors_only">Doctors Only</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistoryVisibility">Medical History Visibility</Label>
                  <Select value={privacySettings.medicalHistoryVisibility} onValueChange={(value) => handlePrivacySettingChange("medicalHistoryVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctors_only">Doctors Only</SelectItem>
                      <SelectItem value="family_doctors">Family Members & Doctors</SelectItem>
                      <SelectItem value="private">Private - Only Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Data Sharing Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Family Access</Label>
                      <p className="text-sm text-muted-foreground">Allow family members to view your health data</p>
                    </div>
                    <Switch
                      checked={privacySettings.familyAccess}
                      onCheckedChange={(checked) => handlePrivacySettingChange("familyAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing for Research</Label>
                      <p className="text-sm text-muted-foreground">Share anonymized data for medical research</p>
                    </div>
                    <Switch
                      checked={privacySettings.dataSharing}
                      onCheckedChange={(checked) => handlePrivacySettingChange("dataSharing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => handlePrivacySettingChange("marketingEmails", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Research Participation</Label>
                      <p className="text-sm text-muted-foreground">Participate in medical research studies</p>
                    </div>
                    <Switch
                      checked={privacySettings.researchParticipation}
                      onCheckedChange={(checked) => handlePrivacySettingChange("researchParticipation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Anonymized Data Usage</Label>
                      <p className="text-sm text-muted-foreground">Allow use of anonymized data for analytics</p>
                    </div>
                    <Switch
                      checked={privacySettings.anonymizedData}
                      onCheckedChange={(checked) => handlePrivacySettingChange("anonymizedData", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={accountSettings.language} onValueChange={(value) => handleAccountSettingChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={accountSettings.timezone} onValueChange={(value) => handleAccountSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={accountSettings.dateFormat} onValueChange={(value) => handleAccountSettingChange("dateFormat", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={accountSettings.theme} onValueChange={(value) => handleAccountSettingChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Security Settings</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={accountSettings.twoFactorEnabled}
                      onCheckedChange={(checked) => handleAccountSettingChange("twoFactorEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verified</Label>
                      <p className="text-sm text-muted-foreground">Your email address has been verified</p>
                    </div>
                    <Switch
                      checked={accountSettings.emailVerified}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}