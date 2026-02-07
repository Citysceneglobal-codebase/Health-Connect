import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
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
  DollarSign,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  Receipt,
  BarChart3,
  PieChart,
  Users,
  FileText,
  ChevronLeft,
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface FinancialSummary {
  totalRevenue: number;
  cashPayments: number;
  digitalPayments: number;
  refunds: number;
  outstanding: number;
  breakdown: {
    consultations: number;
    procedures: number;
    medications: number;
    tests: number;
  };
}

interface RevenueByDoctor {
  doctorId: number;
  doctorName: string;
  revenue: number;
  appointmentCount: number;
}

interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface CashTransaction {
  id: string;
  billId: number;
  amount: number;
  receivedBy: string;
  notes?: string;
  type: string;
  timestamp: string;
  status: string;
}

interface OutstandingBill {
  id: number;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface InvoiceData {
  invoiceNumber: string;
  billId: number;
  date: string;
  patient: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  hospital: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  description: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}

export default function AdminFinancial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState("this_month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [cashPaymentDialog, setCashPaymentDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [selectedInvoiceBillId, setSelectedInvoiceBillId] = useState<number | null>(null);
  const [cashPaymentForm, setCashPaymentForm] = useState({
    amount: "",
    receivedBy: "",
    notes: ""
  });

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let from: Date, to: Date;

    switch (dateRange) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "this_week":
        from = new Date(now.setDate(now.getDate() - now.getDay()));
        to = new Date();
        break;
      case "this_month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date();
        break;
      case "this_year":
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date();
        break;
      case "custom":
        from = customDateFrom ? new Date(customDateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
        to = customDateTo ? new Date(customDateTo) : new Date();
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date();
    }

    return { from, to };
  };

  const { from: dateFrom, to: dateTo } = useMemo(() => getDateRange(), [dateRange, customDateFrom, customDateTo]);

