import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Building2,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Bone,
  Eye,
  Syringe
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Department } from "@shared/schema";

const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const iconOptions = [
  { value: "stethoscope", label: "General", icon: Stethoscope },
  { value: "heart", label: "Cardiology", icon: Heart },
  { value: "brain", label: "Neurology", icon: Brain },
  { value: "baby", label: "Pediatrics", icon: Baby },
  { value: "bone", label: "Orthopedics", icon: Bone },
  { value: "eye", label: "Ophthalmology", icon: Eye },
  { value: "syringe", label: "Surgery", icon: Syringe },
  { value: "building", label: "Other", icon: Building2 },
];

function getDepartmentIcon(iconName?: string | null) {
  const found = iconOptions.find(opt => opt.value === iconName);
  const IconComponent = found?.icon || Building2;
  return <IconComponent className="h-5 w-5" />;
}

export default function AdminDepartments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Fetch departments from API
  const { data: departments, isLoading: departmentsLoading, error: departmentsError } = useQuery<Department[]>({
    queryKey: ["/api/admin/departments"],
  });

  // Fetch doctors to count per department
  const { data: doctors } = useQuery({
    queryKey: ["/api/admin/doctors"],
  });

  // Count doctors per department safely
  const doctorList = Array.isArray(doctors) ? doctors : [];
  const doctorCounts = doctorList.reduce((acc: Record<number, number>, doctor: any) => {
    const deptId = doctor?.departmentId;
    if (deptId) {
      acc[deptId] = (acc[deptId] || 0) + 1;
    }
    return acc;
  }, {}) || {};

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: async (data: DepartmentFormValues) => {
      return apiRequest("POST", "/api/admin/departments", {
        name: data.name,
        description: data.description,
        icon: data.icon,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      setDialogOpen(false);
      setEditingDepartment(null);
      form.reset();
      toast({
        title: "Department Added",
        description: "The department has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add department. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DepartmentFormValues }) => {
      return apiRequest("PATCH", `/api/admin/departments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      setDialogOpen(false);
      setEditingDepartment(null);
      form.reset();
      toast({
        title: "Department Updated",
        description: "The department has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/departments"] });
      toast({
        title: "Department Deleted",
        description: "The department has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddDepartment = async (data: DepartmentFormValues) => {
    createDepartmentMutation.mutate(data);
  };

  const handleUpdateDepartment = async (id: number, data: DepartmentFormValues) => {
    updateDepartmentMutation.mutate({ id, data });
  };

  const handleDeleteDepartment = async (id: number) => {
    deleteDepartmentMutation.mutate(id);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || "",
      icon: department.icon || "",
    });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingDepartment(null);
      form.reset();
    }
  };

  const handleSubmit = (data: DepartmentFormValues) => {
    if (editingDepartment) {
      handleUpdateDepartment(editingDepartment.id, data);
    } else {
      handleAddDepartment(data);
    }
  };

  const departmentList = Array.isArray(departments) ? departments : [];
  const filteredDepartments = departmentList.filter(dept => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(query) ||
      dept.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manage Departments</h1>
          <p className="text-muted-foreground">Add, edit, and manage hospital departments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-department">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? "Update department details." : "Fill in the details to add a new department."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cardiology" {...field} data-testid="input-department-name" />
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
                        <Textarea 
                          placeholder="Brief description of the department..." 
                          {...field} 
                          data-testid="input-department-description" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-icon">
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
                    data-testid="button-save-department"
                  >
                    {createDepartmentMutation.isPending || updateDepartmentMutation.isPending
                      ? (editingDepartment ? "Updating..." : "Adding...")
                      : (editingDepartment ? "Update" : "Add Department")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-departments"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {departmentsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : departmentsError ? (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Error loading departments. Please try again.</p>
            </div>
          ) : filteredDepartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map(department => (
                  <TableRow key={department.id} data-testid={`row-department-${department.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {getDepartmentIcon(department.icon)}
                        </div>
                        <p className="font-medium">{department.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {department.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {doctorCounts[department.id] || 0} doctor{(doctorCounts[department.id] || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(department)}
                          data-testid={`button-edit-${department.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDepartment(department.id)}
                          disabled={deleteDepartmentMutation.isPending}
                          data-testid={`button-delete-${department.id}`}
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
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No departments found</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-department">
                Add Your First Department
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
