'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Send,
  Download,
  Filter,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

interface Order {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  currency_code: string;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  status: string;
  email_dispatch_status: string;
  email_dispatch_attempts: number;
  email_dispatch_error: string | null;
  created_at: string;
  updated_at: string;
  item_count: number;
  total_items: number;
}

export default function AdminClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [emailActionLoading, setEmailActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('paid');
  const [showFilters, setShowFilters] = useState(false);
  const { success, error } = useToast();

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Download CSV function
  const downloadCSV = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase.rpc(
        'export_admin_orders_csv'
      );

      if (fetchError) {
        error('Failed to export data', fetchError.message);
        console.error('Export error:', fetchError);
        return;
      }

      if (!data || data.length === 0) {
        error('No data to export');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row: Record<string, unknown>) =>
          headers
            .map(
              (header) => `"${String(row[header] || '').replace(/"/g, '""')}"`
            )
            .join(',')
        ),
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      success('Data exported successfully!');
    } catch (err) {
      error('Failed to export data');
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when status filter changes
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, isAuthenticated]);

  const handleAuth = async () => {
    setAuthError('');
    try {
      const { data, error: authError } = await supabase.rpc(
        'verify_staff_pin',
        {
          p_pin: pin,
        }
      );

      if (authError) {
        setAuthError('Authentication failed. Please try again.');
        return;
      }

      if (data === true) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        loadOrders();
      } else {
        setAuthError('Invalid PIN. Please try again.');
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPin('');
    setOrders([]);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } =
        await supabase.rpc('get_admin_orders');
      if (fetchError) {
        error('Failed to load orders', fetchError.message);
        console.error('Error loading orders:', fetchError);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      error('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchOrders = async () => {
    if (!searchQuery.trim()) {
      loadOrders();
      return;
    }

    setLoading(true);
    try {
      const { data, error: searchError } = await supabase.rpc(
        'search_admin_orders',
        {
          p_search_query: searchQuery.trim(),
        }
      );
      if (searchError) {
        error('Failed to search orders', searchError.message);
        console.error('Error searching orders:', searchError);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      error('Failed to search orders');
      console.error('Error searching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async () => {
    if (!selectedOrder) return;

    setEmailActionLoading(true);
    try {
      // First update customer information if provided
      if (newEmail || newName || newPhone) {
        const { error: updateError } = await supabase.rpc(
          'update_customer_for_resend',
          {
            p_customer_id: selectedOrder.customer_id,
            p_new_email: newEmail || selectedOrder.customer_email,
            p_new_name: newName || selectedOrder.customer_name,
            p_new_phone: newPhone || selectedOrder.customer_phone || undefined,
          }
        );

        if (updateError) {
          error('Failed to update customer information', updateError.message);
          console.error('Error updating customer:', updateError);
          return;
        }
      }

      // Reset email dispatch status to allow sending/resending
      const { error: resetError } = await supabase.rpc(
        'reset_email_dispatch_status',
        {
          p_order_id: selectedOrder.order_id,
        }
      );

      if (resetError) {
        error('Failed to reset email status', resetError.message);
        console.error('Error resetting email status:', resetError);
        return;
      }

      // Trigger email send
      const { error: emailError } = await supabase.functions.invoke(
        'send-order-confirmation',
        {
          body: { order_id: selectedOrder.order_id },
        }
      );

      if (emailError) {
        error('Failed to send email', emailError.message);
        console.error('Error sending email:', emailError);
        return;
      }

      const isFirstTime =
        selectedOrder.email_dispatch_status === 'PENDING' ||
        selectedOrder.email_dispatch_attempts === 0;
      success(
        isFirstTime ? 'Email sent successfully!' : 'Email resent successfully!'
      );
      setIsEmailDialogOpen(false);
      setSelectedOrder(null);
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      loadOrders(); // Refresh the list
    } catch (err) {
      error('Failed to send email');
      console.error('Error sending email:', err);
    } finally {
      setEmailActionLoading(false);
    }
  };

  const openEmailDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewEmail(order.customer_email);
    setNewName(order.customer_name);
    setNewPhone(order.customer_phone || '');
    setIsEmailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT_SUCCESSFULLY':
        return (
          <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-sm min-w-[80px] justify-center text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 'DISPATCH_FAILED':
        return (
          <Badge className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 rounded-sm min-w-[80px] justify-center text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'DISPATCH_IN_PROGRESS':
        return (
          <Badge className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 rounded-sm min-w-[80px] justify-center text-xs">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 rounded-sm min-w-[80px] justify-center text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-900/30 text-gray-300 border-gray-700 rounded-sm min-w-[80px] justify-center text-xs">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-sm text-xs">
            Paid
          </Badge>
        );
      case 'pending_payment':
        return (
          <Badge className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 rounded-sm text-xs">
            Pending
          </Badge>
        );
      case 'payment_failed':
        return (
          <Badge className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 rounded-sm text-xs">
            Failed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 rounded-sm text-xs">
            Processing
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 rounded-sm text-xs">
            Shipped
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 rounded-sm text-xs">
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 rounded-sm text-xs">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-zinc-900/90 dark:bg-black/50 text-zinc-100 dark:text-sage-100 border-zinc-800 rounded-sm text-xs">
            {status}
          </Badge>
        );
    }
  };

  const canSendEmail = (order: Order) => {
    // Allow sending if payment is paid, or if it's pending but customer wants to receive the email anyway
    return order.status === 'paid' || order.status === 'pending_payment';
  };

  const getEmailButtonText = (order: Order) => {
    const isFirstTime =
      order.email_dispatch_status === 'PENDING' ||
      order.email_dispatch_attempts === 0;
    return isFirstTime ? 'Send Email' : 'Resend Email';
  };

  const getEmailButtonIcon = (order: Order) => {
    const isFirstTime =
      order.email_dispatch_status === 'PENDING' ||
      order.email_dispatch_attempts === 0;
    return isFirstTime ? Send : Mail;
  };

  // Filter orders by status only (for table display)
  const statusFilteredOrders = orders.filter((order) => {
    if (statusFilter === 'paid' && order.status !== 'paid') return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending' && order.status !== 'pending_payment')
      return false;
    if (statusFilter === 'failed' && order.status !== 'payment_failed')
      return false;
    return true;
  });

  // Filter orders by status AND search (for table display)
  const filteredOrders = statusFilteredOrders.filter((order) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_email?.toLowerCase().includes(query) ||
      order.order_number?.toLowerCase().includes(query) ||
      order.order_id.toLowerCase().includes(query)
    );
  });

  // Calculate stats from PAID orders only
  const stats = {
    total_orders: orders.filter((o) => o.status === 'paid').length,
    total_revenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + Number(o.total_amount), 0),
    pending_orders: orders.filter((o) => o.status === 'pending_payment').length,
    failed_orders: orders.filter((o) => o.status === 'payment_failed').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-100">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter your PIN to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-gray-200">
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Enter PIN"
                className="rounded-sm bg-background border-slate-700 text-gray-100 placeholder:text-gray-400"
              />
            </div>
            {authError && (
              <div className="rounded-sm border border-red-700 bg-red-900/30 p-3 text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{authError}</span>
                </div>
              </div>
            )}
            <Button
              onClick={handleAuth}
              className="w-full rounded-sm"
              disabled={!pin.trim()}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-4 sm:pt-12 mb-6 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
            <div className="flex-1 max-w-4xl">
              <h1 className="text-3xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-white mb-3 sm:mb-6">
                Admin panel
              </h1>
              <p className="text-zinc-200 text-sm sm:text-base md:text-xl leading-relaxed tracking-tight max-w-3xl">
                Manage orders, track email dispatch status, and oversee sales
                for KYS Factory.
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 shrink-0 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="rounded-sm border-slate-700 bg-purple-900/20">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-purple-300">Total Orders</div>
                <div className="text-xl sm:text-2xl font-bold text-purple-100">
                  {stats.total_orders}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-slate-700 bg-blue-900/20">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-blue-300">Total Revenue</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-100">
                  {stats.total_revenue.toLocaleString()} XOF
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-slate-700 bg-orange-900/20">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-orange-300">Pending</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-100">
                  {stats.pending_orders}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-slate-700 bg-red-900/20">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-red-300">Failed</div>
                <div className="text-xl sm:text-2xl font-bold text-red-100">
                  {stats.failed_orders}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full space-y-6">
          {/* Filters and Search */}
          <div className="mb-6 sm:mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-200 font-medium text-xs sm:text-sm uppercase tracking-wider">
                  Orders ({filteredOrders.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 sm:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filters - Collapsible on mobile */}
              <div
                className={`space-y-3 ${showFilters ? 'block' : 'hidden sm:block'}`}
              >
                {/* Status Filter */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('paid')}
                    className={`rounded-sm text-xs sm:text-sm ${
                      statusFilter === 'paid'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Paid Only
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-sm text-xs sm:text-sm ${
                      statusFilter === 'all'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    All Status
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className={`rounded-sm text-xs sm:text-sm ${
                      statusFilter === 'pending'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Pending
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('failed')}
                    className={`rounded-sm text-xs sm:text-sm ${
                      statusFilter === 'failed'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Failed
                  </Button>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 flex gap-2">
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-sm bg-card/30 backdrop-blur-sm border-slate-700 text-gray-100 placeholder:text-gray-400 h-9 sm:h-12 flex-1 text-sm sm:text-base"
                    />
                    <Button
                      onClick={searchOrders}
                      variant="outline"
                      size="sm"
                      className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 h-9 sm:h-12 px-2 sm:px-3 shrink-0"
                      disabled={loading}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadOrders}
                      variant="outline"
                      size="sm"
                      className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 h-9 sm:h-12 px-2 sm:px-3 flex-1 sm:flex-none"
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span className="ml-2 sm:hidden">Refresh</span>
                    </Button>
                    <Button
                      onClick={downloadCSV}
                      variant="outline"
                      size="sm"
                      className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 h-9 sm:h-12 px-2 sm:px-3 flex-1 sm:flex-none"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4" />
                      <span className="ml-2 sm:hidden">Export</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <Card className="rounded-sm border-slate-700 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12 sm:py-20">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <motion.div
                  className="text-center py-12 sm:py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
                    No orders found
                  </h2>
                  <p className="text-zinc-400 mb-6 text-sm sm:text-base">
                    Try adjusting your filters or search query
                  </p>
                </motion.div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left w-[20%]">
                        Customer
                      </TableHead>
                      <TableHead className="text-left hidden sm:table-cell w-[15%]">
                        Order #
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        Items
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        Amount
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        Status
                      </TableHead>
                      <TableHead className="text-center w-[15%]">
                        Email
                      </TableHead>
                      <TableHead className="text-center w-[14%]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const EmailIcon = getEmailButtonIcon(order);
                      return (
                        <TableRow key={order.order_id}>
                          {/* Customer Info */}
                          <TableCell className="w-[20%]">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-100 truncate max-w-[120px] sm:max-w-none">
                                {order.customer_name}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">
                                {order.customer_email}
                              </div>
                            </div>
                          </TableCell>

                          {/* Order Number - Hidden on mobile */}
                          <TableCell className="hidden sm:table-cell w-[15%]">
                            <div className="text-sm text-gray-100 truncate max-w-[150px]">
                              {order.order_number}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatRelativeTime(order.created_at)}
                            </div>
                          </TableCell>

                          {/* Items & Count */}
                          <TableCell className="text-center w-[12%]">
                            <div className="text-sm font-medium text-gray-100">
                              {order.total_items}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.item_count}{' '}
                              {order.item_count === 1 ? 'type' : 'types'}
                            </div>
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="text-center w-[12%]">
                            <div className="text-sm font-medium text-gray-100">
                              {order.total_amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.currency_code}
                            </div>
                          </TableCell>

                          {/* Payment Status */}
                          <TableCell className="text-center w-[12%]">
                            {getPaymentStatusBadge(order.status)}
                          </TableCell>

                          {/* Email Status */}
                          <TableCell className="text-center w-[15%]">
                            <div className="flex flex-col items-center gap-1">
                              {getStatusBadge(order.email_dispatch_status)}
                              {order.email_dispatch_attempts > 0 && (
                                <span className="text-xs text-gray-500">
                                  {order.email_dispatch_attempts} attempt
                                  {order.email_dispatch_attempts !== 1
                                    ? 's'
                                    : ''}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-center w-[14%]">
                            <Button
                              size="sm"
                              onClick={() => openEmailDialog(order)}
                              className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              disabled={!canSendEmail(order)}
                            >
                              <EmailIcon className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline ml-1">
                                {getEmailButtonText(order)}
                              </span>
                              <span className="sm:hidden">Email</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Email Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="rounded-sm border-slate-700 bg-card/90 backdrop-blur-sm shadow-2xl max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-100 text-base sm:text-lg">
                {selectedOrder &&
                (selectedOrder.email_dispatch_status === 'PENDING' ||
                  selectedOrder.email_dispatch_attempts === 0)
                  ? 'Send Order Email'
                  : 'Resend Order Email'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-xs sm:text-sm">
                Update customer information and send the order confirmation
                email
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label
                      htmlFor="newName"
                      className="text-gray-200 text-xs sm:text-sm"
                    >
                      Customer Name
                    </Label>
                    <Input
                      id="newName"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter correct name"
                      className="rounded-sm bg-background border-slate-700 text-gray-100 placeholder:text-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="newPhone"
                      className="text-gray-200 text-xs sm:text-sm"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="newPhone"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter correct phone"
                      className="rounded-sm bg-background border-slate-700 text-gray-100 placeholder:text-gray-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="newEmail"
                    className="text-gray-200 text-xs sm:text-sm"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter correct email"
                    className="rounded-sm bg-background border-slate-700 text-gray-100 placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div className="bg-card/50 backdrop-blur-sm p-3 rounded-sm border border-slate-700">
                  <h4 className="font-medium mb-2 text-gray-100 text-sm">
                    Order Details
                  </h4>
                  <div className="text-xs sm:text-sm space-y-1 text-gray-300">
                    <div>Order: {selectedOrder.order_number}</div>
                    <div>
                      Amount: {selectedOrder.total_amount.toLocaleString()}{' '}
                      {selectedOrder.currency_code}
                    </div>
                    <div>Items: {selectedOrder.total_items}</div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEmailDialogOpen(false)}
                    className="rounded-sm border-slate-700 text-gray-100 hover:bg-card/70 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEmailAction}
                    disabled={emailActionLoading || !newEmail.trim()}
                    className="rounded-sm w-full sm:w-auto"
                  >
                    {emailActionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        {selectedOrder.email_dispatch_status === 'PENDING' ||
                        selectedOrder.email_dispatch_attempts === 0 ? (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Email
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Email
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
