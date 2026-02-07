import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Stethoscope,
  Star,
  Clock,
  CheckCircle,
  ChevronLeft,
  Building2,
  Heart,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Doctor, Department, DoctorWithUser, Favorite } from "@shared/schema";

type BookingStep = "search" | "select-doctor" | "select-time" | "confirm" | "payment";

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<BookingStep>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: doctors, isLoading: doctorsLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/doctors", selectedDepartment],
  });

  const { data: favorites } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });

  const bookMutation = useMutation({
    mutationFn: async (data: {
      doctorId: number;
      appointmentDate: string;
      appointmentTime: string;
      reason: string;
    }) => {
      return apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setLocation("/appointments");
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    },
  });

  const filteredDoctors = doctors?.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.user?.firstName?.toLowerCase().includes(query) ||
      doc.user?.lastName?.toLowerCase().includes(query) ||
      doc.specialty?.toLowerCase().includes(query)
    );
  });

  // Get favorite doctors with details
  const favoriteDoctors = (favorites?.map(fav => {
    const doctor = doctors?.find(d => d.id === fav.doctorId);
    return doctor ? { ...doctor, favoriteId: fav.id } : null;
  }).filter((doc): doc is DoctorWithUser & { favoriteId: number } => doc !== null)) || [];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    bookMutation.mutate({
      doctorId: selectedDoctor.id,
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      appointmentTime: selectedTime,
      reason,
    });
    setShowConfirmDialog(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/appointments">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Book Appointment</h1>
          <p className="text-muted-foreground">Find a doctor and schedule your visit</p>
        </div>
      </div>

      {/* Quick Book from Favorites */}
      {favoriteDoctors.length > 0 && step === "search" && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Book with Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteDoctors.slice(0, 3).map(doctor => (
                <Card
                  key={doctor.id}
                  className="hover-elevate cursor-pointer border-2 hover:border-primary/50"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setStep("select-time");
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={doctor.user?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {doctor.user?.firstName?.[0] || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                          </p>
                          <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        <StepIndicator step={1} label="Find Doctor" active={step === "search" || step === "select-doctor"} completed={["select-time", "confirm", "payment"].includes(step)} />
        <div className="h-px flex-1 bg-border min-w-[20px]" />
        <StepIndicator step={2} label="Select Time" active={step === "select-time"} completed={["confirm", "payment"].includes(step)} />
        <div className="h-px flex-1 bg-border min-w-[20px]" />
        <StepIndicator step={3} label="Confirm" active={step === "confirm"} completed={step === "payment"} />
        <div className="h-px flex-1 bg-border min-w-[20px]" />
        <StepIndicator step={4} label="Payment" active={step === "payment"} />
      </div>

      {/* Search & Filter */}
      {(step === "search" || step === "select-doctor") && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-doctors"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-department">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))
            ) : filteredDoctors && filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onSelect={() => {
                    setSelectedDoctor(doctor);
                    setStep("select-time");
                  }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No doctors found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Selection */}
      {step === "select-time" && selectedDoctor && (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setStep("search")}
            data-testid="button-change-doctor"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Change Doctor
          </Button>

          {/* Selected Doctor Summary */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={selectedDoctor.user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {selectedDoctor.user?.firstName?.[0] || "D"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor.department?.name}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                  data-testid="calendar-date"
                />
              </CardContent>
            </Card>

            {/* Smart Time Suggestions */}
            {selectedDate && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Suggested Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on your preferences and availability
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["10:00", "14:00", "15:30"].map(time => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        className="border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time} (Recommended)
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Slots */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Select Time</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        data-testid={`button-time-${time}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Please select a date first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reason */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reason for Visit (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe your symptoms or reason for the appointment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                data-testid="textarea-reason"
              />
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep("confirm")}
            data-testid="button-continue"
          >
            Continue to Confirmation
          </Button>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirm" && selectedDoctor && selectedDate && selectedTime && (
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => setStep("select-time")}
            data-testid="button-back-to-time"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Time Selection
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Appointment</CardTitle>
              <CardDescription>
                Please review your appointment details before proceeding to payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarImage src={selectedDoctor.user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedDoctor.user?.firstName?.[0] || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.department?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Appointment Date</Label>
                    <p className="font-medium text-lg">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Appointment Time</Label>
                    <p className="font-medium text-lg">{selectedTime}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {reason && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Reason for Visit</Label>
                      <p className="text-sm">{reason}</p>
                    </div>
                  )}

                  {selectedDoctor.consultationFee && (
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Consultation Fee</span>
                        <span className="font-semibold text-xl">${selectedDoctor.consultationFee}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("select-time")}
                >
                  Edit Details
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => setStep("payment")}
                  data-testid="button-proceed-to-payment"
                >
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Step */}
      {step === "payment" && selectedDoctor && selectedDate && selectedTime && (
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => setStep("confirm")}
            data-testid="button-back-to-confirm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Confirmation
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Payment</CardTitle>
              <CardDescription>
                Choose your preferred payment method to confirm the appointment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment Summary */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Appointment Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}</p>
                  <p>{format(selectedDate, "MMM d, yyyy")} at {selectedTime}</p>
                  <p className="font-medium">Total: ${selectedDoctor.consultationFee || "0"}</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Payment Method</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer border-2 hover:border-primary/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">₹</span>
                      </div>
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay with UPI apps</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer border-2 hover:border-primary/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">💳</span>
                      </div>
                      <div>
                        <p className="font-medium">Card</p>
                        <p className="text-sm text-muted-foreground">Credit/Debit cards</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer border-2 hover:border-primary/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">🏦</span>
                      </div>
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-muted-foreground">Online banking</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="cursor-pointer border-2 hover:border-primary/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">💰</span>
                      </div>
                      <div>
                        <p className="font-medium">Wallet</p>
                        <p className="text-sm text-muted-foreground">Digital wallet</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBookAppointment}
                disabled={bookMutation.isPending}
                data-testid="button-complete-payment"
              >
                {bookMutation.isPending ? "Processing..." : "Complete Payment & Book"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step, label, active, completed }: { step: number; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        completed 
          ? "bg-primary text-primary-foreground" 
          : active 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
      }`}>
        {completed ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={`text-sm ${active ? "font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function DoctorCard({ doctor, onSelect }: { doctor: DoctorWithUser; onSelect: () => void }) {
  return (
    <Card className="hover-elevate cursor-pointer" onClick={onSelect} data-testid={`card-doctor-${doctor.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={doctor.user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {doctor.user?.firstName?.[0] || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">
              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
            </h3>
            <p className="text-sm text-primary">{doctor.specialty}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {doctor.department && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {doctor.department.name}
                </span>
              )}
              {doctor.experience && (
                <span>{doctor.experience} yrs exp</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              {doctor.consultationFee && (
                <span className="font-semibold text-sm">${doctor.consultationFee}</span>
              )}
              <Badge variant="secondary" className="text-xs">
                {doctor.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
