import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredData {
  products: any[];
  orders: any[];
  emailLogs: any[];
  settings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
    notificationEmail: string;
  };
}

function getStoredData(): StoredData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading store.json", e);
  }
  return {
    products: [],
    orders: [],
    emailLogs: [],
    settings: {
      smtpHost: process.env.SMTP_HOST || "",
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || "",
      smtpPass: process.env.SMTP_PASS || "",
      smtpFrom: process.env.SMTP_FROM || "Tech Sodai <noreply@techsodai.com>",
      notificationEmail: "sahidulislamshohid3789@gmail.com",
    },
  };
}

function saveStoredData(data: StoredData) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing store.json", e);
  }
}

async function sendEmailNotification(to: string, subject: string, htmlBody: string) {
  const data = getStoredData();
  const settings = data.settings;
  const targetEmail = settings.notificationEmail || "sahidulislamshohid3789@gmail.com";

  let success = false;
  let details = "";

  try {
    // Create transporter if SMTP settings are provided
    if (settings.smtpHost && settings.smtpUser && settings.smtpPass) {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: Number(settings.smtpPort) || 587,
        secure: Number(settings.smtpPort) === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: settings.smtpFrom || '"Tech Sodai Admin" <noreply@techsodai.com>',
        to: targetEmail,
        subject,
        html: htmlBody,
      });
      success = true;
      details = `Email sent successfully via SMTP. MessageId: ${info.messageId}`;
    } else {
      // Fallback simulation mode (logs email and marks success so admin always sees alerts)
      console.log(`[SIMULATED EMAIL to ${targetEmail}] Subject: ${subject}`);
      success = true;
      details = `Simulated email delivery to ${targetEmail} (No SMTP configured yet, viewable in Email Logs)`;
    }
  } catch (err: any) {
    console.error("Email sending error:", err);
    success = false;
    details = `Failed to send email: ${err.message}`;
  }

  // Log email
  const logEntry = {
    id: "email_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    recipient: targetEmail,
    subject,
    body: htmlBody,
    timestamp: new Date().toISOString(),
    success,
    details,
  };

  data.emailLogs.unshift(logEntry);
  if (data.emailLogs.length > 100) data.emailLogs.pop();
  saveStoredData(data);

  return { success, details };
}

// API Routes
app.get("/api/products", (req, res) => {
  const data = getStoredData();
  res.json(data.products);
});

app.post("/api/products", (req, res) => {
  const data = getStoredData();
  const newProduct = {
    id: "prod_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    name: req.body.name || "Untitled Product",
    description: req.body.description || "",
    category: req.body.category || "General",
    regularPrice: Number(req.body.regularPrice) || 0,
    discountedPrice: Number(req.body.discountedPrice) || 0,
    images: Array.isArray(req.body.images) ? req.body.images : [],
    colors: Array.isArray(req.body.colors) ? req.body.colors : [],
    sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
    stock: Number(req.body.stock) || 0,
    createdAt: new Date().toISOString(),
  };

  data.products.unshift(newProduct);
  saveStoredData(data);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const data = getStoredData();
  const index = data.products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updated = {
    ...data.products[index],
    ...req.body,
    regularPrice: req.body.regularPrice !== undefined ? Number(req.body.regularPrice) : data.products[index].regularPrice,
    discountedPrice: req.body.discountedPrice !== undefined ? Number(req.body.discountedPrice) : data.products[index].discountedPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : data.products[index].stock,
  };

  data.products[index] = updated;
  saveStoredData(data);
  res.json(updated);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const data = getStoredData();
  const index = data.products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  data.products.splice(index, 1);
  saveStoredData(data);
  res.json({ success: true });
});

// Orders API
app.get("/api/orders", (req, res) => {
  const data = getStoredData();
  res.json(data.orders);
});