  // API queries
  const { data: financialSummary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary", dateFrom.toISOString(), dateTo.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/financial/summary?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch financial summary");
      return response.json();
    }
  });

  const { data: revenueByDoctor, isLoading: revenueLoading } = useQuery<RevenueByDoctor[]>({
    queryKey: ["/api/financial/revenue-by-doctor", dateFrom.toISOString(), dateTo.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/financial/revenue-by-doctor?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch revenue by doctor");
      return response.json();
    }
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery<PaymentMethodBreakdown[]>({
    queryKey: ["/api/financial/payment-methods", dateFrom.toISOString(), dateTo.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/financial/payment-methods?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch payment methods");
      return response.json();
    }
  });

  const { data: cashTransactions, isLoading: cashTransactionsLoading } = useQuery<CashTransaction[]>({
    queryKey: ["/api/financial/cash-transactions", dateFrom.toISOString(), dateTo.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/financial/cash-transactions?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch cash transactions");
      return response.json();
    }
  });

  const { data: outstandingBills, isLoading: outstandingLoading } = useQuery<OutstandingBill[]>({
    queryKey: ["/api/financial/outstanding-bills"],
    queryFn: async () => {
      const response = await fetch('/api/financial/outstanding-bills');
      if (!response.ok) throw new Error("Failed to fetch outstanding bills");
      return response.json();
    }
  });

  // Query for invoice data
  const { data: invoiceData } = useQuery<InvoiceData>({
    queryKey: ["/api/financial/invoice", selectedInvoiceBillId],
    queryFn: async () => {
      if (!selectedInvoiceBillId) throw new Error("No bill selected");
      const response = await fetch(`/api/financial/invoice/${selectedInvoiceBillId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      return response.json();
    },
    enabled: !!selectedInvoiceBillId
  });


  const handleCashPayment = async () => {
    if (!selectedBillId || !cashPaymentForm.amount || !cashPaymentForm.receivedBy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/payments/cash/${selectedBillId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(cashPaymentForm.amount),
          receivedBy: cashPaymentForm.receivedBy,
          notes: cashPaymentForm.notes
        })
      });

      if (!response.ok) throw new Error("Failed to process cash payment");

      toast({
        title: "Payment Processed",
        description: "Cash payment has been recorded successfully.",
      });

      setCashPaymentDialog(false);
      setSelectedBillId(null);
      setCashPaymentForm({ amount: "", receivedBy: "", notes: "" });

      // Refresh data using query invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/financial/outstanding-bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/cash-transactions'] });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process cash payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Monitor revenue, payments, and financial reports</p>
        </div>
        <Button onClick={() => setCashPaymentDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Cash Payment
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === "custom" && (
              <>
                <div>
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `₹${(financialSummary?.totalRevenue || 0).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
            <p className="text-xs text-green-600">Revenue generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Banknote className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `₹${(financialSummary?.cashPayments || 0).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Cash Payments</p>
              </div>
            </div>
            <p className="text-xs text-blue-600">Cash transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `₹${(financialSummary?.digitalPayments || 0).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Digital Payments</p>
              </div>
            </div>
            <p className="text-xs text-purple-600">Online transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `₹${(financialSummary?.outstanding || 0).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
            </div>
            <p className="text-xs text-orange-600">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="cash">Cash Transactions</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consultations</span>
                    <span className="font-medium">₹{(financialSummary?.breakdown?.consultations || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Procedures</span>
                    <span className="font-medium">₹{(financialSummary?.breakdown?.procedures || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medications</span>
                    <span className="font-medium">₹{(financialSummary?.breakdown?.medications || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tests</span>
                    <span className="font-medium">₹{(financialSummary?.breakdown?.tests || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Doctor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Revenue by Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {revenueByDoctor?.map((doctor) => (
                    <div key={doctor.doctorId} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{doctor.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{doctor.appointmentCount} appointments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{doctor.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.appointmentCount > 0 ? `₹${(doctor.revenue / doctor.appointmentCount).toFixed(0)} avg` : 'No appointments'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Methods Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethodsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods?.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.method)}
                        <div>
                          <p className="font-medium">{method.method}</p>
                          <p className="text-sm text-muted-foreground">{method.transactionCount} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{method.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{method.percentage?.toFixed(1) || '0.0'}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Cash Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cashTransactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {cashTransactions?.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-green-500" />
                          <span className="font-medium">₹{transaction.amount.toLocaleString()}</span>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(transaction.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Received by: {transaction.receivedBy}</p>
                        {transaction.notes && <p>Notes: {transaction.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Outstanding Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outstandingLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {outstandingBills?.map((bill) => (
                    <div key={bill.id} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Bill #{bill.id}</p>
                          <p className="text-sm text-muted-foreground">{bill.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{bill.amount}</p>
                          <Badge variant="outline" className="text-orange-600">
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Due: {format(new Date(bill.createdAt), "MMM d, yyyy")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvoiceBillId(bill.id);
                              setInvoiceDialog(true);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBillId(bill.id);
                              setCashPaymentForm({
                                amount: bill.amount.toString(),
                                receivedBy: "",
                                notes: `Payment for ${bill.description}`
                              });
                              setCashPaymentDialog(true);
                            }}
                          >
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cash Payment Dialog */}
      <Dialog open={cashPaymentDialog} onOpenChange={setCashPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Cash Payment</DialogTitle>
            <DialogDescription>
              Record a cash payment for an outstanding bill.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={cashPaymentForm.amount}
                onChange={(e) => setCashPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Received By</Label>
              <Input
                value={cashPaymentForm.receivedBy}
                onChange={(e) => setCashPaymentForm(prev => ({ ...prev, receivedBy: e.target.value }))}
                placeholder="Enter staff name"
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={cashPaymentForm.notes}
                onChange={(e) => setCashPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCashPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Print Dialog */}
      <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice
            </DialogTitle>
          </DialogHeader>
          {invoiceData ? (
            <div className="invoice-print" id="invoice-content">
              {/* Invoice Header */}
              <div className="text-center border-b pb-4 mb-4">
                <h1 className="text-2xl font-bold text-primary">{invoiceData.hospital.name}</h1>
                <p className="text-sm text-muted-foreground">{invoiceData.hospital.address}</p>
                <p className="text-sm text-muted-foreground">Phone: {invoiceData.hospital.phone} | Email: {invoiceData.hospital.email}</p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">INVOICE NUMBER</h3>
                  <p className="text-lg font-medium">{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-sm text-muted-foreground">DATE</h3>
                  <p className="text-lg font-medium">{format(new Date(invoiceData.date), "MMM d, yyyy")}</p>
                </div>
              </div>

              {/* Patient Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">BILL TO</h3>
                <p className="font-medium">{invoiceData.patient.name}</p>
                <p className="text-sm text-muted-foreground">{invoiceData.patient.email}</p>
                <p className="text-sm text-muted-foreground">{invoiceData.patient.phone}</p>
                <p className="text-sm text-muted-foreground">{invoiceData.patient.address}</p>
              </div>

              {/* Bill Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIPTION</h3>
                <p className="text-sm">{invoiceData.description}</p>
              </div>

              {/* Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{invoiceData.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="font-medium capitalize">{invoiceData.status}</span>
                    </p>
                    {invoiceData.paymentMethod && (
                      <p className="text-sm text-muted-foreground">
                        Payment Method: <span className="font-medium capitalize">{invoiceData.paymentMethod}</span>
                      </p>
                    )}
                    {invoiceData.paidAt && (
                      <p className="text-sm text-muted-foreground">
                        Paid On: {format(new Date(invoiceData.paidAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                  <Badge variant={invoiceData.status === 'paid' ? 'default' : 'outline'} className={invoiceData.status === 'paid' ? 'bg-green-500' : 'text-orange-600'}>
                    {invoiceData.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                <p>Thank you for choosing {invoiceData.hospital.name}</p>
                <p className="text-xs mt-1">This is a computer generated invoice</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Skeleton className="h-32 w-full" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialog(false)}>
              Close
            </Button>
            <Button onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          .invoice-print {
            padding: 20px;
            background: white;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}