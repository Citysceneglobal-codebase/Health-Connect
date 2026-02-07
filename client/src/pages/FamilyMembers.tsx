import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Users,
  Shield,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FamilyMember } from "@shared/schema";
import { FamilyTree } from "@/components/FamilyTree";
import { useAuth } from "@/hooks/useAuth";

export default function FamilyMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    memberId: "",
    relationship: ""
  });

  const { data: members, isLoading } = useQuery<FamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newMember) => apiRequest("POST", "/api/family-members", data),
    onSuccess: () => {
      toast({
        title: "Family member added",
        description: "The family member has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      setNewMember({ memberId: "", relationship: "" });
      setIsAdding(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add member",
        description: error.message || "Failed to add family member",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/family-members/${id}`),
    onSuccess: () => {
      toast({
        title: "Family member removed",
        description: "The family member has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove member",
        description: error.message || "Failed to remove family member",
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    if (newMember.memberId && newMember.relationship) {
      createMutation.mutate(newMember);
    }
  };

  const handleDeleteMember = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Family Member Management</h1>
          <p className="text-muted-foreground">
            Add and manage family members to track their medical records and appointments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>
              Manage profiles for your family members to access their health records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {isLoading ? "Loading..." : `${members?.length || 0} Family Members`}
                  </span>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {isAdding && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Add Family Member</CardTitle>
                    <CardDescription>
                      Link an existing user account as a family member
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberId">Member User ID</Label>
                        <Input
                          id="memberId"
                          value={newMember.memberId}
                          onChange={(e) => setNewMember({...newMember, memberId: e.target.value})}
                          placeholder="Enter user ID or email"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the user ID or email of the family member
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select
                          value={newMember.relationship}
                          onValueChange={(value) => setNewMember({...newMember, relationship: value})}
                        >
                          <SelectTrigger id="relationship">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="grandparent">Grandparent</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Privacy controls: Family members can only access records you explicitly share with them.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAdding(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMember}
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Privacy</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Member #{member.memberId}</p>
                              <p className="text-xs text-muted-foreground">ID: {member.memberId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {member.relationship}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Shared access</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No family members added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add family members to share health records and appointments
                  </p>
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Family Tree Visualization */}
        {user && (
          <FamilyTree primaryUser={user} familyMembers={members || []} />
        )}
      </div>
    </div>
  );
}