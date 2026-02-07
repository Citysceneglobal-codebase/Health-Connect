import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

export default function DoctorDocumentReview() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const { data: pendingDocuments, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/doctor/documents/pending"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ documentId, status, notes }: { documentId: number; status: string; notes: string }) => {
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes })
      });
      if (!response.ok) throw new Error("Failed to update document status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/documents/pending"] });
      toast({
        title: "Document Updated",
        description: "Document status has been updated successfully.",
      });
      setReviewDialogOpen(false);
      setSelectedDocument(null);
      setReviewNotes("");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update document status.",
        variant: "destructive",
      });
    },
  });

  const handleReview = (document: Document) => {
    setSelectedDocument(document);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const handleView = (document: Document) => {
    setViewingDocument(document);
    setViewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedDocument) return;
    updateStatusMutation.mutate({
      documentId: selectedDocument.id,
      status: "approved",
      notes: reviewNotes
    });
  };

  const handleReject = () => {
    if (!selectedDocument) return;
    updateStatusMutation.mutate({
      documentId: selectedDocument.id,
      status: "reviewed", // Could add a "rejected" status if needed
      notes: reviewNotes
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned_to_doctor":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "reviewed":
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "assigned_to_doctor":
        return "secondary";
      case "reviewed":
        return "outline";
      case "approved":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground">
            Review and approve medical documents and lab reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingDocuments?.filter(d => d.status === "assigned_to_doctor").length || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingDocuments?.filter(d => d.status === "reviewed").length || 0}</p>
                  <p className="text-xs text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingDocuments?.filter(d => d.status === "approved").length || 0}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents Requiring Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : pendingDocuments && pendingDocuments.length > 0 ? (
              <div className="space-y-4">
                {pendingDocuments.map(document => (
                  <Card key={document.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(document.status)}
                            <div>
                              <p className="font-medium text-sm">{document.type.replace('_', ' ').toUpperCase()}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(document.createdAt!), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{document.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {document.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getStatusBadgeVariant(document.status)}>
                                {document.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(document)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {document.status !== "approved" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReview(document)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents require review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review and approve or request changes for this document.
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedDocument.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(selectedDocument.createdAt!), "MMM d, yyyy")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  placeholder="Add any notes about your review..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[80px] mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {updateStatusMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewingDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Document details and content preview
            </DialogDescription>
          </DialogHeader>

          {viewingDocument && (
            <div className="space-y-6">
              {/* Document Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm">{viewingDocument.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusBadgeVariant(viewingDocument.status)}>
                    {viewingDocument.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Uploaded Date</label>
                  <p className="text-sm">
                    {format(new Date(viewingDocument.createdAt!), "PPP")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm">
                    {viewingDocument.updatedAt ? format(new Date(viewingDocument.updatedAt), "PPP") : "N/A"}
                  </p>
                </div>
              </div>

              {/* Document Description */}
              {viewingDocument.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingDocument.description}
                  </p>
                </div>
              )}

              {/* Simulated Report Content */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center justify-center h-96 bg-muted/30 rounded border-2 border-dashed">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      This is a preview of "{viewingDocument.title}"
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Type:</strong> {viewingDocument.type.replace('_', ' ')}</p>
                      <p><strong>Status:</strong> {viewingDocument.status.replace('_', ' ')}</p>
                      <p><strong>Document ID:</strong> {viewingDocument.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Download Started",
                      description: `Downloading ${viewingDocument.title}...`,
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}