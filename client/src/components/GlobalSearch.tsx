import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  Stethoscope,
  FileText,
  Pill,
  Calendar,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  type: 'doctor' | 'department' | 'medicine' | 'symptom' | 'appointment' | 'document' | 'report' | 'visit';
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  url: string;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search data - in real app, this would come from API
  const mockDoctors = [
    { id: "1", name: "Dr. John Smith", specialty: "Cardiology", department: "Heart Care" },
    { id: "2", name: "Dr. Sarah Johnson", specialty: "Dermatology", department: "Skin Care" },
    { id: "3", name: "Dr. Michael Brown", specialty: "Orthopedics", department: "Bone & Joint" },
  ];

  const mockMedicines = [
    { id: "1", name: "Amlodipine", category: "Cardiovascular" },
    { id: "2", name: "Metformin", category: "Diabetes" },
    { id: "3", name: "Ibuprofen", category: "Pain Relief" },
  ];

  const mockDepartments = [
    { id: "1", name: "Cardiology", description: "Heart and cardiovascular care" },
    { id: "2", name: "Dermatology", description: "Skin and hair care" },
    { id: "3", name: "Orthopedics", description: "Bone and joint care" },
  ];

  const mockAppointments = [
    { id: "1", reason: "Annual Checkup", date: "2023-06-15", doctor: "Dr. John Smith", status: "completed" },
    { id: "2", reason: "Follow-up Consultation", date: "2023-06-20", doctor: "Dr. Sarah Johnson", status: "scheduled" },
    { id: "3", reason: "Blood Test Review", date: "2023-06-10", doctor: "Dr. Michael Brown", status: "completed" },
  ];

  const mockDocuments = [
    { id: "1", title: "CBC Blood Test Report", type: "lab_report", date: "2023-06-10" },
    { id: "2", title: "Chest X-Ray Results", type: "radiology", date: "2023-06-08" },
    { id: "3", title: "Prescription - Hypertension", type: "prescription", date: "2023-06-15" },
    { id: "4", title: "Cardiac Consultation Notes", type: "visit_summary", date: "2023-06-12" },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search doctors
    mockDoctors.forEach(doctor => {
      if (doctor.name.toLowerCase().includes(searchTerm) ||
          doctor.specialty.toLowerCase().includes(searchTerm) ||
          doctor.department.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'doctor',
          id: doctor.id,
          title: doctor.name,
          subtitle: `${doctor.specialty} • ${doctor.department}`,
          icon: <Stethoscope className="h-4 w-4" />,
          url: `/appointments/book?doctor=${doctor.id}`
        });
      }
    });

    // Search departments
    mockDepartments.forEach(dept => {
      if (dept.name.toLowerCase().includes(searchTerm) ||
          dept.description.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'department',
          id: dept.id,
          title: dept.name,
          subtitle: dept.description,
          icon: <MapPin className="h-4 w-4" />,
          url: `/appointments/book?department=${dept.id}`
        });
      }
    });

    // Search medicines
    mockMedicines.forEach(medicine => {
      if (medicine.name.toLowerCase().includes(searchTerm) ||
          medicine.category.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'medicine',
          id: medicine.id,
          title: medicine.name,
          subtitle: medicine.category,
          icon: <Pill className="h-4 w-4" />,
          url: `/medicines/${medicine.id}`
        });
      }
    });

    // Search appointments/visits
    mockAppointments.forEach(appointment => {
      if (appointment.reason.toLowerCase().includes(searchTerm) ||
          appointment.doctor.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'visit',
          id: appointment.id,
          title: appointment.reason,
          subtitle: `${appointment.doctor} • ${appointment.date} • ${appointment.status}`,
          icon: <Calendar className="h-4 w-4" />,
          url: `/appointments/${appointment.id}`
        });
      }
    });

    // Search documents/reports
    mockDocuments.forEach(document => {
      if (document.title.toLowerCase().includes(searchTerm) ||
          document.type.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'report',
          id: document.id,
          title: document.title,
          subtitle: `${document.type.replace('_', ' ')} • ${document.date}`,
          icon: <FileText className="h-4 w-4" />,
          url: `/records/${document.id}`
        });
      }
    });

    // Add common symptoms search
    const symptoms = [
      "Chest Pain", "Headache", "Fever", "Cough", "Fatigue",
      "Shortness of Breath", "Abdominal Pain", "Joint Pain", "Skin Rash"
    ];

    symptoms.forEach(symptom => {
      if (symptom.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'symptom',
          id: symptom.toLowerCase().replace(/\s+/g, '-'),
          title: symptom,
          subtitle: "Common symptom - find related doctors",
          icon: <User className="h-4 w-4" />,
          url: `/appointments/book?symptom=${encodeURIComponent(symptom)}`
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    // In a real app, this would navigate to the URL
    console.log('Navigate to:', result.url);
    onOpenChange(false);
    setQuery("");
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'doctor': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'department': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'medicine': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'symptom': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'visit': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'report': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
      case 'appointment': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
      case 'document': return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Smart Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors, departments, medicines, symptoms, reports, visits..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-lg"
            autoFocus
          />
        </div>

        {query && (
          <ScrollArea className="max-h-96">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(result.type)}`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for doctors, departments, medicines, symptoms, reports, or visits
                </p>
              </div>
            )}
          </ScrollArea>
        )}

        {!query && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start typing to search...</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Badge variant="secondary" className="cursor-pointer hover:bg-muted"
                     onClick={() => setQuery("cardiology")}>
                Cardiology
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-muted"
                     onClick={() => setQuery("headache")}>
                Headache
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-muted"
                     onClick={() => setQuery("blood test")}>
                Blood Test
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-muted"
                     onClick={() => setQuery("checkup")}>
                Checkup
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-muted"
                     onClick={() => setQuery("x-ray")}>
                X-Ray
              </Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}