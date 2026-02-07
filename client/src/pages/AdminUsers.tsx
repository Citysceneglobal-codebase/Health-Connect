import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Stethoscope,
  User,
  Save,
  X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for users
const initialMockUsers = [
  {
    id: "user-1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "patient" as const,
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    gender: "male",
    address: "123 Main St",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-2",
    email: "jane.smith@hospital.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "doctor" as const,
    phone: "+1 (555) 987-6543",
    dateOfBirth: "1980-03-22",
    gender: "female",
    address: "456 Medical Center",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-3",
    email: "admin@hospital.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin" as const,
    phone: "+1 (555) 000-0000",
    dateOfBirth: "1975-01-01",
    gender: "other",
    address: "Hospital Admin Office",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-4",
    email: "bob.wilson@example.com",
    firstName: "Bob",
    lastName: "Wilson",
    role: "patient" as const,
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1978-09-10",
    gender: "male",
    address: "789 Oak Ave",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-5",
    email: "alice.brown@hospital.com",
    firstName: "Alice",
    lastName: "Brown",
    role: "doctor" as const,
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1976-12-05",
    gender: "female",
    address: "321 Health Blvd",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-6",
    email: "charlie.davis@example.com",
    firstName: "Charlie",
    lastName: "Davis",
    role: "patient" as const,
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1990-04-20",
    gender: "male",
    address: "654 Pine St",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-7",
    email: "diana.evans@hospital.com",
    firstName: "Diana",
    lastName: "Evans",
    role: "doctor" as const,
    phone: "+1 (555) 567-8901",
    dateOfBirth: "1982-07-15",
    gender: "female",
    address: "987 Care Center",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-8",
    email: "frank.garcia@example.com",
    firstName: "Frank",
    lastName: "Garcia",
    role: "patient" as const,
    phone: "+1 (555) 678-9012",
    dateOfBirth: "1988-11-30",
    gender: "male",
    address: "147 Elm Dr",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-9",
    email: "grace.taylor@hospital.com",
    firstName: "Grace",
    lastName: "Taylor",
    role: "doctor" as const,
    phone: "+1 (555) 789-0123",
    dateOfBirth: "1979-02-28",
    gender: "female",
    address: "258 Wellness Way",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "user-10",
    email: "henry.brown@example.com",
    firstName: "Henry",
    lastName: "Brown",
    role: "patient" as const,
    phone: "+1 (555) 890-1234",
    dateOfBirth: "1992-06-12",
    gender: "male",
    address: "369 Maple Ln",
    pushToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialMockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof initialMockUsers[0] | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "patient" as const,
    phone: "",
    dateOfBirth: "",
    gender: "other" as const,
    address: ""
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "doctor":
        return <Stethoscope className="h-4 w-4 text-blue-500" />;
      case "patient":
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user = {
      ...newUser,
      id: `user-${Date.now()}`,
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUsers(prev => [...prev, user]);
    setShowAddDialog(false);
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      role: "patient",
      phone: "",
      dateOfBirth: "",
      gender: "other",
      address: ""
    });

    toast({
      title: "User Added",
      description: "New user has been added successfully.",
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(prev => prev.map(user =>
      user.id === selectedUser.id ? { ...selectedUser, updatedAt: new Date() } : user
    ));

    setShowEditDialog(false);
    setSelectedUser(null);

    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setShowDeleteDialog(false);
    setSelectedUser(null);

    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
    });
  };

  const handleResetPassword = (user: typeof initialMockUsers[0]) => {
    // Simulate password reset
    toast({
      title: "Password Reset",
      description: `Password reset email sent to ${user.email}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage patient and doctor accounts, reset passwords, and view activity logs
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-medium text-sm capitalize">{user.role}</p>
                      <Badge variant="default" className="mt-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPassword(user)}
                  >
                    Reset Password
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the specified role and information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value: typeof newUser.role) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newUser.dateOfBirth}
                  onChange={(e) => setNewUser(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={newUser.gender} onValueChange={(value: typeof newUser.gender) => setNewUser(prev => ({ ...prev, gender: value }))}>
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newUser.address}
                onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              <Save className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={selectedUser.role} onValueChange={(value: typeof selectedUser.role) => setSelectedUser(prev => prev ? { ...prev, role: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={selectedUser.phone || ""}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={selectedUser.dateOfBirth || ""}
                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={selectedUser.gender || "other"} onValueChange={(value: typeof selectedUser.gender) => setSelectedUser(prev => prev ? { ...prev, gender: value } : null)}>
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
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={selectedUser.address || ""}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, address: e.target.value } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              <Save className="h-4 w-4 mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
              This action cannot be undone and will permanently remove the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}