import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Syringe, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Vaccination } from "@shared/schema";

interface VaccinationCardProps {
  vaccination: Vaccination;
  onEdit?: (vaccination: Vaccination) => void;
  onDelete?: (vaccination: Vaccination) => void;
}

export function VaccinationCard({ vaccination, onEdit, onDelete }: VaccinationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "overdue":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  // Derive status based on administered date and next due date
  const getVaccinationStatus = () => {
    if (vaccination.administeredDate) {
      return "completed";
    }
    if (vaccination.nextDueDate) {
      const nextDue = new Date(vaccination.nextDueDate);
      const now = new Date();
      return nextDue < now ? "overdue" : "scheduled";
    }
    return "scheduled";
  };

  const getNextDoseDate = () => {
    if (vaccination.nextDueDate) {
      return format(new Date(vaccination.nextDueDate), "MMM dd, yyyy");
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">{vaccination.vaccineName}</CardTitle>
          </div>
          <Badge className={getStatusColor(getVaccinationStatus())}>
            {getVaccinationStatus()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Dose</p>
            <p className="font-medium">{vaccination.doseNumber}/{vaccination.totalDoses}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date Given</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {vaccination.administeredDate ? format(new Date(vaccination.administeredDate), "MMM dd, yyyy") : "Not given"}
            </p>
          </div>
        </div>

        {vaccination.administeredBy && (
          <div>
            <p className="text-muted-foreground text-sm">Administered by</p>
            <p className="font-medium">{vaccination.administeredBy}</p>
          </div>
        )}

        {vaccination.batchNumber && (
          <div>
            <p className="text-muted-foreground text-sm">Batch Number</p>
            <p className="font-medium">{vaccination.batchNumber}</p>
          </div>
        )}

        {vaccination.nextDueDate && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next Dose:</strong> {getNextDoseDate()}
            </p>
          </div>
        )}

        {vaccination.notes && (
          <div>
            <p className="text-muted-foreground text-sm">Notes</p>
            <p className="text-sm">{vaccination.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
           <Button
             size="sm"
             variant="outline"
             className="flex-1"
             onClick={() => onEdit?.(vaccination)}
           >
             <Edit className="h-3 w-3 mr-1" />
             Edit
           </Button>
           <Button
             size="sm"
             variant="outline"
             className="text-red-600 hover:text-red-700"
             onClick={() => onDelete?.(vaccination)}
           >
             <Trash2 className="h-3 w-3" />
           </Button>
         </div>
      </CardContent>
    </Card>
  );
}