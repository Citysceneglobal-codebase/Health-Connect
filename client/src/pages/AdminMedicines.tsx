import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Pill
} from "lucide-react";
import { Link } from "wouter";
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
import type { Medicine } from "@shared/schema";
import { mockMedicines } from "@/lib/mockData";

const medicineFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  genericName: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  description: z.string().optional(),
});

type MedicineFormValues = z.infer<typeof medicineFormSchema>;

export default function AdminMedicines() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Mock medicines data
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: "",
      genericName: "",
      category: "",
      manufacturer: "",
      dosageForm: "",
      strength: "",
      description: "",
    },
  });

  const handleAddMedicine = async (data: MedicineFormValues) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newMedicine: Medicine = {
      id: Math.max(...medicines.map(m => m.id)) + 1,
      name: data.name,
      genericName: data.genericName || "",
      category: data.category || "",
      manufacturer: data.manufacturer || "",
      dosageForm: data.dosageForm || "",
      strength: data.strength || "",
      description: data.description || "",
      createdAt: new Date()
    };

    setMedicines(prev => [...prev, newMedicine]);
    setDialogOpen(false);
    form.reset();

    toast({
      title: "Medicine Added",
      description: "The medicine has been added to the warehouse.",
    });
  };

  const handleEditMedicine = async () => {
    if (!selectedMedicine) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMedicines(prev => prev.map(medicine =>
      medicine.id === selectedMedicine.id ? { ...selectedMedicine, updatedAt: new Date() } : medicine
    ));

    setEditDialogOpen(false);
    setSelectedMedicine(null);

    toast({
      title: "Medicine Updated",
      description: "Medicine information has been updated successfully.",
    });
  };

  const handleDeleteMedicine = async () => {
    if (!selectedMedicine) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMedicines(prev => prev.filter(medicine => medicine.id !== selectedMedicine.id));
    setDeleteDialogOpen(false);
    setSelectedMedicine(null);

    toast({
      title: "Medicine Deleted",
      description: "Medicine has been removed from the warehouse.",
    });
  };

  const filteredMedicines = medicines?.filter(med => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(query) ||
      med.genericName?.toLowerCase().includes(query) ||
      med.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Medicine Warehouse</h1>
          <p className="text-muted-foreground">Manage the master list of medicines</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-medicine">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>
                Add a new medicine to the warehouse database.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddMedicine)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genericName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acetaminophen" {...field} data-testid="input-generic" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dosageForm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage Form</FormLabel>
                        <FormControl>
                          <Input placeholder="Tablet, Syrup..." {...field} data-testid="input-form" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strength</FormLabel>
                        <FormControl>
                          <Input placeholder="500mg" {...field} data-testid="input-strength" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Analgesic, Antibiotic..." {...field} data-testid="input-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-save-medicine">
                    Add Medicine
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Pill className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{medicines?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Medicines</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, generic name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-medicines"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardContent className="p-0">
          {filteredMedicines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map(medicine => (
                  <TableRow key={medicine.id} data-testid={`row-medicine-${medicine.id}`}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.genericName || "-"}</TableCell>
                    <TableCell>{medicine.dosageForm || "-"}</TableCell>
                    <TableCell>{medicine.strength || "-"}</TableCell>
                    <TableCell>
                      {medicine.category && (
                        <Badge variant="secondary">{medicine.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-${medicine.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setDeleteDialogOpen(true);
                          }}
                          data-testid={`button-delete-${medicine.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medicines in the warehouse</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                Add First Medicine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Medicine Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>
              Update medicine information in the warehouse.
            </DialogDescription>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  value={selectedMedicine.name}
                  onChange={(e) => setSelectedMedicine(prev => prev ? {
                    ...prev,
                    name: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Generic Name</label>
                <Input
                  value={selectedMedicine.genericName || ""}
                  onChange={(e) => setSelectedMedicine(prev => prev ? {
                    ...prev,
                    genericName: e.target.value
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dosage Form</label>
                  <Input
                    value={selectedMedicine.dosageForm || ""}
                    onChange={(e) => setSelectedMedicine(prev => prev ? {
                      ...prev,
                      dosageForm: e.target.value
                    } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Strength</label>
                  <Input
                    value={selectedMedicine.strength || ""}
                    onChange={(e) => setSelectedMedicine(prev => prev ? {
                      ...prev,
                      strength: e.target.value
                    } : null)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={selectedMedicine.category || ""}
                  onChange={(e) => setSelectedMedicine(prev => prev ? {
                    ...prev,
                    category: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Manufacturer</label>
                <Input
                  value={selectedMedicine.manufacturer || ""}
                  onChange={(e) => setSelectedMedicine(prev => prev ? {
                    ...prev,
                    manufacturer: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={2}
                  value={selectedMedicine.description || ""}
                  onChange={(e) => setSelectedMedicine(prev => prev ? {
                    ...prev,
                    description: e.target.value
                  } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMedicine}>
              Update Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Medicine Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMedicine?.name}"?
              This action cannot be undone and will permanently remove the medicine from the warehouse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedicine} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Medicine
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
