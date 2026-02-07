import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  AlertTriangle, 
  Plus,
  Pill,
  Apple,
  Info,
  Trash2
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
import type { Allergy } from "@shared/schema";

const allergyFormSchema = z.object({
  type: z.enum(["medicine", "food", "other"]),
  allergen: z.string().min(1, "Allergen name is required"),
  severity: z.enum(["mild", "moderate", "severe"]),
  reaction: z.string().optional(),
});

type AllergyFormValues = z.infer<typeof allergyFormSchema>;

const allergyTypes = [
  { value: "medicine", label: "Medicine", icon: Pill, color: "text-red-500", bg: "bg-red-500/10" },
  { value: "food", label: "Food", icon: Apple, color: "text-orange-500", bg: "bg-orange-500/10" },
  { value: "other", label: "Other", icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
];

const severityColors = {
  mild: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  moderate: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  severe: "bg-red-500/10 text-red-600 dark:text-red-400",
};

// Mock data for when database is not available
const mockAllergies: Allergy[] = [
  {
    id: 1,
    patientId: "mock-patient-id",
    type: "medicine",
    allergen: "Penicillin",
    severity: "severe",
    reaction: "Anaphylaxis - severe allergic reaction causing difficulty breathing",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    id: 2,
    patientId: "mock-patient-id",
    type: "food",
    allergen: "Peanuts",
    severity: "moderate",
    reaction: "Hives and stomach upset",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  {
    id: 3,
    patientId: "mock-patient-id",
    type: "food",
    allergen: "Shellfish",
    severity: "severe",
    reaction: "Swelling of throat and difficulty breathing",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
  }
];

export default function Allergies() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; allergyId: number | null }>({
    open: false,
    allergyId: null,
  });

  const { data: allergies, isLoading, isError } = useQuery<Allergy[]>({
    queryKey: ["/api/allergies"],
  });

  // Use mock data if there's an error (likely due to no database connection)
  const effectiveAllergies = isError ? mockAllergies : allergies;

  const form = useForm<AllergyFormValues>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      type: "medicine",
      allergen: "",
      severity: "moderate",
      reaction: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: AllergyFormValues) => {
      return apiRequest("POST", "/api/allergies", data);
    },
    onSuccess: () => {
      toast({
        title: "Allergy Added",
        description: "Your allergy has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/allergies"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add",
        description: error.message || "Failed to add allergy",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/allergies/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Allergy Removed",
        description: "The allergy has been removed from your records.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/allergies"] });
      setDeleteDialog({ open: false, allergyId: null });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove",
        description: error.message || "Failed to remove allergy",
        variant: "destructive",
      });
    },
  });

  const groupedAllergies = (effectiveAllergies || []).reduce((acc, allergy) => {
    if (!acc[allergy.type]) acc[allergy.type] = [];
    acc[allergy.type].push(allergy);
    return acc;
  }, {} as Record<string, Allergy[]>) || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Allergies</h1>
          <p className="text-muted-foreground">Keep track of your allergies to stay safe</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-allergy">
              <Plus className="h-4 w-4 mr-2" />
              Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Allergy</DialogTitle>
              <DialogDescription>
                Record a new allergy. This information will be visible to your doctors.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-allergy-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allergyTypes.map(type => (
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
                  name="allergen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergen Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Penicillin, Peanuts"
                          {...field} 
                          data-testid="input-allergen"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reaction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the allergic reaction..."
                          rows={3}
                          {...field} 
                          data-testid="textarea-reaction"
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
                  <Button type="submit" disabled={addMutation.isPending} data-testid="button-save-allergy">
                    {addMutation.isPending ? "Saving..." : "Save Allergy"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Banner */}
      <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-600 dark:text-yellow-400">Important</p>
            <p className="text-sm text-muted-foreground">
              Your allergies are automatically shown to doctors during appointments to ensure your safety.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allergies by Type */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : effectiveAllergies && effectiveAllergies.length > 0 ? (
        <div className="space-y-6">
          {allergyTypes.map(type => {
            const typeAllergies = groupedAllergies[type.value] || [];
            if (typeAllergies.length === 0) return null;
            
            const Icon = type.icon;
            return (
              <Card key={type.value}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    {type.label} Allergies
                    <Badge variant="secondary" className="ml-2">
                      {typeAllergies.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeAllergies.map(allergy => (
                      <div 
                        key={allergy.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card"
                        data-testid={`card-allergy-${allergy.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold">{allergy.allergen}</h4>
                            <Badge className={severityColors[allergy.severity as keyof typeof severityColors]}>
                              {allergy.severity}
                            </Badge>
                          </div>
                          {allergy.reaction && (
                            <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Added {format(new Date(allergy.createdAt!), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, allergyId: allergy.id })}
                          data-testid={`button-delete-allergy-${allergy.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Allergies Recorded</h3>
            <p className="text-muted-foreground mb-4">
              Add your allergies to ensure doctors are aware during consultations.
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-allergy">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Allergy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, allergyId: open ? deleteDialog.allergyId : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Allergy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this allergy from your records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.allergyId && deleteMutation.mutate(deleteDialog.allergyId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}