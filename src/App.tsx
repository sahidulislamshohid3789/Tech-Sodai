import React, { useState, useEffect } from 'react';
import { Product, Order, EmailLog, AppSettings, OrderStatus } from './types';
import { Header } from './components/Header';
import { ProductManagement } from './components/ProductManagement';
import { OrderDashboard } from './components/OrderDashboard';
import { EmailLogs } from './components/EmailLogs';
import { StorefrontSimulator } from './components/StorefrontSimulator';
import { SettingsTab } from './components/SettingsTab';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'Tech Sodai <noreply@techsodai.com>',
    notificationEmail: 'sahidulislamshohid3789@gmail.com',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; details: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes, logRes, setRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/email-logs'),
        fetch('/api/settings'),
      ]);

      if (!prodRes.ok || !ordRes.ok) {
        throw new Error('Failed to fetch store data from server.');
      }

      const productsData = await prodRes.json();
      const ordersData = await ordRes.json();
      const logsData = await logRes.json();
      const settingsData = await setRes.json();

      setProducts(productsData);
      setOrders(ordersData);
      setEmailLogs(logsData);
      setSettings(settingsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Product Actions
  const handleAddProduct = async (productPayload: Omit<Product, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
    });
    if (!res.ok) throw new Error('Failed to add product');
    const newProduct = await res.json();
    setProducts([newProduct, ...products]);
  };

  const handleUpdateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const updated = await res.json();
    setProducts(products.map((p) => (p.id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    setProducts(products.filter((p) => p.id !== id));
  };

  // Order Actions
  const handlePlaceOrder = async (orderPayload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const data = await res.json();
    setOrders([data.order, ...orders]);
    // Refresh email logs
    const logRes = await fetch('/api/email-logs');
    if (logRes.ok) {
      setEmailLogs(await logRes.json());
    }
    return data;
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const updated = await res.json();
    setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
  };

  // Settings Action
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const updated = await res.json();
    setSettings(updated);
  };

  // Test Email Action
  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/test-email', { method: 'POST' });
      const result = await res.json();
      setEmailStatus(result);
      const logRes = await fetch('/api/email-logs');
      if (logRes.ok) {
        setEmailLogs(await logRes.json());
      }
    } catch (err: any) {
      setEmailStatus({ success: false, details: err.message || 'Failed to send test email' });
    } finally {
      setTestingEmail(false);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = {
    productsCount: products.length,
    ordersCount: orders.length,
    pendingOrdersCount,
    totalRevenue,
  };

  if (loading && products.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-300">Loading Tech Sodai Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onTestEmail={handleTestEmail}
        testingEmail={testingEmail}
        emailStatus={emailStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'orders' && (
          <OrderDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'email-logs' && (
          <EmailLogs
            emailLogs={emailLogs}
            onRefresh={fetchData}
            onTestEmail={handleTestEmail}
            testingEmail={testingEmail}
          />
        )}

        {activeTab === 'storefront' && (
          <StorefrontSimulator
            products={products}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTestEmail={handleTestEmail}
            testingEmail={testingEmail}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Tech Sodai Admin Panel &bull; Instant Email Alert Target: <strong className="text-slate-800">sahidulislamshohid3789@gmail.com</strong>
      </footer>
    </div>
  );
}
