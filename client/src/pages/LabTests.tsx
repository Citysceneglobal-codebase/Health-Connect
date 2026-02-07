import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Home,
  Truck,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  requiresFasting: boolean;
  description: string;
  preparation: string[];
  homeCollection: boolean;
}

interface Booking {
  id: string;
  testName: string;
  date: string;
  time: string;
  location: string;
  status: "scheduled" | "sample_collected" | "processing" | "completed" | "cancelled";
  collectionType: "home" | "lab";
  trackingUpdates: string[];
}

export default function LabTests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Dialog states
  const [testDetailsDialog, setTestDetailsDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState(false);

  // Selected items
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    collectionType: "home" as "home" | "lab",
    notes: ""
  });
  
  const labTests: LabTest[] = [
    {
      id: "1",
      name: "Complete Blood Count (CBC)",
      category: "Blood",
      price: 25.00,
      duration: "24 hours",
      requiresFasting: false,
      homeCollection: true,
      description: "Comprehensive blood test that evaluates overall health and detects disorders.",
      preparation: ["No special preparation required", "Wear comfortable clothing with short sleeves"]
    },
    {
      id: "2",
      name: "Lipid Profile",
      category: "Blood",
      price: 35.00,
      duration: "24 hours",
      requiresFasting: true,
      homeCollection: true,
      description: "Measures cholesterol levels and triglyceride levels in the blood.",
      preparation: ["Fast for 12 hours before test", "Avoid alcohol 24 hours prior", "Inform doctor about medications"]
    },
    {
      id: "3",
      name: "Liver Function Test",
      category: "Blood",
      price: 30.00,
      duration: "24 hours",
      requiresFasting: true,
      homeCollection: true,
      description: "Assesses liver health and detects liver damage or disease.",
      preparation: ["Fast for 8-12 hours", "Avoid alcohol for 24 hours", "Inform about recent medications"]
    },
    {
      id: "4",
      name: "Kidney Function Test",
      category: "Blood",
      price: 28.00,
      duration: "24 hours",
      requiresFasting: false,
      homeCollection: true,
      description: "Evaluates kidney function and detects kidney problems.",
      preparation: ["No special preparation", "Stay hydrated", "Inform about medications"]
    },
    {
      id: "5",
      name: "Thyroid Function Test",
      category: "Blood",
      price: 40.00,
      duration: "48 hours",
      requiresFasting: false,
      homeCollection: true,
      description: "Assesses thyroid gland function and hormone levels.",
      preparation: ["No fasting required", "Take medications as usual unless advised otherwise"]
    },
    {
      id: "6",
      name: "Chest X-Ray",
      category: "Radiology",
      price: 50.00,
      duration: "Same day",
      requiresFasting: false,
      homeCollection: false,
      description: "Imaging test to examine lungs, heart, and chest structures.",
      preparation: ["Remove jewelry and metal objects", "Wear comfortable clothing", "Inform about pregnancy"]
    },
    {
      id: "7",
      name: "Ultrasound Abdomen",
      category: "Radiology",
      price: 75.00,
      duration: "Same day",
      requiresFasting: true,
      homeCollection: false,
      description: "Uses sound waves to examine abdominal organs.",
      preparation: ["Fast for 6-8 hours", "Drink water 1 hour before if instructed", "Wear loose clothing"]
    },
    {
      id: "8",
      name: "MRI Brain",
      category: "Radiology",
      price: 350.00,
      duration: "2-3 days",
      requiresFasting: false,
      homeCollection: false,
      description: "Detailed imaging of brain structure and function.",
      preparation: ["Remove metal objects", "Inform about implants or devices", "May require contrast injection"]
    },
  ];

  const bookings: Booking[] = [
    {
      id: "1",
      testName: "Complete Blood Count (CBC)",
      date: "2023-06-15",
      time: "09:00 AM",
      location: "Home Collection",
      status: "sample_collected",
      collectionType: "home",
      trackingUpdates: ["Scheduled", "Phlebotomist assigned", "Sample collected successfully"]
    },
    {
      id: "2",
      testName: "Lipid Profile",
      date: "2023-06-18",
      time: "08:30 AM",
      location: "Main Lab",
      status: "processing",
      collectionType: "lab",
      trackingUpdates: ["Scheduled", "Sample collected", "Processing started"]
    },
    {
      id: "3",
      testName: "Chest X-Ray",
      date: "2023-06-10",
      time: "10:00 AM",
      location: "Radiology Dept",
      status: "completed",
      collectionType: "lab",
      trackingUpdates: ["Scheduled", "Test completed", "Report ready"]
    },
  ];

  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || test.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(labTests.map(test => test.category)))];

  // Handler functions
  const handleViewDetails = (test: LabTest) => {
    setSelectedTest(test);
    setTestDetailsDialog(true);
  };

  const handleBookTest = (test: LabTest) => {
    setSelectedTest(test);
    setBookingForm({
      date: "",
      time: "",
      collectionType: test.homeCollection ? "home" : "lab",
      notes: ""
    });
    setBookingDialog(true);
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingForm({
      date: booking.date,
      time: booking.time,
      collectionType: booking.collectionType,
      notes: ""
    });
    setRescheduleDialog(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialog(true);
  };

  const handleTrackBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setTrackingDialog(true);
  };

  const submitBooking = () => {
    if (!bookingForm.date || !bookingForm.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time for your booking.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Confirmed",
      description: `${selectedTest?.name} has been booked for ${bookingForm.date} at ${bookingForm.time}.`,
    });

    setBookingDialog(false);
    setSelectedTest(null);
    setBookingForm({ date: "", time: "", collectionType: "home", notes: "" });
  };

  const submitReschedule = () => {
    if (!bookingForm.date || !bookingForm.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time for rescheduling.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Rescheduled",
      description: `Your appointment has been rescheduled to ${bookingForm.date} at ${bookingForm.time}.`,
    });

    setRescheduleDialog(false);
    setSelectedBooking(null);
    setBookingForm({ date: "", time: "", collectionType: "home", notes: "" });
  };

  const confirmCancel = () => {
    toast({
      title: "Booking Cancelled",
      description: `Your ${selectedBooking?.testName} booking has been cancelled.`,
    });

    setCancelDialog(false);
    setSelectedBooking(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Lab Test Booking</h1>
          <p className="text-muted-foreground">
            Browse and book laboratory tests and radiology services
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Tests</CardTitle>
                <CardDescription>
                  Search and browse available laboratory and radiology tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tests..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Collection</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{test.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                              {test.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{test.category}</Badge>
                        </TableCell>
                        <TableCell>${test.price.toFixed(2)}</TableCell>
                        <TableCell>{test.duration}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {test.homeCollection && (
                              <Badge variant="secondary" className="text-xs">
                                <Home className="h-3 w-3 mr-1" />
                                Home Available
                              </Badge>
                            )}
                            {test.requiresFasting && (
                              <Badge variant="outline" className="text-xs">
                                Fasting Required
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(test)}>
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" onClick={() => handleBookTest(test)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Book Test
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredTests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tests found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  Your scheduled lab tests and appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookings.filter(b => b.status !== "completed" && b.status !== "cancelled").length > 0 ? (
                  bookings.filter(b => b.status !== "completed" && b.status !== "cancelled").map(booking => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{booking.testName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.date} at {booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {booking.collectionType === "home" ? (
                              <Home className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            booking.status === "sample_collected" ? "bg-blue-500/10 text-blue-600" :
                            booking.status === "processing" ? "bg-yellow-500/10 text-yellow-600" :
                            "bg-green-500/10 text-green-600"
                          }>
                            {booking.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Tracking */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{booking.trackingUpdates.length}/4 steps</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {["Scheduled", "Sample Collected", "Processing", "Completed"].map((step, index) => (
                            <div key={step} className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                index < booking.trackingUpdates.length
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {index < booking.trackingUpdates.length ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              {index < 3 && (
                                <div className={`w-8 h-0.5 ${
                                  index < booking.trackingUpdates.length - 1 ? "bg-primary" : "bg-muted"
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Latest Update */}
                      {booking.trackingUpdates.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <span>Latest: {booking.trackingUpdates[booking.trackingUpdates.length - 1]}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(booking)}>Reschedule</Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancelBooking(booking)}>Cancel</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTrackBooking(booking)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.filter(b => b.status === "completed").length > 0 ? (
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === "completed").map(booking => (
                      <div key={booking.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{booking.testName}</p>
                          <p className="text-xs text-muted-foreground">{booking.date}</p>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Test Details Dialog */}
      <Dialog open={testDetailsDialog} onOpenChange={setTestDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTest?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this laboratory test
            </DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedTest.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-sm text-muted-foreground">${selectedTest.price.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground">{selectedTest.duration}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Collection</Label>
                  <div className="flex gap-2">
                    {selectedTest.homeCollection && (
                      <Badge variant="secondary">
                        <Home className="h-3 w-3 mr-1" />
                        Home Available
                      </Badge>
                    )}
                    {!selectedTest.homeCollection && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        Lab Visit Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedTest.description}</p>
              </div>

              {selectedTest.preparation.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Preparation Instructions</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {selectedTest.preparation.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTest.requiresFasting && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Fasting Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please follow the preparation instructions carefully for accurate test results.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDetailsDialog(false)}>
              Close
            </Button>
            {selectedTest && (
              <Button onClick={() => {
                setTestDetailsDialog(false);
                handleBookTest(selectedTest);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Book This Test
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedTest?.name}</DialogTitle>
            <DialogDescription>
              Schedule your laboratory test appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Preferred Date *</Label>
              <Input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Preferred Time *</Label>
              <Select value={bookingForm.time} onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Collection Type</Label>
              <Select
                value={bookingForm.collectionType}
                onValueChange={(value: "home" | "lab") => setBookingForm(prev => ({ ...prev, collectionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedTest?.homeCollection && (
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Home Collection
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="lab">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Visit Lab
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                placeholder="Any special instructions or notes..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitBooking}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule {selectedBooking?.testName}</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">New Date *</Label>
              <Input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">New Time *</Label>
              <Select value={bookingForm.time} onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Collection Type</Label>
              <Select
                value={bookingForm.collectionType}
                onValueChange={(value: "home" | "lab") => setBookingForm(prev => ({ ...prev, collectionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home Collection
                    </div>
                  </SelectItem>
                  <SelectItem value="lab">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Visit Lab
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitReschedule}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your {selectedBooking?.testName} appointment?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Cancellation Notice</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Cancelling this appointment cannot be undone. You may need to book again if required.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Track Your {selectedBooking?.testName}</DialogTitle>
            <DialogDescription>
              Real-time progress of your laboratory test
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{selectedBooking.testName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.date} at {selectedBooking.time}
                  </p>
                </div>
                <Badge className={
                  selectedBooking.status === "sample_collected" ? "bg-blue-500/10 text-blue-600" :
                  selectedBooking.status === "processing" ? "bg-yellow-500/10 text-yellow-600" :
                  "bg-green-500/10 text-green-600"
                }>
                  {selectedBooking.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-medium">Progress</span>
                  <span>{selectedBooking.trackingUpdates.length}/4 steps completed</span>
                </div>

                <div className="space-y-3">
                  {["Scheduled", "Sample Collected", "Processing", "Completed"].map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < selectedBooking.trackingUpdates.length
                          ? "bg-primary text-primary-foreground"
                          : index === selectedBooking.trackingUpdates.length
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {index < selectedBooking.trackingUpdates.length ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          index < selectedBooking.trackingUpdates.length ? "text-foreground" :
                          index === selectedBooking.trackingUpdates.length ? "text-blue-600" :
                          "text-muted-foreground"
                        }`}>
                          {step}
                        </p>
                        {index < selectedBooking.trackingUpdates.length && (
                          <p className="text-xs text-muted-foreground">
                            {selectedBooking.trackingUpdates[index]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBooking.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Test Completed</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your test results are ready. You can view them in your records.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}