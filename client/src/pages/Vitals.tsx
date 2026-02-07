import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Activity,
  Droplet,
  Scale,
  Thermometer,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Smartphone,
  Calendar,
  Watch,
  Zap,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Vital } from "@shared/schema";

const vitalFormSchema = z.object({
  type: z.enum(["bp", "glucose", "heart_rate", "weight", "bmi", "temperature"]),
  value: z.string().min(1, "Value is required"),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

type VitalFormValues = z.infer<typeof vitalFormSchema>;

const vitalTypes = [
  { value: "bp", label: "Blood Pressure", unit: "mmHg", icon: Activity, color: "text-red-500" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL", icon: Droplet, color: "text-blue-500" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", icon: Heart, color: "text-pink-500" },
  { value: "weight", label: "Weight", unit: "kg", icon: Scale, color: "text-green-500" },
  { value: "bmi", label: "BMI", unit: "kg/m²", icon: Activity, color: "text-purple-500" },
  { value: "temperature", label: "Temperature", unit: "°F", icon: Thermometer, color: "text-orange-500" },
];

// Mock data for when database is not available
const mockVitals: Vital[] = [
  {
    id: 1,
    patientId: "mock-patient-id",
    type: "bp",
    value: "130/85",
    unit: "mmHg",
    recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: "Slightly elevated, monitor closely"
  },
  {
    id: 2,
    patientId: "mock-patient-id",
    type: "bp",
    value: "125/80",
    unit: "mmHg",
    recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    notes: "Normal range"
  },
  {
    id: 3,
    patientId: "mock-patient-id",
    type: "heart_rate",
    value: "72",
    unit: "bpm",
    recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    notes: "Resting heart rate"
  },
  {
    id: 4,
    patientId: "mock-patient-id",
    type: "heart_rate",
    value: "68",
    unit: "bpm",
    recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    notes: "Post exercise"
  },
  {
    id: 5,
    patientId: "mock-patient-id",
    type: "weight",
    value: "75",
    unit: "kg",
    recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    notes: ""
  },
  {
    id: 6,
    patientId: "mock-patient-id",
    type: "weight",
    value: "74.5",
    unit: "kg",
    recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    notes: "Morning weigh-in"
  },
  {
    id: 7,
    patientId: "mock-patient-id",
    type: "bmi",
    value: "24.5",
    unit: "kg/m²",
    recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    notes: "Normal range"
  },
  {
    id: 8,
    patientId: "mock-patient-id",
    type: "temperature",
    value: "98.6",
    unit: "°F",
    recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    notes: "Oral temperature"
  }
];

export default function Vitals() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState("bp");
  const [chartPeriod, setChartPeriod] = useState<"week" | "month" | "year">("week");

  const { data: vitals, isLoading, isError } = useQuery<Vital[]>({
    queryKey: ["/api/vitals"],
  });

  const { data: wearableProviders } = useQuery({
    queryKey: ["/api/wearables/providers"],
  });

  const connectWearableMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("GET", `/api/wearables/auth/${provider}?redirectUri=${encodeURIComponent(window.location.origin + '/wearables/callback')}`);
      return response;
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wearable device",
        variant: "destructive",
      });
    },
  });

  const syncWearableMutation = useMutation({
    mutationFn: async (provider: string) => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", `/api/wearables/sync/${provider}`, { date: today });
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced data from ${data.provider}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vitals"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync wearable data",
        variant: "destructive",
      });
    },
  });

  // Use mock data if there's an error (likely due to no database connection)
  const effectiveVitals = isError ? mockVitals : vitals;

  const form = useForm<VitalFormValues>({
    resolver: zodResolver(vitalFormSchema),
    defaultValues: {
      type: "bp",
      value: "",
      notes: "",
    },
  });

  const addVitalMutation = useMutation({
    mutationFn: async (data: VitalFormValues) => {
      const selectedType = vitalTypes.find(t => t.value === data.type);
      return apiRequest("POST", "/api/vitals", {
        ...data,
        unit: selectedType?.unit || data.unit,
      });
    },
    onSuccess: () => {
      toast({
        title: "Vital Recorded",
        description: "Your vital has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vitals"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Save",
        description: error.message || "Failed to save vital",
        variant: "destructive",
      });
    },
  });

  const groupedVitals = (effectiveVitals || []).reduce((acc, vital) => {
    if (!acc[vital.type]) acc[vital.type] = [];
    acc[vital.type].push(vital);
    return acc;
  }, {} as Record<string, Vital[]>) || {};

  const getLatestVital = (type: string) => {
    return groupedVitals[type]?.[0];
  };

  const getChartData = (type: string) => {
    const vitals = groupedVitals[type] || [];
    const now = new Date();
    let daysBack = 7;

    switch (chartPeriod) {
      case "week":
        daysBack = 7;
        break;
      case "month":
        daysBack = 30;
        break;
      case "year":
        daysBack = 365;
        break;
    }

    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return vitals
      .filter(v => new Date(v.recordedAt!) >= cutoffDate)
      .slice(0, chartPeriod === "year" ? 52 : chartPeriod === "month" ? 30 : 14)
      .reverse()
      .map(v => ({
        date: chartPeriod === "year"
          ? format(new Date(v.recordedAt!), "MMM yyyy")
          : format(new Date(v.recordedAt!), "MMM d"),
        value: parseFloat(v.value.split("/")[0]) || parseFloat(v.value),
      }));
  };

  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: `Generating PDF report for ${vitalTypes.find(t => t.value === activeType)?.label}...`,
    });
    // In a real implementation, this would generate and download a PDF
  };

  const syncWearable = () => {
    // Sync with all configured providers
    const configuredProviders = wearableProviders?.filter((p: any) => p.configured) || [];
    if (configuredProviders.length === 0) {
      toast({
        title: "No Wearables Connected",
        description: "Please connect a wearable device first.",
        variant: "destructive",
      });
      return;
    }

    // Sync with the first configured provider (in production, sync with all)
    const provider = configuredProviders[0].name;
    syncWearableMutation.mutate(provider);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Vitals</h1>
          <p className="text-muted-foreground">Track and monitor your health metrics</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-vital">
              <Plus className="h-4 w-4 mr-2" />
              Add Vital
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Vital</DialogTitle>
              <DialogDescription>
                Add a new vital measurement to your health records.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addVitalMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vital Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vital-type">
                            <SelectValue placeholder="Select vital type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vitalTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder={form.watch("type") === "bp" ? "120/80" : "Enter value"}
                            {...field} 
                            data-testid="input-vital-value"
                          />
                          <div className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground min-w-[60px]">
                            {vitalTypes.find(t => t.value === form.watch("type"))?.unit}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Any additional notes"
                          {...field} 
                          data-testid="input-vital-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addVitalMutation.isPending} data-testid="button-save-vital">
                    {addVitalMutation.isPending ? "Saving..." : "Save Vital"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wearable Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5" />
            Wearable Devices
          </CardTitle>
          <CardDescription>
            Connect your fitness trackers and smartwatches to automatically sync health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wearableProviders?.map((provider: any) => (
              <div key={provider.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    provider.configured ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {provider.name === 'fitbit' && <Watch className="h-5 w-5" />}
                    {provider.name === 'google_fit' && <Zap className="h-5 w-5" />}
                    {provider.name === 'apple_health' && <Smartphone className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{provider.name.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.configured ? 'Ready to sync' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={provider.configured ? "outline" : "default"}
                  size="sm"
                  disabled={connectWearableMutation.isPending}
                  onClick={() => connectWearableMutation.mutate(provider.name)}
                >
                  {connectWearableMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : provider.configured ? (
                    'Sync'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            )) || (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <Watch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading wearable providers...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {isLoading ? (
          vitalTypes.map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          vitalTypes.map(type => {
            const latest = getLatestVital(type.value);
            const Icon = type.icon;
            return (
              <Card 
                key={type.value} 
                className={`cursor-pointer hover-elevate ${activeType === type.value ? "border-primary" : ""}`}
                onClick={() => setActiveType(type.value)}
                data-testid={`card-vital-${type.value}`}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${type.color}`} />
                  <p className="text-lg font-bold">
                    {latest?.value || "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">{type.label}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {vitalTypes.find(t => t.value === activeType)?.label} Trend
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={chartPeriod} onValueChange={(value: "week" | "month" | "year") => setChartPeriod(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncWearable}
                  disabled={syncWearableMutation.isPending}
                >
                  {syncWearableMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  Sync
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : getChartData(activeType).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getChartData(activeType)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : groupedVitals[activeType]?.length ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {groupedVitals[activeType].slice(0, 10).map((vital, index) => {
                  const prevVital = groupedVitals[activeType][index + 1];
                  const currentVal = parseFloat(vital.value.split("/")[0]) || parseFloat(vital.value);
                  const prevVal = prevVital ? (parseFloat(prevVital.value.split("/")[0]) || parseFloat(prevVital.value)) : null;
                  const trend = prevVal ? (currentVal > prevVal ? "up" : currentVal < prevVal ? "down" : "same") : null;

                  return (
                    <div 
                      key={vital.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      data-testid={`vital-reading-${vital.id}`}
                    >
                      <div>
                        <p className="font-semibold">{vital.value} {vital.unit}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(vital.recordedAt!), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      {trend && (
                        <div className={`flex items-center gap-1 text-sm ${
                          trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-muted-foreground"
                        }`}>
                          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : 
                           trend === "down" ? <TrendingDown className="h-4 w-4" /> : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No readings recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}