app.post("/api/orders", async (req, res) => {
  const data = getStoredData();
  const orderData = req.body;

  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const shippingFee = Number(orderData.shippingFee) || 60; // Default shipping
  const total = subtotal + shippingFee;

  const newOrder: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    city: string;
    paymentMethod: string;
    trxId: string;
    items: any[];
    subtotal: number;
    shippingFee: number;
    total: number;
    status: string;
    createdAt: string;
    emailSent: boolean;
    emailError?: string;
  } = {
    id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    customerName: orderData.customerName || "Walk-in Customer",
    customerPhone: orderData.customerPhone || "",
    customerEmail: orderData.customerEmail || "",
    address: orderData.address || "",
    city: orderData.city || "Dhaka",
    paymentMethod: orderData.paymentMethod || "Cash on Delivery",
    trxId: orderData.trxId || "N/A",
    items,
    subtotal,
    shippingFee,
    total,
    status: "Pending",
    createdAt: new Date().toISOString(),
    emailSent: false,
    emailError: undefined,
  };

  // Generate Email HTML
  const itemsHtml = items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong><br/>
        <span style="font-size: 12px; color: #666;">Color: ${item.selectedColor || 'Default'} | Size: ${item.selectedSize || 'Standard'}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price}</td>
    </tr>
  `
    )
    .join("");

  const emailSubject = `🚀 New Order Alert: #${newOrder.id} (${newOrder.paymentMethod})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">
        🛍️ Tech Sodai - New Order Received!
      </h2>
      <p style="font-size: 16px; color: #334155;">A new order <strong>#${newOrder.id}</strong> has been successfully placed.</p>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 15px;">👤 Customer Details</h3>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${newOrder.customerName}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${newOrder.customerPhone}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${newOrder.customerEmail || 'Not provided'}</p>
        <p style="margin: 4px 0;"><strong>Address:</strong> ${newOrder.address}, ${newOrder.city}</p>
      </div>

      <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 15px;">💳 Payment Info</h3>
        <p style="margin: 4px 0;"><strong>Method:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${newOrder.paymentMethod}</span></p>
        <p style="margin: 4px 0;"><strong>TrxID (Transaction ID):</strong> <span style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${newOrder.trxId}</span></p>
      </div>

      <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 15px;">📦 Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px; font-size: 15px;">
          <p style="margin: 4px 0;">Subtotal: ৳${subtotal}</p>
          <p style="margin: 4px 0;">Shipping Fee: ৳${shippingFee}</p>
          <p style="margin: 6px 0; font-size: 18px; color: #2563eb;"><strong>Total: ৳${total}</strong></p>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        Tech Sodai Admin System &bull; Instant Notification Alert to sahidulislamshohid3789@gmail.com
      </p>
    </div>
  `;

  // Send email alert to sahidulislamshohid3789@gmail.com
  const emailResult = await sendEmailNotification(
    data.settings.notificationEmail || "sahidulislamshohid3789@gmail.com",
    emailSubject,
    emailHtml
  );

  newOrder.emailSent = emailResult.success;
  if (!emailResult.success) {
    newOrder.emailError = emailResult.details;
  }

  data.orders.unshift(newOrder);
  saveStoredData(data);

  res.status(201).json({
    order: newOrder,
    emailStatus: emailResult,
  });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = getStoredData();
  const order = data.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status || order.status;
  saveStoredData(data);
  res.json(order);
});

// Test Email endpoint
app.post("/api/test-email", async (req, res) => {
  const data = getStoredData();
  const testSubject = "🧪 Test Email Alert from Tech Sodai Admin Panel";
  const testHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 8px;">
      <h2 style="color: #2563eb;">Test Notification Alert</h2>
      <p>Hello Sahidul Islam, this is a test email alert sent from your <strong>Tech Sodai Admin Panel</strong>.</p>
      <p>If you are receiving this, your email notification alert system is working successfully!</p>
      <hr style="border: 0; border-top: 1px solid #ccc;" />
      <p style="font-size: 12px; color: #666;">Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  `;

  const result = await sendEmailNotification(
    data.settings.notificationEmail || "sahidulislamshohid3789@gmail.com",
    testSubject,
    testHtml
  );

  res.json(result);
});

// Settings API
app.get("/api/settings", (req, res) => {
  const data = getStoredData();
  res.json(data.settings);
});

app.put("/api/settings", (req, res) => {
  const data = getStoredData();
  data.settings = {
    ...data.settings,
    ...req.body,
  };
  saveStoredData(data);
  res.json(data.settings);
});

// Email Logs API
app.get("/api/email-logs", (req, res) => {
  const data = getStoredData();
  res.json(data.emailLogs || []);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tech Sodai Server running on http://localhost:${PORT}`);
  });
}

startServer();
