'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
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
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslations } from 'next-intl';

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
  created_at: string;
  updated_at: string;
  item_count: number;
  total_items: number;
}

export default function AdminClient() {
  const t = useTranslations('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
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
        setAuthError(t('auth.authFailed'));
        return;
      }

      if (data === true) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        loadOrders();
      } else {
        setAuthError(t('auth.invalidPin'));
      }
    } catch {
      setAuthError(t('auth.authFailed'));
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

  // Badge style inspired by floating-announcement: solid bg + white text (light), tint bg + darker text (dark), inset shadow
  const badgeBase =
    'rounded-md text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] border-0';

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge
            className={`${badgeBase} bg-emerald-500 text-white dark:bg-emerald-100 dark:text-emerald-700`}
          >
            {t('status.paid')}
          </Badge>
        );
      case 'pending_payment':
        return (
          <Badge
            className={`${badgeBase} bg-amber-500 text-white dark:bg-amber-100 dark:text-amber-700`}
          >
            {t('status.pending')}
          </Badge>
        );
      case 'payment_failed':
        return (
          <Badge
            className={`${badgeBase} bg-red-500 text-white dark:bg-red-100 dark:text-red-700`}
          >
            {t('status.failed')}
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            className={`${badgeBase} bg-sky-500 text-white dark:bg-sky-100 dark:text-sky-700`}
          >
            {t('status.processing')}
          </Badge>
        );
      case 'shipped':
        return (
          <Badge
            className={`${badgeBase} bg-violet-500 text-white dark:bg-violet-100 dark:text-violet-700`}
          >
            {t('status.shipped')}
          </Badge>
        );
      case 'delivered':
        return (
          <Badge
            className={`${badgeBase} bg-emerald-500 text-white dark:bg-emerald-100 dark:text-emerald-700`}
          >
            {t('status.delivered')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            className={`${badgeBase} bg-zinc-500 text-white dark:bg-zinc-100 dark:text-zinc-700`}
          >
            {t('status.cancelled')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="rounded-md text-xs">
            {status}
          </Badge>
        );
    }
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
        <Card className="w-full max-w-md rounded-sm border-border bg-card shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              {t('auth.title')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('auth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-foreground">
                {t('auth.pin')}
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                placeholder={t('auth.pinPlaceholder')}
                className="rounded-sm bg-background border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {authError && (
              <div className="rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-destructive">
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
              {t('auth.login')}
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
              <h1 className="text-3xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-foreground mb-3 sm:mb-6">
                {t('header.title')}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-xl leading-relaxed tracking-tight max-w-3xl">
                {t('header.subtitle')}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-sm border-border text-foreground hover:bg-accent shrink-0 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              {t('header.logout')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="rounded-sm border-border bg-card">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-muted-foreground">{t('stats.totalOrders')}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.total_orders}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-border bg-card">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-muted-foreground">{t('stats.totalRevenue')}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.total_revenue.toLocaleString()} XOF
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-border bg-card">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-muted-foreground">{t('stats.pending')}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.pending_orders}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-sm border-border bg-card">
              <CardContent className="p-2 sm:p-3">
                <div className="text-xs text-muted-foreground">{t('stats.failed')}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
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
                <Label className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wider">
                  {t('filters.orders')} ({filteredOrders.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-sm border-border text-foreground hover:bg-accent sm:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('filters.filters')}
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
                    className={`rounded-sm text-xs sm:text-sm ${statusFilter === 'paid'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t('filters.paidOnly')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-sm text-xs sm:text-sm ${statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {t('filters.allStatus')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className={`rounded-sm text-xs sm:text-sm ${statusFilter === 'pending'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t('filters.pending')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('failed')}
                    className={`rounded-sm text-xs sm:text-sm ${statusFilter === 'failed'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t('filters.failed')}
                  </Button>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 flex gap-2">
                    <Input
                      id="search"
                      placeholder={t('filters.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-sm bg-background border-input text-foreground placeholder:text-muted-foreground h-9 sm:h-12 flex-1 text-sm sm:text-base"
                    />
                    <Button
                      onClick={searchOrders}
                      variant="outline"
                      size="sm"
                      className="rounded-sm border-border text-foreground hover:bg-accent h-9 sm:h-12 px-2 sm:px-3 shrink-0"
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
                      className="rounded-sm border-border text-foreground hover:bg-accent h-9 sm:h-12 px-2 sm:px-3 flex-1 sm:flex-none"
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                      />
                      <span className="ml-2 sm:hidden">{t('filters.refresh')}</span>
                    </Button>
                    <Button
                      onClick={downloadCSV}
                      variant="outline"
                      size="sm"
                      className="rounded-sm border-border text-foreground hover:bg-accent h-9 sm:h-12 px-2 sm:px-3 flex-1 sm:flex-none"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4" />
                      <span className="ml-2 sm:hidden">{t('filters.export')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <Card className="rounded-sm border-border bg-card">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12 sm:py-20">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <motion.div
                  className="text-center py-12 sm:py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">
                    {t('empty.noOrders')}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                    {t('empty.tryAdjusting')}
                  </p>
                </motion.div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left w-[20%]">
                        {t('table.customer')}
                      </TableHead>
                      <TableHead className="text-left hidden sm:table-cell w-[15%]">
                        {t('table.orderNumber')}
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        {t('table.items')}
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        {t('table.amount')}
                      </TableHead>
                      <TableHead className="text-center w-[12%]">
                        {t('table.status')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.order_id}>
                        {/* Customer Info */}
                        <TableCell className="w-[20%]">
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
                              {order.customer_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                              {order.customer_email}
                            </div>
                          </div>
                        </TableCell>

                        {/* Order Number - Hidden on mobile */}
                        <TableCell className="hidden sm:table-cell w-[15%]">
                          <div className="text-sm text-foreground truncate max-w-[150px]">
                            {order.order_number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(order.created_at)}
                          </div>
                        </TableCell>

                        {/* Items & Count */}
                        <TableCell className="text-center w-[12%]">
                          <div className="text-sm font-medium text-foreground">
                            {order.total_items}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.item_count}{' '}
                            {order.item_count === 1 ? t('types.type') : t('types.types')}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-center w-[12%]">
                          <div className="text-sm font-medium text-foreground">
                            {order.total_amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.currency_code}
                          </div>
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell className="text-center w-[12%]">
                          {getPaymentStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
