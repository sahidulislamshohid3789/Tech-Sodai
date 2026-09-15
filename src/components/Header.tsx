import React from 'react';
import { Package, ShoppingCart, Mail, Settings, Store, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    productsCount: number;
    ordersCount: number;
    pendingOrdersCount: number;
    totalRevenue: number;
  };
  onTestEmail: () => void;
  testingEmail: boolean;
  emailStatus: { success: boolean; details: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onTestEmail,
  testingEmail,
  emailStatus,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl font-bold flex items-center justify-center shadow-md">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Tech Sodai <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Admin Panel</span>
              </h1>
              <p className="text-xs text-slate-400">Inventory & Order Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Alerts: <strong className="text-white">sahidulislamshohid3789@gmail.com</strong></span>
            </div>

            <button
              onClick={onTestEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
              title="Test instant email alert to sahidulislamshohid3789@gmail.com"
            >
              {testingEmail ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>Test Email Alert</span>
            </button>
          </div>
        </div>

        {/* Status banner if email test completed */}
        {emailStatus && (
          <div className={`my-2 p-2 px-3 rounded-lg text-xs flex items-center justify-between ${emailStatus.success ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200' : 'bg-rose-950/80 border border-rose-800 text-rose-200'}`}>
            <div className="flex items-center gap-2">
              {emailStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              <span>{emailStatus.details}</span>
            </div>
            <span className="text-[10px] opacity-75">Target: sahidulislamshohid3789@gmail.com</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 py-2 scrollbar-none">
          {[
            { id: 'products', label: 'Product Management', icon: Package, count: stats.productsCount },
            { id: 'orders', label: 'Order Dashboard', icon: ShoppingCart, count: stats.pendingOrdersCount > 0 ? stats.pendingOrdersCount : undefined, badgeColor: 'bg-amber-500 text-slate-950' },
            { id: 'email-logs', label: 'Email Logs', icon: Mail },
            { id: 'storefront', label: 'Customer Storefront', icon: Store },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full ${tab.badgeColor || 'bg-blue-500 text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
