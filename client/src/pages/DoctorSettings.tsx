import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Settings,
  Clock,
  Bell,
  Stethoscope,
  Calendar,
  Users,
  MessageSquare,
  Shield,
  Save,
  RefreshCw
} from "lucide-react";

export default function DoctorSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Schedule Settings State
  const [scheduleSettings, setScheduleSettings] = useState({
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    appointmentDuration: "30", // minutes
    breakDuration: "15", // minutes
    bufferTime: "10", // minutes between appointments
    maxAppointmentsPerDay: "20",
    advanceBookingDays: "30",
    weekendAppointments: false,
    emergencySlots: true,
    onlineConsultations: true,
    homeVisits: false,
    autoConfirmAppointments: false,
    cancellationPolicy: "24_hours",
    reschedulePolicy: "same_day"
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    patientMessages: true,
    urgentAlerts: true,
    dailyScheduleSummary: true,
    weeklyReport: true,
    paymentNotifications: true,
    systemUpdates: false,
    reminderTiming: "60", // minutes before appointment
    followUpReminders: true,
    prescriptionReminders: true
  });

  // Consultation Settings State
  const [consultationSettings, setConsultationSettings] = useState({
    consultationFee: "150.00",
    followUpFee: "75.00",
    emergencyFee: "300.00",
    currency: "USD",
    paymentMethods: ["credit_card", "cash", "insurance"],
    telemedicineEnabled: true,
    videoConsultation: true,
    audioConsultation: true,
    chatConsultation: false,
    prescriptionTemplates: true,
    labOrderIntegration: true,
    referralSystem: true,
    patientNotes: true,
    medicalHistoryAccess: true,
    familyHistoryAccess: true
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "patients_only",
    contactInfoVisibility: "patients_only",
    scheduleVisibility: "public",
    reviewVisibility: "public",
    statisticsVisibility: "private",
    dataSharing: false,
    marketingEmails: false,
    researchParticipation: false,
    anonymizedData: true
  });

  // Fetch current doctor settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/doctor/settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/doctor/settings");
        return response.json();
      } catch (error) {
        // Return default settings if endpoint doesn't exist yet
        return {
          schedule: scheduleSettings,
          notifications: notificationSettings,
          consultation: consultationSettings,
          privacy: privacySettings
        };
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("PUT", "/api/doctor/settings", settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleScheduleSettingChange = (key: string, value: any) => {
    setScheduleSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConsultationSettingChange = (key: string, value: any) => {
    setConsultationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacySettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    const allSettings = {
      schedule: scheduleSettings,
      notifications: notificationSettings,
      consultation: consultationSettings,
      privacy: privacySettings
    };
    updateSettingsMutation.mutate(allSettings);
  };

  const handleResetToDefaults = () => {
    // Reset to default values
    setScheduleSettings({
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      appointmentDuration: "30",
      breakDuration: "15",
      bufferTime: "10",
      maxAppointmentsPerDay: "20",
      advanceBookingDays: "30",
      weekendAppointments: false,
      emergencySlots: true,
      onlineConsultations: true,
      homeVisits: false,
      autoConfirmAppointments: false,
      cancellationPolicy: "24_hours",
      reschedulePolicy: "same_day"
    });

    setNotificationSettings({
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      appointmentReminders: true,
      patientMessages: true,
      urgentAlerts: true,
      dailyScheduleSummary: true,
      weeklyReport: true,
      paymentNotifications: true,
      systemUpdates: false,
      reminderTiming: "60",
      followUpReminders: true,
      prescriptionReminders: true
    });

    setConsultationSettings({
      consultationFee: "150.00",
      followUpFee: "75.00",
      emergencyFee: "300.00",
      currency: "USD",
      paymentMethods: ["credit_card", "cash", "insurance"],
      telemedicineEnabled: true,
      videoConsultation: true,
      audioConsultation: true,
      chatConsultation: false,
      prescriptionTemplates: true,
      labOrderIntegration: true,
      referralSystem: true,
      patientNotes: true,
      medicalHistoryAccess: true,
      familyHistoryAccess: true
    });

    setPrivacySettings({
      profileVisibility: "patients_only",
      contactInfoVisibility: "patients_only",
      scheduleVisibility: "public",
      reviewVisibility: "public",
      statisticsVisibility: "private",
      dataSharing: false,
      marketingEmails: false,
      researchParticipation: false,
      anonymizedData: true
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
          <h1 className="text-3xl font-bold">Doctor Settings</h1>
          <p className="text-muted-foreground">Configure your practice preferences and settings</p>
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

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Consultation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours & Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={scheduleSettings.workingHoursStart}
                    onChange={(e) => handleScheduleSettingChange("workingHoursStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={scheduleSettings.workingHoursEnd}
                    onChange={(e) => handleScheduleSettingChange("workingHoursEnd", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDuration">Appointment Duration (minutes)</Label>
                  <Input
                    id="appointmentDuration"
                    type="number"
                    value={scheduleSettings.appointmentDuration}
                    onChange={(e) => handleScheduleSettingChange("appointmentDuration", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    value={scheduleSettings.breakDuration}
                    onChange={(e) => handleScheduleSettingChange("breakDuration", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={scheduleSettings.bufferTime}
                    onChange={(e) => handleScheduleSettingChange("bufferTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAppointmentsPerDay">Max Appointments Per Day</Label>
                  <Input
                    id="maxAppointmentsPerDay"
                    type="number"
                    value={scheduleSettings.maxAppointmentsPerDay}
                    onChange={(e) => handleScheduleSettingChange("maxAppointmentsPerDay", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceBookingDays">Advance Booking (days)</Label>
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    value={scheduleSettings.advanceBookingDays}
                    onChange={(e) => handleScheduleSettingChange("advanceBookingDays", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekend Appointments</Label>
                    <p className="text-sm text-muted-foreground">Allow appointments on weekends</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.weekendAppointments}
                    onCheckedChange={(checked) => handleScheduleSettingChange("weekendAppointments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emergency Slots</Label>
                    <p className="text-sm text-muted-foreground">Reserve slots for emergency consultations</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.emergencySlots}
                    onCheckedChange={(checked) => handleScheduleSettingChange("emergencySlots", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Online Consultations</Label>
                    <p className="text-sm text-muted-foreground">Enable telemedicine consultations</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.onlineConsultations}
                    onCheckedChange={(checked) => handleScheduleSettingChange("onlineConsultations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Home Visits</Label>
                    <p className="text-sm text-muted-foreground">Offer home visit services</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.homeVisits}
                    onCheckedChange={(checked) => handleScheduleSettingChange("homeVisits", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-confirm Appointments</Label>
                    <p className="text-sm text-muted-foreground">Automatically confirm new appointments</p>
                  </div>
                  <Switch
                    checked={scheduleSettings.autoConfirmAppointments}
                    onCheckedChange={(checked) => handleScheduleSettingChange("autoConfirmAppointments", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Select value={scheduleSettings.cancellationPolicy} onValueChange={(value) => handleScheduleSettingChange("cancellationPolicy", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_policy">No Policy</SelectItem>
                      <SelectItem value="same_day">Same Day Notice</SelectItem>
                      <SelectItem value="24_hours">24 Hours Notice</SelectItem>
                      <SelectItem value="48_hours">48 Hours Notice</SelectItem>
                      <SelectItem value="1_week">1 Week Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedulePolicy">Reschedule Policy</Label>
                  <Select value={scheduleSettings.reschedulePolicy} onValueChange={(value) => handleScheduleSettingChange("reschedulePolicy", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_policy">No Policy</SelectItem>
                      <SelectItem value="same_day">Same Day</SelectItem>
                      <SelectItem value="24_hours">24 Hours Notice</SelectItem>
                      <SelectItem value="48_hours">48 Hours Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Consultation Fees & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    step="0.01"
                    value={consultationSettings.consultationFee}
                    onChange={(e) => handleConsultationSettingChange("consultationFee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpFee">Follow-up Fee</Label>
                  <Input
                    id="followUpFee"
                    type="number"
                    step="0.01"
                    value={consultationSettings.followUpFee}
                    onChange={(e) => handleConsultationSettingChange("followUpFee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyFee">Emergency Fee</Label>
                  <Input
                    id="emergencyFee"
                    type="number"
                    step="0.01"
                    value={consultationSettings.emergencyFee}
                    onChange={(e) => handleConsultationSettingChange("emergencyFee", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={consultationSettings.currency} onValueChange={(value) => handleConsultationSettingChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Consultation Types</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Video Consultation</Label>
                      <p className="text-sm text-muted-foreground">Enable video calls for consultations</p>
                    </div>
                    <Switch
                      checked={consultationSettings.videoConsultation}
                      onCheckedChange={(checked) => handleConsultationSettingChange("videoConsultation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audio Consultation</Label>
                      <p className="text-sm text-muted-foreground">Enable audio calls for consultations</p>
                    </div>
                    <Switch
                      checked={consultationSettings.audioConsultation}
                      onCheckedChange={(checked) => handleConsultationSettingChange("audioConsultation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chat Consultation</Label>
                      <p className="text-sm text-muted-foreground">Enable text chat for consultations</p>
                    </div>
                    <Switch
                      checked={consultationSettings.chatConsultation}
                      onCheckedChange={(checked) => handleConsultationSettingChange("chatConsultation", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Medical Features</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prescription Templates</Label>
                      <p className="text-sm text-muted-foreground">Use predefined prescription templates</p>
                    </div>
                    <Switch
                      checked={consultationSettings.prescriptionTemplates}
                      onCheckedChange={(checked) => handleConsultationSettingChange("prescriptionTemplates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lab Order Integration</Label>
                      <p className="text-sm text-muted-foreground">Integrate with lab ordering systems</p>
                    </div>
                    <Switch
                      checked={consultationSettings.labOrderIntegration}
                      onCheckedChange={(checked) => handleConsultationSettingChange("labOrderIntegration", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Referral System</Label>
                      <p className="text-sm text-muted-foreground">Enable patient referrals to specialists</p>
                    </div>
                    <Switch
                      checked={consultationSettings.referralSystem}
                      onCheckedChange={(checked) => handleConsultationSettingChange("referralSystem", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                      <Label>Patient Messages</Label>
                      <p className="text-sm text-muted-foreground">Receive messages from patients</p>
                    </div>
                    <Switch
                      checked={notificationSettings.patientMessages}
                      onCheckedChange={(checked) => handleNotificationSettingChange("patientMessages", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Urgent Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive urgent medical alerts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.urgentAlerts}
                      onCheckedChange={(checked) => handleNotificationSettingChange("urgentAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Schedule Summary</Label>
                      <p className="text-sm text-muted-foreground">Receive daily schedule summaries</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyScheduleSummary}
                      onCheckedChange={(checked) => handleNotificationSettingChange("dailyScheduleSummary", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly practice reports</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) => handleNotificationSettingChange("weeklyReport", checked)}
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
                Privacy & Visibility Settings
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
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="patients_only">Patients Only</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfoVisibility">Contact Information Visibility</Label>
                  <Select value={privacySettings.contactInfoVisibility} onValueChange={(value) => handlePrivacySettingChange("contactInfoVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="patients_only">Patients Only</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleVisibility">Schedule Visibility</Label>
                  <Select value={privacySettings.scheduleVisibility} onValueChange={(value) => handlePrivacySettingChange("scheduleVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Show available slots</SelectItem>
                      <SelectItem value="limited">Limited - Show general availability</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewVisibility">Review Visibility</Label>
                  <Select value={privacySettings.reviewVisibility} onValueChange={(value) => handlePrivacySettingChange("reviewVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Show all reviews</SelectItem>
                      <SelectItem value="verified_only">Verified Patients Only</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statisticsVisibility">Statistics Visibility</Label>
                  <Select value={privacySettings.statisticsVisibility} onValueChange={(value) => handlePrivacySettingChange("statisticsVisibility", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Show practice statistics</SelectItem>
                      <SelectItem value="limited">Limited - Show basic stats</SelectItem>
                      <SelectItem value="private">Private - Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Data Sharing Preferences</Label>
                <div className="space-y-3">
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
      </Tabs>
    </div>
  );
}