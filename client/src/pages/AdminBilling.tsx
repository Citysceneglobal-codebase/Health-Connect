import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
  CreditCard,
  DollarSign,
  Search,
  Download,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function AdminBilling() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Mock transactions data with local state
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      patientId: "patient-1",
      patientName: "John Doe",
      amount: 150.00,
      status: "paid",
      date: new Date(),
      service: "Consultation",
      paymentMethod: "Credit Card",
      description: "Regular consultation fee"
    },
    {
      id: 2,
      patientId: "patient-2",
      patientName: "Jane Smith",
      amount: 200.00,
      status: "pending",
      date: new Date(Date.now() - 86400000),
      service: "Lab Tests",
      paymentMethod: "Insurance",
      description: "Blood work and analysis"
    },
    {
      id: 3,
      patientId: "patient-3",
      patientName: "Bob Wilson",
      amount: 75.00,
      status: "refunded",
      date: new Date(Date.now() - 172800000),
      service: "Follow-up",
      paymentMethod: "Cash",
      description: "Follow-up consultation"
    },
    {
      id: 4,
      patientId: "patient-4",
      patientName: "Alice Brown",
      amount: 300.00,
      status: "paid",
      date: new Date(Date.now() - 259200000),
      service: "Surgery",
      paymentMethod: "Credit Card",
      description: "Minor surgical procedure"
    },
    {
      id: 5,
      patientId: "patient-5",
      patientName: "Charlie Davis",
      amount: 120.00,
      status: "paid",
      date: new Date(Date.now() - 345600000),
      service: "Dental",
      paymentMethod: "Credit Card",
      description: "Dental cleaning and checkup"
    },
    {
      id: 6,
      patientId: "patient-6",
      patientName: "Diana Evans",
      amount: 180.00,
      status: "pending",
      date: new Date(Date.now() - 432000000),
      service: "Physical Therapy",
      paymentMethod: "Insurance",
      description: "Physical therapy session"
    },
    {
      id: 7,
      patientId: "patient-7",
      patientName: "Frank Garcia",
      amount: 95.00,
      status: "paid",
      date: new Date(Date.now() - 518400000),
      service: "Vaccination",
      paymentMethod: "Cash",
      description: "Flu vaccination"
    },
    {
      id: 8,
      patientId: "patient-8",
      patientName: "Grace Taylor",
      amount: 250.00,
      status: "pending",
      date: new Date(Date.now() - 604800000),
      service: "MRI Scan",
      paymentMethod: "Insurance",
      description: "Magnetic resonance imaging"
    },
    {
      id: 9,
      patientId: "patient-9",
      patientName: "Henry Brown",
      amount: 85.00,
      status: "refunded",
      date: new Date(Date.now() - 691200000),
      service: "X-Ray",
      paymentMethod: "Credit Card",
      description: "Chest X-ray examination"
    },
    {
      id: 10,
      patientId: "patient-10",
      patientName: "Iris Chen",
      amount: 160.00,
      status: "paid",
      date: new Date(Date.now() - 777600000),
      service: "Consultation",
      paymentMethod: "Credit Card",
      description: "Specialist consultation"
    }
  ]);

  // Calculate statistics
  const totalRevenue = transactions
    .filter(t => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const paidCount = transactions.filter(t => t.status === "paid").length;
  const pendingCount = transactions.filter(t => t.status === "pending").length;
  const refundedTotal = transactions
    .filter(t => t.status === "refunded")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newTransaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      patientId: `patient-${Date.now()}`,
      patientName: "New Patient",
      amount: 100.00,
      status: "pending",
      date: new Date(),
      service: "Consultation",
      paymentMethod: "Credit Card",
      description: "New consultation"
    };

    setTransactions(prev => [...prev, newTransaction]);
    setDialogOpen(false);

    toast({
      title: "Transaction Added",
      description: "The transaction has been added successfully.",
    });
  };

  const handleEditTransaction = async () => {
    if (!selectedTransaction) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTransactions(prev => prev.map(t =>
      t.id === selectedTransaction.id ? { ...selectedTransaction, updatedAt: new Date() } : t
    ));

    setEditDialogOpen(false);
    setSelectedTransaction(null);

    toast({
      title: "Transaction Updated",
      description: "Transaction information has been updated successfully.",
    });
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);

    toast({
      title: "Transaction Deleted",
      description: "Transaction has been removed from the system.",
    });
  };

  const handleProcessPayment = async (transactionId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTransactions(prev => prev.map(t =>
      t.id === transactionId ? { ...t, status: "paid", updatedAt: new Date() } : t
    ));

    toast({
      title: "Payment Processed",
      description: "The transaction has been marked as paid.",
    });
  };

  const handleRefundTransaction = async (transactionId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTransactions(prev => prev.map(t =>
      t.id === transactionId ? { ...t, status: "refunded", updatedAt: new Date() } : t
    ));

    toast({
      title: "Refund Processed",
      description: "The transaction has been refunded.",
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === "" ||
      transaction.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesMethod = methodFilter === "all" || transaction.paymentMethod.toLowerCase().replace(" ", "") === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "refunded":
        return <Receipt className="h-4 w-4 text-blue-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

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
          <h1 className="text-2xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">Monitor transactions, manage invoices, and handle refunds</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-transaction">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Create a new billing transaction for a patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input id="patient-name" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="service">Service</Label>
                <Input id="service" placeholder="Consultation, Lab Tests, etc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" placeholder="100.00" />
                </div>
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Transaction details" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>
                Add Transaction
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
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{paidCount}</p>
                <p className="text-xs text-muted-foreground">Paid Invoices</p>
              </div>
            </div>
            <p className="text-xs text-blue-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">${refundedTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Refunds</p>
              </div>
            </div>
            <p className="text-xs text-purple-600">This month</p>
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
                  placeholder="Search transactions..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium text-sm">
                          {format(transaction.date, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{transaction.patientName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="font-bold">${transaction.amount.toFixed(2)}</p>
                      <Badge variant={getStatusBadgeVariant(transaction.status)} className="mt-1">
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setEditDialogOpen(true);
                        }}
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {transaction.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessPayment(transaction.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Pay
                        </Button>
                      )}
                      {transaction.status === "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefundTransaction(transaction.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Refund
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction information and status.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label>Patient Name</Label>
                <Input
                  value={selectedTransaction.patientName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTransaction((prev: any) => prev ? {
                    ...prev,
                    patientName: e.target.value
                  } : null)}
                />
              </div>
              <div>
                <Label>Service</Label>
                <Input
                  value={selectedTransaction.service}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTransaction((prev: any) => prev ? {
                    ...prev,
                    service: e.target.value
                  } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    value={selectedTransaction.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTransaction((prev: any) => prev ? {
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    } : null)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedTransaction.status}
                    onValueChange={(value) => setSelectedTransaction((prev: any) => prev ? {
                      ...prev,
                      status: value as "paid" | "pending" | "refunded"
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={selectedTransaction.paymentMethod.toLowerCase().replace(" ", "")}
                  onValueChange={(value) => setSelectedTransaction((prev: any) => prev ? {
                    ...prev,
                    paymentMethod: value === "credit" ? "Credit Card" :
                                   value === "insurance" ? "Insurance" : "Cash"
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={selectedTransaction.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTransaction((prev: any) => prev ? {
                    ...prev,
                    description: e.target.value
                  } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTransaction}>
              Update Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction for {selectedTransaction?.patientName}?
              This action cannot be undone and will permanently remove the transaction from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}