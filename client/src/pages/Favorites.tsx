import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MapPin,
  Star,
  Calendar,
  Phone,
  Mail,
  Stethoscope,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Favorite, DoctorWithUser } from "@shared/schema";

export default function Favorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });

  const removeMutation = useMutation({
    mutationFn: (doctorId: number) => apiRequest("DELETE", `/api/favorites/${doctorId}`),
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "Doctor has been removed from your favorites.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  // Mock doctor data - in real app, this would come from API
  const getDoctorDetails = (doctorId: number): DoctorWithUser => {
    const mockDoctors: DoctorWithUser[] = [
      {
        id: 1,
        userId: "doc1",
        departmentId: 1,
        specialty: "Cardiology",
        qualification: "MD",
        experience: 15,
        consultationFee: "150.00",
        bio: "Experienced cardiologist with 15+ years of practice",
        isAvailable: true,
        createdAt: new Date(),
        user: {
          id: "doc1",
          email: "dr.smith@hospital.com",
          firstName: "John",
          lastName: "Smith",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 123-4567",
          dateOfBirth: "1975-01-01",
          gender: "Male",
          address: "123 Medical Center, City, State",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        department: {
          id: 1,
          name: "Cardiology",
          description: "Heart and cardiovascular care",
          icon: "❤️",
          createdAt: new Date(),
        }
      },
      {
        id: 2,
        userId: "doc2",
        departmentId: 2,
        specialty: "Dermatology",
        qualification: "MD",
        experience: 10,
        consultationFee: "120.00",
        bio: "Specialist in skin care and dermatological treatments",
        isAvailable: true,
        createdAt: new Date(),
        user: {
          id: "doc2",
          email: "dr.johnson@hospital.com",
          firstName: "Sarah",
          lastName: "Johnson",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 234-5678",
          dateOfBirth: "1980-01-01",
          gender: "Female",
          address: "456 Skin Clinic, City, State",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        department: {
          id: 2,
          name: "Dermatology",
          description: "Skin and hair care",
          icon: "🩹",
          createdAt: new Date(),
        }
      }
    ];

    return mockDoctors.find(doc => doc.id === doctorId) || mockDoctors[0];
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">My Favorite Doctors</h1>
          <p className="text-muted-foreground">
            Doctors you've marked as favorites for quick access
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">My Favorite Doctors</h1>
        <p className="text-muted-foreground">
          Doctors you've marked as favorites for quick access and booking
        </p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const doctor = getDoctorDetails(favorite.doctorId);
            return (
              <Card key={favorite.id} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={doctor.user?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMutation.mutate(favorite.doctorId)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.qualification} • {doctor.experience} years exp.</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.department?.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>4.8 (120 reviews)</span>
                      </div>
                      <Badge variant="secondary">
                        ${doctor.consultationFee}/visit
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorite doctors yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding doctors to your favorites for quick access and booking
            </p>
            <Button>
              Browse Doctors
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}