import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Calendar,
  Settings,
  CheckCheck,
  Moon,
  Volume2,
  VolumeX,
  Timer,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Notification, NotificationPreference } from "@shared/schema";

export default function NotificationsDropdown() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: preferences } = useQuery<NotificationPreference[]>({
    queryKey: ["/api/notification-preferences"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => Promise.all(
      (notifications || [])
        .filter(n => !n.isRead)
        .map(n => apiRequest("PATCH", `/api/notifications/${n.id}/read`, {}))
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreference>) =>
      apiRequest("PATCH", "/api/notification-preferences", prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Notification preferences updated",
      });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const userPreferences = preferences?.[0];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_reminder":
        return <Calendar className="h-4 w-4" />;
      case "report_ready":
        return <FileText className="h-4 w-4" />;
      case "prescription_added":
        return <FileText className="h-4 w-4" />;
      case "payment_due":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment_reminder":
        return "text-blue-500";
      case "report_ready":
        return "text-green-500";
      case "prescription_added":
        return "text-purple-500";
      case "payment_due":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <ScrollArea className="h-80">
              <div className="space-y-1">
                {notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                    onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className={`${getNotificationColor(notification.type)} mt-0.5`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.createdAt!), "MMM d, h:mm a")}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          )}

          {notifications && notifications.length > 10 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-center">
                View all notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Enhanced Notification Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Advanced Notification Settings</DialogTitle>
            <DialogDescription>
              Customize how and when you receive notifications
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="types">Types</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-96 mt-4">
              <TabsContent value="channels" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser notifications and mobile alerts</p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={userPreferences?.pushEnabled ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ pushEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive detailed notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={userPreferences?.emailEnabled ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ emailEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="sms-notifications" className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Text messages for urgent notifications</p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={userPreferences?.smsEnabled ?? false}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ smsEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Notification Sound
                  </h4>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="gentle">Gentle</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label className="text-base font-medium">Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming appointments</p>
                      </div>
                    </div>
                    <Switch
                      checked={userPreferences?.appointmentReminders ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ appointmentReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <Label className="text-base font-medium">Report Notifications</Label>
                        <p className="text-sm text-muted-foreground">When lab reports and test results are ready</p>
                      </div>
                    </div>
                    <Switch
                      checked={userPreferences?.reportNotifications ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ reportNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label className="text-base font-medium">Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Bills, payments, and financial notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={userPreferences?.paymentReminders ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferencesMutation.mutate({ paymentReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      <div>
                        <Label className="text-base font-medium">Prescription Updates</Label>
                        <p className="text-sm text-muted-foreground">New prescriptions and medication changes</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-indigo-500" />
                      <div>
                        <Label className="text-base font-medium">General Announcements</Label>
                        <p className="text-sm text-muted-foreground">System updates and important announcements</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Quiet Hours
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set times when you don't want to receive notifications
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Start Time</Label>
                        <Input type="time" defaultValue="22:00" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">End Time</Label>
                        <Input type="time" defaultValue="08:00" className="mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Switch defaultChecked />
                      <Label className="text-sm">Enable quiet hours</Label>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Notification Frequency
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Appointment Reminders</Label>
                        <Select defaultValue="15min">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5min">5 minutes</SelectItem>
                            <SelectItem value="15min">15 minutes</SelectItem>
                            <SelectItem value="30min">30 minutes</SelectItem>
                            <SelectItem value="1hour">1 hour</SelectItem>
                            <SelectItem value="2hours">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Digest Summary</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Weekend Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Weekend Notifications</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Emergency Override</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}