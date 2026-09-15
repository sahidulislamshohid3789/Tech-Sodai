import React, { useState } from 'react';
import { Product, PaymentMethod } from '../types';
import { ShoppingCart, CheckCircle, Store, Send, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface StorefrontSimulatorProps {
  products: Product[];
  onPlaceOrder: (orderData: any) => Promise<any>;
}

export const StorefrontSimulator: React.FC<StorefrontSimulatorProps> = ({ products, onPlaceOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]?.name || '');
    setSelectedSize(product.sizes[0] || 'Standard');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const cartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      selectedColor: selectedColor || 'Default',
      selectedSize: selectedSize || 'Standard',
      price: selectedProduct.discountedPrice || selectedProduct.regularPrice,
      quantity,
      image: selectedProduct.images[0] || '',
    };

    setCart([...cart, cartItem]);
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = cart.length > 0 ? 60 : 0;
  const cartTotal = cartSubtotal + (cart.length > 0 ? shippingFee : 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address || cart.length === 0) {
      alert('Please fill in required customer details and add items to cart.');
      return;
    }

    if (paymentMethod !== 'Cash on Delivery' && !trxId.trim()) {
      alert('Please provide the Transaction ID (TrxID) for mobile banking payment.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail,
        address,
        city,
        paymentMethod,
        trxId: trxId || 'COD-CASH',
        items: cart,
        shippingFee,
      };

      const result = await onPlaceOrder(orderPayload);
      setOrderSuccess(result.order.id);
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-500/30">
            <Store className="w-3.5 h-3.5" /> Customer Experience Simulation
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Tech Sodai Storefront</h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Test purchasing products as a customer. Placing an order here will instantly trigger the email notification alert to <strong className="text-white">sahidulislamshohid3789@gmail.com</strong> and register it in the Order Dashboard.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4">
          <div className="relative">
            <ShoppingCart className="w-8 h-8 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-slate-300 block">Cart Items</span>
            <span className="text-lg font-bold text-white">৳{cartTotal}</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow cursor-pointer ml-2"
            >
              Checkout Now
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-emerald-900">Order Placed Successfully! (# {orderSuccess})</h3>
            <p className="text-sm text-emerald-700 mt-1">
              An instant email alert has been successfully dispatched to <strong>sahidulislamshohid3789@gmail.com</strong> containing all order items, payment method, TrxID, and delivery address. You can verify this in the Order Dashboard or Email Logs tab.
            </p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Products Catalog */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No products available in storefront</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please add products in the <strong className="text-slate-700">Product Management</strong> tab first to test storefront shopping and order email notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="h-52 bg-slate-100 relative overflow-hidden">
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="absolute top-3 right-3 bg-white/90 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-blue-600">৳{product.discountedPrice}</span>
                  {product.discountedPrice < product.regularPrice && (
                    <span className="text-xs text-slate-400 line-through">৳{product.regularPrice}</span>
                  )}
                </div>
                <button
                  onClick={() => handleOpenProduct(product)}
                  className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select Options & Buy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-40 bg-slate-100 rounded-xl overflow-hidden">
                <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Select Color</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                        selectedColor === c.name ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600' : 'border-slate-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Select Size / Capacity</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        selectedSize === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">৳{selectedProduct.discountedPrice * quantity}</span>
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow transition cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Tech Sodai Checkout</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Customer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahim Ahmed"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, Thana"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                  </select>
                </div>
              </div>

              {/* Payment Method & TrxID */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment Method & Transaction ID</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['bKash', 'Nagad', 'Rocket', 'Cash on Delivery'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        paymentMethod === m ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'border-slate-200 text-slate-700 bg-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {paymentMethod !== 'Cash on Delivery' && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                    <span className="text-xs font-bold text-blue-900 block">
                      Send Money to Tech Sodai Merchant Number: <strong className="text-blue-700">01700000000</strong> ({paymentMethod})
                    </span>
                    <label className="block text-xs font-semibold text-slate-700 mt-2 mb-1">Enter Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. 9N87B6V543"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span>৳{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>৳{shippingFee}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="text-blue-600">৳{cartTotal}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Placing Order...' : 'Confirm Order & Send Email Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
