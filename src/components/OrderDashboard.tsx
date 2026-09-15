import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { ShoppingCart, Search, Eye, CheckCircle2, Clock, Truck, Check, XCircle, AlertCircle, Phone, Mail, MapPin, CreditCard, ExternalLink } from 'lucide-react';

interface OrderDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const OrderDashboard: React.FC<OrderDashboardProps> = ({ orders, onUpdateOrderStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.trxId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Processing':
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold"><RefreshCwIcon className="w-3 h-3" /> Processing</span>;
      case 'Shipped':
        return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-semibold"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'bKash':
        return <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-[11px] font-bold">bKash</span>;
      case 'Nagad':
        return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[11px] font-bold">Nagad</span>;
      case 'Rocket':
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold">Rocket</span>;
      case 'Cash on Delivery':
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold">COD</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">{method}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Order Dashboard</h2>
          <p className="text-sm text-slate-600">View customer orders, verify TrxIDs, check addresses, update statuses, and monitor instant email alerts sent to sahidulislamshohid3789@gmail.com.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, customer, phone, TrxID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No orders found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {orders.length === 0
              ? 'No customer orders have been placed yet. Use the Customer Storefront tab to place test orders or simulate purchases.'
              : 'No orders match your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment & TrxID</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total (৳)</th>
                  <th className="py-3.5 px-4">Email Alert</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">{order.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {getPaymentBadge(order.paymentMethod)}
                        </div>
                        <div className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">
                          Trx: {order.trxId}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-800">{itemCount} items</span>
                        <div className="text-xs text-slate-500 truncate max-w-[180px]">
                          {order.items.map((i) => i.productName).join(', ')}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">৳{order.total}</td>
                      <td className="py-4 px-4">
                        {order.emailSent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full" title="Instant alert sent to sahidulislamshohid3789@gmail.com">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alert Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-semibold bg-rose-50 px-2 py-1 rounded-full" title={order.emailError || 'Failed'}>
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Order Invoice #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Email Alert status */}
              <div className="flex flex-wrap items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Current Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Email Alert to sahidulislamshohid3789@gmail.com</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedOrder.emailSent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedOrder.emailSent ? '✓ Sent Successfully' : '✗ Failed / Simulated'}
                  </span>
                </div>
              </div>

              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> Customer Information
                  </h4>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedOrder.customerPhone}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedOrder.customerEmail || 'Not provided'}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Shipping Address
                  </h4>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.address}</p>
                  <p className="text-xs text-slate-600">City / Zone: <strong>{selectedOrder.city}</strong></p>
                </div>
              </div>

              {/* Payment Method & TrxID */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-700 font-semibold block">Payment Method</span>
                    <span className="text-sm font-bold text-slate-900">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 block">Transaction ID (TrxID)</span>
                  <span className="font-mono text-sm font-bold text-blue-600">{selectedOrder.trxId}</span>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ordered Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Color & Size</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 flex items-center gap-3">
                            <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                            <span className="font-semibold text-slate-900">{item.productName}</span>
                          </td>
                          <td className="p-3 text-center text-xs text-slate-600">
                            {item.selectedColor} / {item.selectedSize}
                          </td>
                          <td className="p-3 text-center font-semibold">{item.quantity}</td>
                          <td className="p-3 text-right font-bold">৳{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-right">
                  <div className="flex justify-between text-xs text-slate-600 max-w-xs ml-auto">
                    <span>Subtotal:</span>
                    <span>৳{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 max-w-xs ml-auto">
                    <span>Shipping Fee:</span>
                    <span>৳{selectedOrder.shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 max-w-xs ml-auto pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">৳{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Footer Close */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function RefreshCwIcon(props: any) {
  return <RefreshCw className={props.className} />;
}
import { RefreshCw } from 'lucide-react';
