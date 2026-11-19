import { useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ShoppingCart,
  Store,
  Trash2,
  Users,
} from "lucide-react";
import { shopConfig } from "../../client/src/config/shopConfig.js";

const API_URL = import.meta.env.VITE_API_URL || "";

function formatPrice(amount) {
  return new Intl.NumberFormat(shopConfig.locale, {
    style: "currency",
    currency: shopConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, revenue: 0, customerCount: 0 });
  const [form, setForm] = useState({ name: "", category: "Grocery", price: "", stock: "", imageUrl: "", available: true });
  const [editingId, setEditingId] = useState("");

  const authHeaders = useMemo(() => (
    token ? { Authorization: `Bearer ${token}` } : {}
  ), [token]);

  async function loadData(authToken = token) {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const [productResponse, dashboardResponse, orderResponse] = await Promise.all([
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/admin/dashboard`, { headers }),
      fetch(`${API_URL}/api/orders`, { headers }),
    ]);
    if (!productResponse.ok) throw new Error("Could not load products.");
    setProducts(await productResponse.json());
    if (dashboardResponse.ok) setStats(await dashboardResponse.json());
    if (orderResponse.ok) setOrders(await orderResponse.json());
  }

  async function login(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Sign-in failed.");
      setToken(result.token);
      await loadData(result.token);
      setPassword("");
    } catch (loginError) {
      setMessage(loginError.message);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/products${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save product.");
      setForm({ name: "", category: "Grocery", price: "", stock: "", imageUrl: "", available: true });
      setEditingId("");
      await loadData();
      setMessage("Product saved.");
    } catch (saveError) {
      setMessage(saveError.message);
    }
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not delete product.");
      }
      await loadData();
    } catch (deleteError) {
      setMessage(deleteError.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not update order.");
      }
      await loadData();
    } catch (statusError) {
      setMessage(statusError.message);
    }
  }

  async function deleteOrder(order) {
    const orderLabel = `#${order._id.slice(-6).toUpperCase()}`;
    if (!window.confirm(`Permanently delete order ${orderLabel} from order history? This cannot be undone.`)) {
      return;
    }
    setMessage("");
    setDeletingOrderId(order._id);
    try {
      const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete order.");
      await loadData();
      setMessage(`Order ${orderLabel} deleted from history.`);
    } catch (deleteError) {
      setMessage(deleteError.message);
    } finally {
      setDeletingOrderId("");
    }
  }

  function editProduct(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
      available: product.available,
    });
  }

  if (!token) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-brand">
          <a className="footer-brand" href={shopConfig.adminUrl}><span className="brand-mark"><Store size={18} /></span>{shopConfig.name}</a>
          <div>
            <span className="eyebrow">SELLER WORKSPACE</span>
            <h1>Manage your shop with confidence.</h1>
            <p>Products, customers, orders and store performance — all in one place.</p>
          </div>
        </section>
        <section className="admin-login-form-wrap">
          <a className="back-link" href={shopConfig.adminUrl.replace(":5174", ":5173")}>← Back to shop</a>
          <form className="admin-login-form" onSubmit={login}>
            <span className="eyebrow">ADMIN SIGN IN</span>
            <h2>Welcome back</h2>
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {message && <p className="error-message" role="alert">{message}</p>}
            <button className="order-button">Sign in to dashboard <ArrowRight size={17} /></button>
          </form>
        </section>
      </main>
    );
  }

  const categories = [...new Set(["Grocery", ...products.map((product) => product.category)])].sort();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href={shopConfig.adminUrl}><span className="brand-mark"><Store size={19} /></span><div>{shopConfig.name}<small>Admin panel</small></div></a>
        <nav>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}><LayoutDashboard size={18} /> Overview</button>
          <button className={activeView === "products" ? "active" : ""} onClick={() => setActiveView("products")}><Boxes size={18} /> Products</button>
          <button className={activeView === "orders" ? "active" : ""} onClick={() => setActiveView("orders")}><ShoppingCart size={18} /> Orders <span>{stats.orderCount}</span></button>
        </nav>
        <button className="admin-signout" onClick={() => setToken("")}><LogOut size={18} /> Sign out</button>
      </aside>
      <section className="admin-content">
        <header className="admin-topbar">
          <div><span>Seller dashboard</span><h1>{activeView === "overview" ? "Overview" : activeView === "products" ? "Products" : "Orders"}</h1></div>
          <a href={shopConfig.adminUrl.replace(":5174", ":5173")} target="_blank" rel="noreferrer">View shop <ArrowRight size={15} /></a>
        </header>

        {activeView === "overview" && (
          <>
            <div className="admin-stat-grid">
              <article><span className="stat-icon"><ShoppingCart size={20} /></span><div><small>Total orders</small><strong>{stats.orderCount}</strong></div></article>
              <article><span className="stat-icon stat-orange"><PackageCheck size={20} /></span><div><small>Total revenue</small><strong>{formatPrice(stats.revenue)}</strong></div></article>
              <article><span className="stat-icon stat-blue"><Boxes size={20} /></span><div><small>Products</small><strong>{stats.productCount}</strong></div></article>
              <article><span className="stat-icon stat-purple"><Users size={20} /></span><div><small>Customers</small><strong>{stats.customerCount}</strong></div></article>
            </div>
            <section className="admin-card">
              <div className="admin-section-heading"><div><span className="eyebrow">FULFILMENT</span><h2>Recent orders</h2></div></div>
              {orders.length === 0 ? <p>No orders yet.</p> : (
                <div className="admin-orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <article className="admin-order" key={order._id}>
                      <div><strong>#{order._id.slice(-6).toUpperCase()}</strong><span>{order.customerName} · {order.phone}</span><small>{order.address}{order.pincode ? ` · ${order.pincode}` : ""}</small></div>
                      <div className="order-items">{order.items.map((item) => <span key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</span>)}</div>
                      <b>{formatPrice(order.total)}</b>
                      <span className={`order-status status-${order.status}`}>{order.status}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === "products" && (
          <section className="admin-card">
            <div className="admin-section-heading"><div><span className="eyebrow">CATALOGUE</span><h2>{editingId ? "Edit product" : "Add a product"}</h2></div></div>
            <form className="product-form" onSubmit={saveProduct}>
              <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Price<input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
              <label>Stock<input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required /></label>
              <label className="wide-field">Image URL<input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label>
              <label className="availability-field"><input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} /> Available</label>
              {message && <p className="status-message">{message}</p>}
              <div className="form-actions"><button className="order-button">{editingId ? "Save changes" : "Add product"}</button></div>
            </form>
            <div className="admin-product-list">
              {products.map((product) => (
                <div className="admin-product" key={product._id}>
                  <div><strong>{product.name}</strong><span>{product.category} · {formatPrice(product.price)} · Stock: {product.stock}</span></div>
                  <div className="admin-actions"><button className="text-button" onClick={() => editProduct(product)}>Edit</button><button className="text-button danger-text" onClick={() => deleteProduct(product._id)}>Delete</button></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === "orders" && (
          <section className="admin-card">
            <div className="admin-section-heading"><div><span className="eyebrow">FULFILMENT</span><h2>All orders ({orders.length})</h2></div></div>
            {message && <p className={message.startsWith("Order #") ? "status-message" : "error-message"} role="status">{message}</p>}
            {orders.length === 0 ? <p>No orders yet.</p> : (
              <div className="admin-orders-list">
                {orders.map((order) => (
                  <article className="admin-order" key={order._id}>
                    <div><strong>#{order._id.slice(-6).toUpperCase()}</strong><span>{order.customerName} · {order.phone}</span><small>{order.address}{order.pincode ? ` · ${order.pincode}` : ""}</small><small>{new Date(order.createdAt).toLocaleString()}</small></div>
                    <div className="order-items">{order.items.map((item) => <span key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</span>)}</div>
                    <b>{formatPrice(order.total)}</b>
                    <select value={order.status} onChange={(event) => updateOrderStatus(order._id, event.target.value)} aria-label={`Status for order ${order._id}`}>
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="packed">Packed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                    </select>
                    <button className="delete-order-button" onClick={() => deleteOrder(order)} disabled={deletingOrderId === order._id} aria-label={`Delete order ${order._id.slice(-6).toUpperCase()}`} title="Delete order history">
                      <Trash2 size={16} /> {deletingOrderId === order._id ? "Deleting..." : "Delete"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
