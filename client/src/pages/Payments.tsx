import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Smartphone,
  Banknote,
  Filter,
  Search,
  Receipt,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Bill, FamilyMember } from "@shared/schema";

type Payment = {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  invoiceId: string;
  familyMember: string;
  refundEligible: boolean;
  paymentMethod: string;
};

export default function Payments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [familyMemberFilter, setFamilyMemberFilter] = useState("all");

  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const { data: familyMembers } = useQuery<FamilyMember[]>({
    queryKey: ["/api/family-members"],
  });

  const { data: paymentConfig } = useQuery({
    queryKey: ["/api/payments/config"],
  });

  const queryClient = useQueryClient();

  // Payment mutations
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: number; currency?: string; metadata?: any }) => {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create payment intent");
      return response.json();
    },
  });

  const processBillPaymentMutation = useMutation({
    mutationFn: async (data: { billId: number; paymentMethod: string }) => {
      const response = await fetch(`/api/payments/bill/${data.billId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: data.paymentMethod }),
      });
      if (!response.ok) throw new Error("Failed to process bill payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async (data: { billId: number; amount: number; reason?: string }) => {
      const response = await fetch(`/api/payments/refund/${data.billId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data.amount, reason: data.reason }),
      });
      if (!response.ok) throw new Error("Failed to process refund");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Refund Processed",
        description: "Your refund has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock data for when API is not available
  const mockPayments = [
    {
      id: "1",
      date: "2023-06-10",
      service: "Consultation - Dr. John Smith",
      amount: 75.00,
      status: "paid" as const,
      invoiceId: "INV-2023-001",
      familyMember: "Self",
      refundEligible: false,
      paymentMethod: "UPI"
    },
    {
      id: "2",
      date: "2023-06-05",
      service: "Lab Test - CBC",
      amount: 25.00,
      status: "paid" as const,
      invoiceId: "INV-2023-002",
      familyMember: "Daughter",
      refundEligible: false,
      paymentMethod: "Card"
    },
    {
      id: "3",
      date: "2023-06-15",
      service: "Vaccination - Flu Shot",
      amount: 35.00,
      status: "pending" as const,
      invoiceId: "INV-2023-003",
      familyMember: "Self",
      refundEligible: true,
      paymentMethod: "Wallet"
    },
    {
      id: "4",
      date: "2023-05-28",
      service: "Prescription Refill",
      amount: 45.00,
      status: "paid" as const,
      invoiceId: "INV-2023-004",
      familyMember: "Spouse",
      refundEligible: false,
      paymentMethod: "Net Banking"
    },
    {
      id: "5",
      date: "2023-06-12",
      service: "Radiology - X-Ray",
      amount: 120.00,
      status: "refunded" as const,
      invoiceId: "INV-2023-005",
      familyMember: "Self",
      refundEligible: true,
      paymentMethod: "UPI"
    },
  ];

  const payments = bills?.map(bill => ({
    id: bill.id.toString(),
    date: new Date(bill.createdAt!).toISOString().split('T')[0],
    service: bill.description || "Medical Service",
    amount: Number(bill.amount),
    status: bill.status as "paid" | "pending" | "refunded",
    invoiceId: `INV-${bill.id}`,
    familyMember: "Self",
    refundEligible: bill.status === "pending" || bill.status === "refunded",
    paymentMethod: bill.paymentMethod || "UPI"
  })) || mockPayments;

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchQuery ||
      payment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesFamilyMember = familyMemberFilter === "all" || payment.familyMember === familyMemberFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        case "quarter":
          matchesDate = daysDiff <= 90;
          break;
        case "year":
          matchesDate = daysDiff <= 365;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate && matchesFamilyMember;
  });

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: Payment["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "refunded":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Digital Payments</h1>
          <p className="text-muted-foreground">
            View and manage your payment history and invoices
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments by service or invoice..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={familyMemberFilter} onValueChange={setFamilyMemberFilter}>
            <SelectTrigger className="w-[140px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Family Member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="Self">Self</SelectItem>
              {familyMembers?.map(member => (
                <SelectItem key={member.id} value={member.relationship}>
                  {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${filteredPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Filtered results</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${filteredPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredPayments.filter(p => p.status === "pending").length} payment{filteredPayments.filter(p => p.status === "pending").length !== 1 ? 's' : ''} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Card, UPI, Wallet</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your past payments and download invoices ({filteredPayments.length} results)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Family Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{payment.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>{payment.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.familyMember}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge variant={getStatusVariant(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                          {payment.refundEligible && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Refund Eligible
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{payment.paymentMethod}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.invoiceId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Download Started",
                                description: `Downloading PDF receipt for ${payment.invoiceId}`,
                              });
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Receipt Generated",
                                description: `Receipt for ${payment.invoiceId} is ready`,
                              });
                            }}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
            <CardDescription>
              Pay for upcoming services or outstanding balances using multiple payment options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Digital Wallet</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pay using Paytm, Google Pay, or PhonePe
                </p>
                <Select onValueChange={(walletType) => {
                  const pendingBills = bills?.filter(b => b.status === 'pending') || [];
                  if (pendingBills.length > 0) {
                    processBillPaymentMutation.mutate({
                      billId: pendingBills[0].id,
                      paymentMethod: `wallet_${walletType}`,
                    });
                  } else {
                    toast({
                      title: "No Pending Bills",
                      description: "You don't have any pending bills to pay.",
                    });
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paytm">Paytm</SelectItem>
                    <SelectItem value="gpay">Google Pay</SelectItem>
                    <SelectItem value="phonepe">PhonePe</SelectItem>
                    <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">UPI</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Unified Payments Interface for instant transfer
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={processBillPaymentMutation.isPending}
                  onClick={() => {
                    const pendingBills = bills?.filter(b => b.status === 'pending') || [];
                    if (pendingBills.length > 0) {
                      processBillPaymentMutation.mutate({
                        billId: pendingBills[0].id,
                        paymentMethod: 'upi',
                      });
                    } else {
                      toast({
                        title: "No Pending Bills",
                        description: "You don't have any pending bills to pay.",
                      });
                    }
                  }}
                >
                  {processBillPaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  Pay with UPI
                </Button>
              </div>

              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Card/Net Banking</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Credit/Debit cards and online banking
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={processBillPaymentMutation.isPending}
                  onClick={() => {
                    const pendingBills = bills?.filter(b => b.status === 'pending') || [];
                    if (pendingBills.length > 0) {
                      processBillPaymentMutation.mutate({
                        billId: pendingBills[0].id,
                        paymentMethod: 'card',
                      });
                    } else {
                      toast({
                        title: "No Pending Bills",
                        description: "You don't have any pending bills to pay.",
                      });
                    }
                  }}
                >
                  {processBillPaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pay with Card
                </Button>
              </div>

              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Insurance</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit claim to your insurance provider
                </p>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pending Amount</p>
                    <p className="font-medium text-orange-600">${filteredPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Due Date</p>
                    <p className="font-medium">
                      {filteredPayments.filter(p => p.status === "pending").length > 0 ? "Within 7 days" : "No pending payments"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Refund Eligible</p>
                    <p className="font-medium text-green-600">
                      {filteredPayments.filter(p => p.refundEligible).length} payment{filteredPayments.filter(p => p.refundEligible).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auto-refund Policy</p>
                    <p className="font-medium text-blue-600">24-48 hours</p>
                  </div>
                </div>
              </div>

              {filteredPayments.filter(p => p.refundEligible).length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Auto-Refund Available</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    {filteredPayments.filter(p => p.refundEligible).length} of your payments are eligible for automatic refund.
                    Refunds are processed within 24-48 hours for cancelled appointments and failed transactions.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={processRefundMutation.isPending}
                    onClick={() => {
                      const refundablePayments = filteredPayments.filter(p => p.refundEligible);
                      if (refundablePayments.length > 0) {
                        // Process refund for the first refundable payment
                        const billId = parseInt(refundablePayments[0].id);
                        const amount = refundablePayments[0].amount;
                        processRefundMutation.mutate({
                          billId,
                          amount,
                          reason: "customer_request",
                        });
                      }
                    }}
                  >
                    {processRefundMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Process Refunds
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}