import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronLeft
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
import { useQuery, useMutation } from "@tanstack/react-query";
import type { DoctorWithUser, Department } from "@shared/schema";

const doctorFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  departmentId: z.string().min(1, "Department is required"),
  specialty: z.string().min(1, "Specialty is required"),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  consultationFee: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export default function AdminDoctors() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);

  // Fetch doctors from API
  const { data: doctors, isLoading: doctorsLoading, error: doctorsError } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/admin/doctors"],
  });

  // Fetch departments from API
  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/admin/departments"],
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      departmentId: "",
      specialty: "",
      qualification: "",
      experience: "",
      consultationFee: "",
    },
  });

  // Create doctor mutation
  const createDoctorMutation = useMutation({
    mutationFn: async (data: DoctorFormValues) => {
      return apiRequest("POST", "/api/admin/doctors", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        departmentId: parseInt(data.departmentId),
        specialty: data.specialty,
        qualification: data.qualification,
        experience: data.experience ? parseInt(data.experience) : null,
        consultationFee: data.consultationFee,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Doctor Added",
        description: "The doctor has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DoctorWithUser> }) => {
      return apiRequest("PATCH", `/api/admin/doctors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
      setEditDialogOpen(false);
      setSelectedDoctor(null);
      toast({
        title: "Doctor Updated",
        description: "Doctor information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/doctors"] });
      setDeleteDialogOpen(false);
      setSelectedDoctor(null);
      toast({
        title: "Doctor Deleted",
        description: "Doctor has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddDoctor = async (data: DoctorFormValues) => {
    createDoctorMutation.mutate(data);
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;
    updateDoctorMutation.mutate({ id: selectedDoctor.id, data: selectedDoctor });
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    deleteDoctorMutation.mutate(selectedDoctor.id);
  };

  const doctorList = Array.isArray(doctors) ? doctors : [];
  const filteredDoctors = doctorList.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.user?.firstName?.toLowerCase().includes(query) ||
      doc.user?.lastName?.toLowerCase().includes(query) ||
      doc.specialty?.toLowerCase().includes(query) ||
      doc.user?.email?.toLowerCase().includes(query)
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
          <h1 className="text-2xl font-bold">Manage Doctors</h1>
          <p className="text-muted-foreground">Add, edit, and manage doctor profiles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-doctor">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new doctor to the system.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddDoctor)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Array.isArray(departments) ? departments : []).map(dept => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
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
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cardiology" {...field} data-testid="input-specialty" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (years)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-fee" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDoctorMutation.isPending} data-testid="button-save-doctor">
                    {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name, specialty, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-doctors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardContent className="p-0">
          {doctorsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : doctorsError ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Error loading doctors. Please try again.</p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map(doctor => (
                  <TableRow key={doctor.id} data-testid={`row-doctor-${doctor.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={doctor.user?.profileImageUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {doctor.user?.firstName?.[0] || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{doctor.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>{doctor.department?.name || "-"}</TableCell>
                    <TableCell>{doctor.experience ? `${doctor.experience} yrs` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={doctor.isAvailable ? "default" : "secondary"}>
                        {doctor.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-${doctor.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setDeleteDialogOpen(true);
                          }}
                          data-testid={`button-delete-${doctor.id}`}
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
              <p className="text-muted-foreground">No doctors found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Doctor Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={selectedDoctor.user?.firstName || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                      ...prev,
                      user: { ...prev.user, firstName: e.target.value }
                    } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={selectedDoctor.user?.lastName || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                      ...prev,
                      user: { ...prev.user, lastName: e.target.value }
                    } : null)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={selectedDoctor.user?.email || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                    ...prev,
                    user: { ...prev.user, email: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Specialty</label>
                <Input
                  value={selectedDoctor.specialty || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                    ...prev,
                    specialty: e.target.value
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Experience (years)</label>
                  <Input
                    type="number"
                    value={selectedDoctor.experience || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                      ...prev,
                      experience: parseInt(e.target.value) || 0
                    } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Consultation Fee ($)</label>
                  <Input
                    value={selectedDoctor.consultationFee || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDoctor((prev: any) => prev ? {
                      ...prev,
                      consultationFee: e.target.value
                    } : null)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDoctor} disabled={updateDoctorMutation.isPending}>
              {updateDoctorMutation.isPending ? "Updating..." : "Update Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Dr. {selectedDoctor?.user.firstName} {selectedDoctor?.user.lastName}?
              This action cannot be undone and will permanently remove the doctor from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoctor} disabled={deleteDoctorMutation.isPending} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteDoctorMutation.isPending ? "Deleting..." : "Delete Doctor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
