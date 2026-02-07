import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Users, Crown, Heart, Baby, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FamilyMember, User as UserType } from "@shared/schema";

interface FamilyTreeProps {
  primaryUser: UserType;
  familyMembers: FamilyMember[];
}

interface TreeNode {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  children: TreeNode[];
  level: number;
}

export function FamilyTree({ primaryUser, familyMembers }: FamilyTreeProps) {
  const { data: allUsers } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const buildFamilyTree = (): TreeNode => {
    const root: TreeNode = {
      id: primaryUser.id,
      name: `${primaryUser.firstName} ${primaryUser.lastName}`.trim() || "You",
      relationship: "self",
      avatar: primaryUser.profileImageUrl,
      children: [],
      level: 0,
    };

    // Group family members by relationship
    const groupedMembers = familyMembers.reduce((acc, member) => {
      const user = allUsers?.find(u => u.id === member.memberId);
      if (user) {
        if (!acc[member.relationship]) acc[member.relationship] = [];
        acc[member.relationship].push({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || `User ${user.id}`,
          relationship: member.relationship,
          avatar: user.profileImageUrl,
          children: [],
          level: 1,
        });
      }
      return acc;
    }, {} as Record<string, TreeNode[]>);

    // Add children to root based on relationship hierarchy
    root.children = [
      ...(groupedMembers.spouse || []),
      ...(groupedMembers.child || []),
      ...(groupedMembers.parent || []),
      ...(groupedMembers.sibling || []),
      ...(groupedMembers.grandparent || []),
      ...(groupedMembers.other || []),
    ];

    return root;
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case "self":
        return <Crown className="h-4 w-4" />;
      case "spouse":
        return <Heart className="h-4 w-4" />;
      case "child":
        return <Baby className="h-4 w-4" />;
      case "parent":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "self":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700";
      case "spouse":
        return "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700";
      case "child":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      case "parent":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
      case "sibling":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const renderTreeNode = (node: TreeNode, isLast: boolean = false) => {
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="relative">
        {/* Connection line for children */}
        {hasChildren && (
          <div className="absolute left-6 top-12 w-px h-full bg-border" />
        )}

        <div className="flex items-start gap-4 mb-4">
          {/* Vertical connection line */}
          {!isLast && node.level > 0 && (
            <div className="w-px h-12 bg-border ml-6" />
          )}

          {/* Node content */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary">
                {node.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{node.name}</h4>
                {node.relationship === "self" && (
                  <Badge variant="outline" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${getRelationshipColor(node.relationship)}`}
              >
                {getRelationshipIcon(node.relationship)}
                <span className="ml-1">{node.relationship}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="ml-8 space-y-2">
            {node.children.map((child, index) =>
              renderTreeNode(child, index === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const familyTree = buildFamilyTree();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Family Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        {familyMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Family Members</h3>
            <p className="text-muted-foreground">
              Add family members to see your family tree visualization
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderTreeNode(familyTree)}
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              <span>Primary</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>Spouse</span>
            </div>
            <div className="flex items-center gap-1">
              <Baby className="h-3 w-3" />
              <span>Child</span>
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              <span>Parent</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}