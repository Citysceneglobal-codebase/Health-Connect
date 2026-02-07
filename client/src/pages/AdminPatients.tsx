import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
  Users,
  UserCheck,
  UserX,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { User } from "@shared/schema";

export default function AdminPatients() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

  // Mock patients data with local state
  const [patients, setPatients] = useState<User[]>([
    {
      id: "patient-1",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-06-15",
      gender: "male",
      address: "123 Main St, City, State",
      pushToken: null,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    },
    {
      id: "patient-2",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 234-5678",
      dateOfBirth: "1990-03-22",
      gender: "female",
      address: "456 Oak Ave, City, State",
      pushToken: null,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01")
    },
    {
      id: "patient-3",
      email: "bob.wilson@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 345-6789",
      dateOfBirth: "1978-11-30",
      gender: "male",
      address: "789 Pine St, City, State",
      pushToken: null,
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20")
    },
    {
      id: "patient-4",
      email: "alice.brown@example.com",
      firstName: "Alice",
      lastName: "Brown",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 456-7890",
      dateOfBirth: "1992-08-12",
      gender: "female",
      address: "321 Elm St, City, State",
      pushToken: null,
      createdAt: new Date("2024-02-10"),
      updatedAt: new Date("2024-02-10")
    }
  ]);

  // Calculate statistics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => {
    // Consider patients active if they have recent activity (simplified logic)
    const daysSinceLastUpdate = Math.floor((Date.now() - new Date(p.updatedAt || new Date()).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastUpdate <= 30;
  }).length;

  const handleAddPatient = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPatient: User = {
      id: `patient-${Date.now()}`,
      email: "new.patient@example.com",
      firstName: "New",
      lastName: "Patient",
      profileImageUrl: "",
      role: "patient",
      phone: "+1 (555) 000-0000",
      dateOfBirth: "1990-01-01",
      gender: "other",
      address: "New Address",
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPatients(prev => [...prev, newPatient]);
    setDialogOpen(false);

    toast({
      title: "Patient Added",
      description: "The patient has been added successfully.",
    });
  };

  const handleEditPatient = async () => {
    if (!selectedPatient) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPatients(prev => prev.map(patient =>
      patient.id === selectedPatient.id ? { ...selectedPatient, updatedAt: new Date() } : patient
    ));

    setEditDialogOpen(false);
    setSelectedPatient(null);

    toast({
      title: "Patient Updated",
      description: "Patient information has been updated successfully.",
    });
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPatients(prev => prev.filter(patient => patient.id !== selectedPatient.id));
    setDeleteDialogOpen(false);
    setSelectedPatient(null);

    toast({
      title: "Patient Deleted",
      description: "Patient has been removed from the system.",
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === "" ||
      patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.includes(searchQuery);

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && activePatients > 0) ||
      (statusFilter === "inactive");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manage Patients</h1>
          <p className="text-muted-foreground">View and manage patient accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-patient">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Create a new patient account in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St, City, State" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>
                Add Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalPatients}</p>
                <p className="text-xs text-muted-foreground">Total Patients</p>
              </div>
            </div>
            <p className="text-xs text-blue-600">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activePatients}</p>
                <p className="text-xs text-muted-foreground">Active Patients</p>
              </div>
            </div>
            <p className="text-xs text-green-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <UserX className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{totalPatients - activePatients}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((activePatients / totalPatients) * 100) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
            <p className="text-xs text-purple-600">Patient activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map(patient => {
                  const isActive = Math.floor((Date.now() - new Date(patient.updatedAt || new Date()).getTime()) / (1000 * 60 * 60 * 24)) <= 30;

                  return (
                    <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={patient.profileImageUrl || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {patient.firstName?.[0] || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{patient.email}</p>
                          <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {patient.dateOfBirth ? format(new Date(patient.dateOfBirth as string), "MMM d, yyyy") : "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">{patient.gender}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {format(new Date(patient.createdAt || new Date()), "MMM d, yyyy")}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setEditDialogOpen(true);
                            }}
                            data-testid={`button-edit-${patient.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setDeleteDialogOpen(true);
                            }}
                            data-testid={`button-delete-${patient.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information and details.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={selectedPatient.firstName || ""}
                    onChange={(e) => setSelectedPatient(prev => prev ? {
                      ...prev,
                      firstName: e.target.value
                    } : null)}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={selectedPatient.lastName || ""}
                    onChange={(e) => setSelectedPatient(prev => prev ? {
                      ...prev,
                      lastName: e.target.value
                    } : null)}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedPatient.email || ""}
                  onChange={(e) => setSelectedPatient(prev => prev ? {
                    ...prev,
                    email: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={selectedPatient.phone || ""}
                  onChange={(e) => setSelectedPatient(prev => prev ? {
                    ...prev,
                    phone: e.target.value
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={selectedPatient.dateOfBirth || ""}
                    onChange={(e) => setSelectedPatient(prev => prev ? {
                      ...prev,
                      dateOfBirth: e.target.value
                    } : null)}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={selectedPatient.gender || ""}
                    onValueChange={(value) => setSelectedPatient(prev => prev ? {
                      ...prev,
                      gender: value as "male" | "female" | "other"
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={selectedPatient.address || ""}
                  onChange={(e) => setSelectedPatient(prev => prev ? {
                    ...prev,
                    address: e.target.value
                  } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPatient}>
              Update Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPatient?.firstName} {selectedPatient?.lastName}?
              This action cannot be undone and will permanently remove the patient from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}