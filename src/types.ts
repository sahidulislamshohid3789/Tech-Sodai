export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  regularPrice: number;
  discountedPrice: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  selectedColor: string;
  selectedSize: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery' | 'Bank Transfer';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  trxId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  emailSent: boolean;
  emailError?: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  success: boolean;
  details: string;
}

export interface AppSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  notificationEmail: string;
}
