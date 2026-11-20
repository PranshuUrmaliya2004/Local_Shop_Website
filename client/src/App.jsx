import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  MessageCircle,
  Heart,
  MapPin,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Truck,
  UserCircle,
  LogOut,
  User,
  CircleCheck,
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  X,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Star,
  Sparkles,
  Timer,
  Navigation,
} from "lucide-react";
import { shopConfig } from "./config/shopConfig.js";
import Cart from "./components/Cart.jsx";

const API_URL = import.meta.env.VITE_API_URL || "";

const categoryPresentations = [
  { name: "grocery", icon: ShoppingBag },
  { name: "personal-care", icon: Sparkles },
  { name: "snacks", icon: Star },
  { name: "home", icon: Store },
  { name: "fresh", icon: PackageCheck },
];

function getCategoryPresentation(category, index) {
  const normalizedCategory = category.toLowerCase();
  if (/fresh|fruit|vegetable|produce/.test(normalizedCategory)) {
    return categoryPresentations[4];
  }
  if (/personal|care|beauty|health/.test(normalizedCategory)) {
    return categoryPresentations[1];
  }
  if (/snack|bakery|beverage|drink/.test(normalizedCategory)) {
    return categoryPresentations[2];
  }
  if (/home|clean|kitchen/.test(normalizedCategory)) {
    return categoryPresentations[3];
  }
  if (/grocery|food|pantry/.test(normalizedCategory)) {
    return categoryPresentations[0];
  }
  return categoryPresentations[index % categoryPresentations.length];
}

function formatPrice(amount) {
  return new Intl.NumberFormat(shopConfig.locale, {
    style: "currency",
    currency: shopConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function makeWhatsAppUrl(cart, checkout) {
  const phone = shopConfig.whatsappNumber.replace(/\D/g, "");
  if (!phone) {
    throw new Error("Set a valid WhatsApp number in shopConfig.js.");
  }

  const lines = cart.map(
    ({ product, quantity }) =>
      `${product.name} x ${quantity} - ${formatPrice(product.price * quantity)}`,
  );
  const total = cart.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0,
  );
  const message = [
    `Hello ${shopConfig.name}, I would like to place an order:`,
    "",
    ...lines,
    "",
    `Estimated total: ${formatPrice(total)}`,
    "",
    "Customer details:",
    `Name: ${checkout.customerName}`,
    `Phone: ${checkout.phone}`,
    `Address: ${checkout.address}`,
    `Pincode: ${checkout.pincode}`,
    "",
    "Please confirm availability, delivery charges, and final price.",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function Header({
  cartCount,
  favoriteCount,
  search,
  onSearchChange,
  onOpenCart,
  onShowFavorites,
  customer,
  onOpenAccount,
  onDepartmentSelect,
}) {
  const searchInput = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [unreadUpdates, setUnreadUpdates] = useState(2);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("shop-theme") === "dark");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem("recent-searches") || "[]");
      return Array.isArray(savedSearches) ? savedSearches : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("shop-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const normalizedSearch = search.trim();
    if (!normalizedSearch) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setRecentSearches((current) => {
        const nextSearches = [normalizedSearch, ...current.filter((item) => item !== normalizedSearch)].slice(0, 5);
        localStorage.setItem("recent-searches", JSON.stringify(nextSearches));
        return nextSearches;
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [search]);

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem("recent-searches");
  }

  useEffect(() => {
    function focusSearch(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="utility-inner">
          <span><MapPin size={13} /> Shop local. Get it nearby.</span>
          <span className="utility-offer"><Sparkles size={12} /> Free local delivery on orders above ₹499</span>
        </div>
      </div>
      <div className="header-main">
        <a className="brand" href="/" aria-label={`${shopConfig.name} home`}>
          {shopConfig.logoUrl ? (
            <img className="brand-logo" src={shopConfig.logoUrl} alt="" />
          ) : (
            <span className="brand-mark"><Store size={20} /></span>
          )}
          <span className="brand-name">{shopConfig.name}<small>YOUR NEIGHBOURHOOD STORE</small></span>
        </a>
        <div className="header-search-wrap">
        <label className={`header-search ${searchFocused ? "is-focused" : ""}`}>
          <Search size={19} />
          <input
            ref={searchInput}
            type="search"
            placeholder="Search milk, snacks, daily essentials..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
          />
          <kbd>⌘ K</kbd>
        </label>
        <AnimatePresence>
          {searchFocused && (
            <motion.div className="search-suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <div className="suggestion-column">
                <div className="suggestion-column-heading">
                  <span>{search.trim() ? "AI suggestions" : "Recent searches"}</span>
                  {!search.trim() && recentSearches.length > 0 && (
                    <button className="clear-recent-searches" onMouseDown={(event) => event.preventDefault()} onClick={clearRecentSearches}>
                      Clear history <X size={12} />
                    </button>
                  )}
                </div>
                {search.trim()
                  ? [search, `${search} near me`, `Fresh ${search}`].map((item) => (
                    <button key={item} onMouseDown={() => onSearchChange(item)}><Sparkles size={13} /> {item}</button>
                  ))
                  : recentSearches.length > 0
                    ? recentSearches.map((item) => (
                      <button key={item} onMouseDown={() => onSearchChange(item)}><Clock3 size={13} /> {item}</button>
                    ))
                    : <p className="no-recent-searches">Your recent searches will appear here.</p>}
              </div>
              <div className="suggestion-column trending-column">
                <span>Trending now</span>
                <button onMouseDown={() => onSearchChange("Snacks")}><Sparkles size={13} /> Evening snacks</button>
                <button onMouseDown={() => onSearchChange("Grocery")}><Sparkles size={13} /> Daily essentials</button>
                <button onMouseDown={() => onSearchChange("Personal Care")}><Sparkles size={13} /> Personal care</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        <div className="header-actions">
          <button className="header-action theme-toggle" data-magnetic onClick={() => setDarkMode((current) => !current)} aria-label="Toggle color mode">
            <span className="action-icon">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</span>
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>
          <div className="notification-menu-wrap">
            <button
              className="header-action notification-action"
              data-magnetic
              onClick={() => {
                setUpdatesOpen((current) => !current);
                setUnreadUpdates(0);
              }}
              aria-label={unreadUpdates ? `${unreadUpdates} unread shop updates` : "Shop updates"}
              aria-expanded={updatesOpen}
            >
              <span className="action-icon"><Bell size={20} />{unreadUpdates > 0 && <i>{unreadUpdates}</i>}</span>
              <span>Updates</span>
            </button>
            <AnimatePresence>
              {updatesOpen && (
                <motion.div className="updates-dropdown" role="dialog" aria-label="Shop updates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <div className="updates-heading"><strong>Shop updates</strong><span>Latest info</span></div>
                  <article><span className="update-icon"><Sparkles size={15} /></span><div><strong>Fresh picks for today</strong><p>Browse the latest products added by your local store.</p><small>Store news</small></div></article>
                  <article><span className="update-icon green"><Truck size={15} /></span><div><strong>Local delivery available</strong><p>Confirm delivery options and charges with the shop on WhatsApp.</p><small>Delivery</small></div></article>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="header-action" data-magnetic onClick={onShowFavorites} aria-label={`Show wishlist, ${favoriteCount} items`}>
            <span className="action-icon"><Heart size={20} />{favoriteCount > 0 && <i>{favoriteCount}</i>}</span>
            <span>Wishlist</span>
          </button>
          <div className="profile-menu-wrap">
            <button className="header-action" data-magnetic onClick={() => customer ? setProfileOpen((current) => !current) : onOpenAccount()} aria-label={customer ? `Open profile menu for ${customer.name}` : "Sign in"}>
              <span className="action-icon"><UserCircle size={20} /></span>
              <span>{customer ? customer.name.split(" ")[0] : "Account"}</span>
            </button>
            <AnimatePresence>
              {profileOpen && customer && (
                <motion.div className="profile-dropdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <div><strong>{customer.name}</strong><span>{customer.email}</span></div>
                  <button onClick={() => { setProfileOpen(false); onOpenAccount(); }}><User size={15} /> Profile & orders</button>
                  <button onClick={() => { setProfileOpen(false); onOpenAccount(); }}><PackageCheck size={15} /> My purchases</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="cart-menu-wrap">
            <button className="header-action cart-action" data-magnetic onClick={onOpenCart} aria-label={`Open cart, ${cartCount} items`}>
              <span className="action-icon"><ShoppingBag size={20} />{cartCount > 0 && <i>{cartCount}</i>}</span>
              <span>Cart</span>
            </button>
            {cartCount > 0 && <div className="cart-hover-preview"><ShoppingBag size={16} /><span>{cartCount} item{cartCount === 1 ? "" : "s"} in your basket</span><ChevronRight size={14} /></div>}
          </div>
        </div>
      </div>
      <nav className="category-nav" aria-label="Shop departments">
        <div className="category-nav-inner">
          <button onMouseEnter={() => setMegaMenuOpen(true)} onClick={() => { setMegaMenuOpen((current) => !current); onDepartmentSelect("All"); }} className="department-link"><SlidersHorizontal size={15} /> Shop all <ChevronDown size={13} /></button>
          <span className="nav-divider" />
          <button onClick={() => onDepartmentSelect("Grocery")}>Daily essentials</button>
          <button onClick={() => onDepartmentSelect("Home")}>Home & living</button>
          <button onClick={() => onDepartmentSelect("Personal Care")}>Personal care</button>
          <button onClick={() => onDepartmentSelect("Snacks")}>Snacks & more</button>
          <span className="nav-promise"><Truck size={15} /> Local delivery available</span>
        </div>
        <AnimatePresence>
          {megaMenuOpen && (
            <motion.div className="mega-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onMouseLeave={() => setMegaMenuOpen(false)}>
              {["Grocery", "Home", "Personal Care", "Snacks", "Fresh Products"].map((category, index) => (
                <button key={category} onClick={() => { setMegaMenuOpen(false); onDepartmentSelect(category); }}>
                  <span>{["G", "H", "P", "S", "F"][index]}</span>
                  <div><strong>{category}</strong><small>Explore daily picks</small></div>
                  <ChevronRight size={14} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

function ProductCard({ product, onAdd, isFavorite, onToggleFavorite, onQuickView }) {
  return (
    <motion.article className="product-card" data-glow initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} whileHover={{ y: -7 }}>
      <div className="product-image" onClick={() => onQuickView(product)}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder"><ShoppingBag size={38} /><span>{product.category}</span></div>
        )}
        {product.stock === 0 && <span className="unavailable">Unavailable</span>}
        {product.stock > 0 && product.stock <= 3 && <span className="stock-badge">Only {product.stock} left</span>}
        <button
          className={isFavorite ? "favorite-button is-favorite" : "favorite-button"}
          data-magnetic
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(product._id);
          }}
          aria-label={isFavorite ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button className="quick-view-button" data-magnetic onClick={() => onQuickView(product)}>Quick view</button>
      </div>
      <div className="product-details">
        <span className="product-category">{product.category}</span>
        <h3><button className="product-name-button" onClick={() => onQuickView(product)}>{product.name}</button></h3>
        <div className="availability"><span /> {product.stock > 0 ? "In stock" : "Currently unavailable"}</div>
        <div className="product-bottom">
          <strong>{formatPrice(product.price)}</strong>
          <button
            className="add-button"
            data-magnetic
            onClick={() => onAdd(product)}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function QuickView({ product, onClose, onAdd }) {
  if (!product) {
    return null;
  }

  return (
    <div className="overlay quick-view-overlay" onMouseDown={onClose}>
      <section className="quick-view-panel" onMouseDown={(event) => event.stopPropagation()} aria-label={`${product.name} details`}>
        <button className="icon-button quick-close" onClick={onClose} aria-label="Close product details"><X size={20} /></button>
        <div className="quick-image">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="image-placeholder"><ShoppingBag size={48} /><span>{product.category}</span></div>}
        </div>
        <div className="quick-info">
          <span className="product-category">{product.category}</span>
          <h2>{product.name}</h2>
          <strong className="quick-price">{formatPrice(product.price)}</strong>
          <p>Available from {shopConfig.name}. Add it to your basket and send your order directly to the shop on WhatsApp.</p>
          <div className="quick-stock"><PackageCheck size={17} /> {product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}</div>
          <button className="order-button" data-magnetic disabled={product.stock === 0} onClick={() => { onAdd(product); onClose(); }}>
            <ShoppingBag size={17} /> Add to basket
          </button>
        </div>
      </section>
    </div>
  );
}

function AccountModal({ open, onClose, token, customer, onAuthenticated, onLogout }) {
  const [mode, setMode] = useState("login");
  const [accountSection, setAccountSection] = useState("profile");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [profile, setProfile] = useState(customer);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile(customer);
  }, [customer]);

  useEffect(() => {
    if (!open || !token) {
      return;
    }
    async function loadAccount() {
      try {
        const [profileResponse, orderResponse] = await Promise.all([
          fetch(`${API_URL}/api/customer/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (profileResponse.ok) {
          setProfile(await profileResponse.json());
        }
        if (orderResponse.ok) {
          setOrders(await orderResponse.json());
        }
      } catch {
        setMessage("Could not load your account details.");
      }
    }
    loadAccount();
  }, [open, token]);

  if (!open) {
    return null;
  }

  async function authenticate(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const endpoint = mode === "register" ? "/api/customer/register" : "/api/customer/login";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not access your account.");
      }
      onAuthenticated(result);
      setForm({ name: "", email: "", phone: "", password: "" });
    } catch (authError) {
      setMessage(authError.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/customer/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not save profile.");
      }
      setProfile(result);
      onAuthenticated({ token, customer: result });
      setMessage("Profile updated.");
    } catch (profileError) {
      setMessage(profileError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay account-overlay" onMouseDown={onClose}>
      <section className="account-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{customer ? "MY ACCOUNT" : "WELCOME"}</span>
            <h2>{customer ? `Hi, ${customer.name.split(" ")[0]}` : "Customer account"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close account"><X size={20} /></button>
        </div>

        {!customer ? (
          <>
            <div className="account-tabs">
              <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button>
              <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Create account</button>
            </div>
            <form className="account-form" onSubmit={authenticate}>
              {mode === "register" && (
                <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
              )}
              <label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
              {mode === "register" && (
                <label>Phone number<input type="tel" maxLength={20} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91..." required /></label>
              )}
              <label>Password<input type="password" minLength={mode === "register" ? 8 : 1} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
              {message && <p className="error-message" role="alert">{message}</p>}
              <button className="order-button" data-magnetic disabled={loading}>{loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
            </form>
          </>
        ) : (
          <>
            <div className="account-tabs account-section-tabs">
              <button
                className={accountSection === "profile" ? "active" : ""}
                onClick={() => { setAccountSection("profile"); setMessage(""); }}
              >
                <User size={15} /> Profile info
              </button>
              <button
                className={accountSection === "orders" ? "active" : ""}
                onClick={() => setAccountSection("orders")}
              >
                <ShoppingBag size={15} /> My orders <span className="account-tab-count">{orders.length}</span>
              </button>
            </div>

            {accountSection === "profile" ? (
              <form className="account-profile" onSubmit={saveProfile}>
                <label>Full name<input value={profile?.name || ""} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label>
                <label>Phone number<input type="tel" maxLength={20} value={profile?.phone || ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} required /></label>
                <label>Email address<input value={profile?.email || ""} disabled /></label>
                {message && <p className={message === "Profile updated." ? "status-message" : "error-message"} role="status">{message}</p>}
                <button className="order-button" data-magnetic disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
              </form>
            ) : (
              <div className="account-orders">
                <div className="account-orders-heading">
                  <h3>My orders</h3>
                  <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
                </div>
                {orders.length === 0 ? (
                  <p className="empty-cart">No orders yet. Your new orders will appear here.</p>
                ) : orders.map((order) => (
                  <div className="account-order" key={order._id}>
                    <div>
                      <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <b>{formatPrice(order.total)}</b>
                    <span className="order-payment">{order.paymentMethod === "cod" ? "Cash on delivery" : "WhatsApp"}</span>
                    <span className={`order-status status-${order.status}`}><CircleCheck size={13} /> {order.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="logout-button" onClick={onLogout}><LogOut size={16} /> Logout</button>
          </>
        )}
      </section>
    </div>
  );
}

function Storefront() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    return [];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState("recommended");
  const [heroIndex, setHeroIndex] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [toast, setToast] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem("customer-token") || "");
  const [customerVerified, setCustomerVerified] = useState(false);
  const [pendingCartProduct, setPendingCartProduct] = useState(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState("");
  const authenticatedInCurrentSession = useRef(false);
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customer-profile") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!customerToken) {
      setCustomerVerified(false);
      setCustomer(null);
      setFavorites([]);
      setShowFavorites(false);
      return;
    }
    if (authenticatedInCurrentSession.current) {
      return;
    }
    let cancelled = false;
    async function verifyCustomer() {
      try {
        const response = await fetch(`${API_URL}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
        if (response.status === 401 || response.status === 404) {
          localStorage.removeItem("customer-token");
          localStorage.removeItem("customer-profile");
          if (!cancelled) {
            setCustomerToken("");
            setCustomer(null);
          }
          return;
        }
        if (!response.ok) {
          throw new Error("Could not verify your account. Please try again.");
        }
        const profile = await response.json();
        if (!cancelled) {
          setCustomer(profile);
          if (!authenticatedInCurrentSession.current) {
            setFavorites((profile.favorites || []).map((id) => id.toString()));
          }
          localStorage.setItem("customer-profile", JSON.stringify(profile));
          setCustomerVerified(true);
        }
      } catch (verificationError) {
        if (!cancelled) {
          setToast(`${verificationError.message || "Could not verify your account."} Sign in again before shopping.`);
        }
      }
    }
    setCustomerVerified(false);
    verifyCustomer();
    return () => {
      cancelled = true;
    };
  }, [customerToken]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const bannerTimer = window.setInterval(() => setHeroIndex((current) => (current + 1) % 3), 5500);
    return () => window.clearInterval(bannerTimer);
  }, []);

  useEffect(() => {
    const countdownTimer = window.setInterval(() => {
      setCountdown((current) => {
        let total = current.hours * 3600 + current.minutes * 60 + current.seconds - 1;
        if (total < 0) total = 6 * 3600;
        return {
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        };
      });
    }, 1000);
    return () => window.clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", shopConfig.colors.primary);
    document.documentElement.style.setProperty("--accent", shopConfig.colors.accent);
    document.title = shopConfig.name;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", shopConfig.colors.primary);
    const favicon = document.getElementById("shop-favicon");
    if (favicon) {
      favicon.setAttribute("href", shopConfig.faviconUrl || "/shop-favicon.svg");
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) {
          throw new Error("Products could not be loaded. Please try again later.");
        }
        setProducts(await response.json());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const productCategories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      if (product.available) {
        counts.set(product.category, (counts.get(product.category) || 0) + 1);
      }
    });
    return counts;
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchWords = normalizedSearch.split(/\s+/).filter(Boolean);
    const filteredProducts = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const searchableText = `${product.name} ${product.category}`.toLowerCase();
      const matchesSearch =
        searchWords.length === 0 ||
        searchWords.every((word) => searchableText.includes(word));
      const matchesFavorites = !showFavorites || favorites.includes(product._id);
      return product.available && matchesCategory && matchesSearch && matchesFavorites;
    });

    if (sortOrder === "price-low") {
      return filteredProducts.sort((first, second) => first.price - second.price);
    }
    if (sortOrder === "price-high") {
      return filteredProducts.sort((first, second) => second.price - first.price);
    }
    return filteredProducts;
  }, [products, activeCategory, search, sortOrder, showFavorites, favorites]);

  function addProductToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.product._id === product._id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
    setToast(`${product.name} added to your basket`);
  }

  function addToCart(product) {
    if (!customerVerified || !customerToken || !customer) {
      setPendingCartProduct(product);
      setAccountOpen(true);
      setToast("Sign in to add this item to your basket");
      return;
    }
    addProductToCart(product);
  }

  function changeQuantity(productId, quantity) {
    const product = products.find((item) => item._id === productId);
    if (!product || quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.product._id !== productId));
      return;
    }
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.min(quantity, product.stock) }
          : item,
      ),
    );
  }

  async function placeOrder(checkout) {
    if (cart.length === 0) {
      return false;
    }
    if (!customerVerified || !customerToken || !customer) {
      setAccountOpen(true);
      setToast("Sign in to place your order");
      return false;
    }
    try {
      setOrderError("");
      const { paymentMethod } = checkout;
      if (paymentMethod !== "whatsapp" && paymentMethod !== "cod") {
        throw new Error("Choose WhatsApp confirmation or cash on delivery.");
      }
      const whatsappUrl = paymentMethod === "whatsapp" ? makeWhatsAppUrl(cart, checkout) : "";
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
        },
        body: JSON.stringify({
          customerName: checkout.customerName,
          phone: checkout.phone,
          address: checkout.address,
          pincode: checkout.pincode,
          paymentMethod,
          items: cart.map(({ product, quantity }) => ({ productId: product._id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not place the order.");
      }
      setToast(paymentMethod === "cod"
        ? "COD order placed. The shop will contact you to confirm."
        : "Order saved. Continue in WhatsApp to confirm.");
      setCart([]);
      setCartOpen(false);
      if (paymentMethod === "whatsapp") {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
      return true;
    } catch (orderError) {
      setOrderError(orderError.message);
      return false;
    }
  }

  function toggleFavorite(productId) {
    if (!customerVerified || !customerToken || !customer) {
      setPendingFavoriteId(productId);
      setAccountOpen(true);
      setToast("Sign in to save items to your wishlist");
      return;
    }

    setFavorites((currentFavorites) => {
      const nextFavorites = currentFavorites.includes(productId)
        ? currentFavorites.filter((id) => id !== productId)
        : [...currentFavorites, productId];

      fetch(`${API_URL}/api/customer/wishlist`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ productIds: nextFavorites }),
      }).then(async (response) => {
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Could not update wishlist.");
        }
        const result = await response.json();
        setFavorites(result.favorites);
      }).catch((wishlistError) => {
        setError(wishlistError.message);
      });

      return nextFavorites;
    });
  }

  function authenticateCustomer(result) {
    authenticatedInCurrentSession.current = true;
    const authenticatedFavorites = (result.customer.favorites || []).map((id) => id.toString());
    setCustomerToken(result.token);
    setCustomer(result.customer);
    setCustomerVerified(true);
    setFavorites(authenticatedFavorites);
    setShowFavorites(false);
    localStorage.setItem("customer-token", result.token);
    localStorage.setItem("customer-profile", JSON.stringify(result.customer));
    if (pendingCartProduct) {
      addProductToCart(pendingCartProduct);
      setPendingCartProduct(null);
      setAccountOpen(false);
    }
    if (pendingFavoriteId) {
      const nextFavorites = [...new Set([...authenticatedFavorites, pendingFavoriteId])];
      setFavorites(nextFavorites);
      setPendingFavoriteId("");
      setAccountOpen(false);
      fetch(`${API_URL}/api/customer/wishlist`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${result.token}`,
        },
        body: JSON.stringify({ productIds: nextFavorites }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || "Could not update wishlist.");
        }
        const wishlist = await response.json();
        setFavorites(wishlist.favorites);
      }).catch((wishlistError) => {
        setError(wishlistError.message);
      });
    }
  }

  function logoutCustomer() {
    authenticatedInCurrentSession.current = false;
    setCustomerToken("");
    setCustomer(null);
    setCustomerVerified(false);
    setPendingCartProduct(null);
    setPendingFavoriteId("");
    setFavorites([]);
    setShowFavorites(false);
    localStorage.removeItem("customer-token");
    localStorage.removeItem("customer-profile");
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleMagneticPointerMove(event) {
    if (event.pointerType === "touch") {
      return;
    }
    const target = event.target.closest("[data-magnetic]");
    if (!target) {
      return;
    }
    const bounds = target.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    target.style.setProperty("--magnetic-x", `${offsetX.toFixed(2)}px`);
    target.style.setProperty("--magnetic-y", `${offsetY.toFixed(2)}px`);
  }

  function handleMagneticPointerOut(event) {
    const target = event.target.closest("[data-magnetic]");
    const nextTarget = event.relatedTarget;
    if (!target || (nextTarget instanceof Node && target.contains(nextTarget))) {
      return;
    }
    target.style.setProperty("--magnetic-x", "0px");
    target.style.setProperty("--magnetic-y", "0px");
  }

  return (
    <div
      className="storefront-shell"
      style={{
        "--primary": shopConfig.colors.primary,
        "--secondary": shopConfig.colors.secondary,
        "--accent": shopConfig.colors.accent,
      }}
      onPointerMove={handleMagneticPointerMove}
      onPointerOut={handleMagneticPointerOut}
    >
      <Header
        cartCount={cartCount}
        favoriteCount={favorites.length}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setActiveCategory("All");
          setShowFavorites(false);
          if (value.trim()) {
            window.requestAnimationFrame(() => {
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }
        }}
        onDepartmentSelect={(category) => {
          setSearch("");
          setActiveCategory(category);
          setShowFavorites(false);
          document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenCart={() => setCartOpen(true)}
        customer={customerVerified ? customer : null}
        onOpenAccount={() => setAccountOpen(true)}
        onShowFavorites={() => {
          setShowFavorites((current) => !current);
          setActiveCategory("All");
          document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <motion.div className="hero-copy" key={heroIndex} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
            <span className="hero-kicker"><span /> {["TODAY'S FRESH DROPS", "LIMITED WEEKEND OFFER", "FROM YOUR LOCAL STORE"][heroIndex]}</span>
            <h1>{["Everyday essentials.<", "Big savings.", "Freshness,"][heroIndex]}<br /><em>{["Delivered locally.", "Everyday.", "close to home."][heroIndex]}</em></h1>
            <p>{shopConfig.tagline}. Discover premium daily essentials, picked fresh for your neighbourhood.</p>
            <div className="hero-actions">
              <a className="hero-cta" data-magnetic href="#products">Shop now <ArrowRight size={17} /></a>
              <a className="hero-secondary" data-magnetic href="#flash-sale">View offers</a>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck size={15} /> Fresh & trusted</span>
              <span><Truck size={15} /> Local delivery</span>
            </div>
          </motion.div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-image-frame"><img src={shopConfig.heroBanner} alt="" className="hero-banner-image" /></div>
            <div className="floating-badge floating-badge-one"><Timer size={16} /> <span>Flash deal</span></div>
            <div className="floating-badge floating-badge-two"><Star size={15} fill="currentColor" /> <span>4.9 loved</span></div>
          </div>
          <div className="hero-countdown">
            <span>Offer ends in</span>
            <div><strong>{String(countdown.hours).padStart(2, "0")}</strong><b>:</b><strong>{String(countdown.minutes).padStart(2, "0")}</strong><b>:</b><strong>{String(countdown.seconds).padStart(2, "0")}</strong></div>
          </div>
          <div className="hero-dots">
            {[0, 1, 2].map((index) => <button key={index} className={index === heroIndex ? "active" : ""} onClick={() => setHeroIndex(index)} aria-label={`Show promotion ${index + 1}`} />)}
          </div>
        </section>

        <section className="service-strip" aria-label="Shop benefits">
          <div data-glow><span className="service-icon"><Truck size={18} /></span><span><strong>Local delivery</strong><small>Ask your shop for options</small></span></div>
          <div data-glow><span className="service-icon"><ShieldCheck size={18} /></span><span><strong>Shop with confidence</strong><small>Direct from your local store</small></span></div>
          <div data-glow><span className="service-icon"><Clock3 size={18} /></span><span><strong>Quick order</strong><small>Send your basket on WhatsApp</small></span></div>
        </section>

        <section className="category-showcase">
          <div className="section-heading marketplace-heading">
            <div><span className="eyebrow">EXPLORE THE STORE</span><h2>Top categories</h2></div>
            <button className="clear-filter" onClick={() => { setActiveCategory("All"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}>Browse everything <ArrowRight size={14} /></button>
          </div>
          <div className="top-category-grid">
            {productCategories.slice(0, 5).map((category, index) => {
              const presentation = getCategoryPresentation(category, index);
              const CategoryIcon = presentation.icon;
              const itemCount = categoryCounts.get(category) || 0;
              return (
                <motion.button
                  key={category}
                  className={`top-category-card category-theme-${presentation.name}`}
                  data-glow
                  data-magnetic
                  aria-label={`Browse ${category}, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                  whileHover={{ y: -5 }}
                  onClick={() => { setActiveCategory(category); setShowFavorites(false); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  <span className="category-card-head">
                    <span className="category-card-icon"><CategoryIcon size={24} /></span>
                    <small>{itemCount} {itemCount === 1 ? "item" : "items"}</small>
                  </span>
                  <span className="category-card-copy">
                    <strong>{category}</strong>
                    <span>Explore collection <ArrowRight size={14} /></span>
                  </span>
                  <span className="category-card-glow" aria-hidden="true" />
                </motion.button>
              );
            })}
            {!loading && productCategories.length === 0 && (
              <p className="category-empty">Store categories will appear here as products are added.</p>
            )}
          </div>
        </section>

        {!loading && visibleProducts.length > 0 && (
          <section className="flash-section" id="flash-sale">
            <div className="flash-heading">
              <div><span className="eyebrow">LIMITED TIME</span><h2><Timer size={22} /> Flash sale</h2></div>
              <div className="flash-countdown"><span>Ends in</span><strong>{String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}</strong></div>
            </div>
            <div className="flash-grid">
              {visibleProducts.slice(0, 4).map((product) => (
                <motion.article className="flash-card" data-glow key={product._id} whileHover={{ y: -5 }}>
                  <div className="flash-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <ShoppingBag size={32} />}<span>Hot deal</span></div>
                  <div><span>{product.category}</span><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong><button data-magnetic onClick={() => addToCart(product)}>Add <Plus size={14} /></button></div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        <section className="delivery-store-grid">
          <div className="delivery-checker" data-glow>
            <span className="eyebrow">DELIVERY CHECK</span>
            <h2>Available in your area?</h2>
            <p>Enter your pincode to check local delivery availability.</p>
            <div className="delivery-form">
              <input value={deliveryPincode} onChange={(event) => setDeliveryPincode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="Enter 6-digit pincode" inputMode="numeric" />
              <button onClick={() => setToast(deliveryPincode.length === 6 ? "Great! Delivery availability will be confirmed on WhatsApp." : "Please enter a valid 6-digit pincode")}><Navigation size={16} /> Check</button>
            </div>
          </div>
          <div className="store-timing" data-glow>
            <span className="store-open-dot" />
            <div><span className="eyebrow">STORE TIMINGS</span><h2>Open today</h2></div>
            <strong>8:00 AM — 10:00 PM</strong>
            <small>Visit us at {shopConfig.address}</small>
          </div>
        </section>

        <section className="shop-section" id="products">
          <div className="section-heading marketplace-heading">
            <div>
              <span className="eyebrow">MADE FOR YOUR EVERYDAY</span>
              <h2>{showFavorites ? "Your wishlist" : "Shop essentials"}</h2>
              <p>Thoughtful picks from your neighbourhood store.</p>
            </div>
            <label className="sort-control">
              <SlidersHorizontal size={16} />
              <span>Sort by</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort products">
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
          <div className="category-list marketplace-categories" aria-label="Product categories">
            {["All", ...productCategories].map((category) => {
              const itemCount = category === "All"
                ? products.filter((product) => product.available).length
                : categoryCounts.get(category) || 0;
              return (
                <button
                  key={category}
                  className={category === activeCategory ? "category active" : "category"}
                  onClick={() => { setActiveCategory(category); setShowFavorites(false); }}
                >
                  <span>{category}</span><small>{itemCount}</small>
                </button>
              );
            })}
          </div>
          <div className="results-meta">
            <span>{loading ? "Finding your products..." : `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"} to explore`}</span>
            {showFavorites && <button className="clear-filter" onClick={() => setShowFavorites(false)}>Clear wishlist filter <X size={13} /></button>}
          </div>
          {loading && <div className="product-grid">{[1, 2, 3, 4].map((item) => <div className="product-skeleton" key={item}><div /><span /><span /></div>)}</div>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {!loading && !error && visibleProducts.length === 0 && (
            <div className="empty-results">
              <span><Search size={25} /></span>
              <h3>{showFavorites ? "Your wishlist is waiting" : "No products found"}</h3>
              <p>{showFavorites ? "Tap the heart on a product to save it here." : "Try another search or choose a different category."}</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All"); setShowFavorites(false); }}>View all products</button>
            </div>
          )}
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={addToCart}
                isFavorite={favorites.includes(product._id)}
                onToggleFavorite={toggleFavorite}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </section>
        <section className="recommended-section">
          <div className="section-heading marketplace-heading">
            <div><span className="eyebrow">JUST FOR YOU</span><h2>Recommended picks</h2></div>
          </div>
          <div className="recommended-grid">
            {visibleProducts.slice(4, 8).map((product) => (
              <motion.article className="recommended-card" key={product._id} whileHover={{ y: -5 }}>
                <button className="recommended-image" onClick={() => setQuickViewProduct(product)}>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <ShoppingBag size={28} />}</button>
                <div><span>{product.category}</span><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div>
                <button className="recommended-add" data-magnetic onClick={() => addToCart(product)} aria-label={`Add ${product.name}`}><Plus size={16} /></button>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="reviews-section">
          <div className="review-heading"><span className="eyebrow">NEIGHBOURHOOD LOVE</span><h2>Customers keep coming back</h2></div>
          <div className="review-grid">
            {[
              ["Fresh quality and super quick delivery.", "Riya Sharma"],
              ["The easiest way to order from our local store.", "Arjun Mehta"],
              ["Great prices, clean packaging, and friendly service.", "Neha Patel"],
            ].map(([quote, name], index) => (
              <motion.article className="review-card" data-glow key={name} whileHover={{ y: -5 }}>
                <div className="review-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}</div>
                <p>“{quote}”</p>
                <div><span>{name.slice(0, 1)}</span><strong>{name}<small>Verified customer</small></strong></div>
              </motion.article>
            ))}
          </div>
        </section>
        <section className="visit-strip visit-location" data-glow>
          <div className="visit-details">
            <span className="visit-icon"><MapPin size={20} /></span>
            <div><strong>Visit our shop</strong><span>{shopConfig.address}</span></div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopConfig.address)}`} target="_blank" rel="noreferrer">Get directions <ArrowRight size={16} /></a>
          </div>
          <div className="shop-map">
            <iframe
              title={`Map showing ${shopConfig.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(shopConfig.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </main>
      <footer className="footer">
        <a className="footer-brand" href="/">
          {shopConfig.logoUrl ? (
            <img className="brand-logo footer-logo" src={shopConfig.logoUrl} alt="" />
          ) : (
            <span className="brand-mark"><Store size={17} /></span>
          )}
          {shopConfig.name}
        </a>
        <span>Local shopping, made simple.</span>
        <span>Orders are confirmed directly by the shop.</span>
      </footer>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="active"><Store size={19} /><span>Shop</span></button>
        <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}><SlidersHorizontal size={19} /><span>Explore</span></button>
        <button onClick={() => { setActiveCategory("All"); setShowFavorites(true); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}><Heart size={19} /><span>Wishlist</span></button>
        <button onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span>Cart</span>{cartCount > 0 && <i>{cartCount}</i>}</button>
        <button onClick={() => setAccountOpen(true)}><UserCircle size={19} /><span>Account</span></button>
      </nav>
      <button
        className="whatsapp-float"
        data-magnetic
        onClick={() => setCartOpen(true)}
        aria-label="Open basket to order on WhatsApp"
      >
        <MessageCircle size={21} />
        <span>Order on WhatsApp</span>
      </button>
      {toast && <div className="cart-toast" role="status"><ShoppingBag size={16} /> {toast}</div>}
      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        token={customerVerified ? customerToken : ""}
        customer={customerVerified ? customer : null}
        onAuthenticated={authenticateCustomer}
        onLogout={logoutCustomer}
      />
      {quickViewProduct && <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAdd={addToCart} />}
      {cartOpen && (
        <Cart
          cart={cart}
          customer={customerVerified ? customer : null}
          formatPrice={formatPrice}
          orderError={orderError}
          onClose={() => setCartOpen(false)}
          onChangeQuantity={changeQuantity}
          onOrder={placeOrder}
        />
      )}
    </div>
  );
}

function AdminPage() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ productCount: 0, customerCount: 0, orderCount: 0, revenue: 0 });
  const [activeView, setActiveView] = useState("overview");
  const categories = [...new Set(["Grocery", ...products.map((product) => product.category)])].sort();
  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    price: "",
    stock: "",
    imageUrl: "",
    available: true,
  });
  const [editingId, setEditingId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function loadAdminProducts(authToken) {
    const [productResponse, dashboardResponse, orderResponse] = await Promise.all([
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${authToken}` } }),
      fetch(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${authToken}` } }),
    ]);
    if (!productResponse.ok) throw new Error("Could not load products.");
    setProducts(await productResponse.json());
    if (dashboardResponse.ok) setStats(await dashboardResponse.json());
    if (orderResponse.ok) setOrders(await orderResponse.json());
    setToken(authToken);
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
      if (!response.ok) {
        throw new Error(result.message || "Sign-in failed.");
      }
      await loadAdminProducts(result.token);
      setPassword("");
    } catch (loginError) {
      setMessage(loginError.message);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setMessage("");
    const method = editingId ? "PUT" : "POST";
    const path = editingId ? `/api/products/${editingId}` : "/api/products";
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not save product.");
      }
      setForm({ name: "", category: "Grocery", price: "", stock: "", imageUrl: "", available: true });
      setEditingId("");
      await loadAdminProducts(token);
      setMessage("Product saved.");
    } catch (saveError) {
      setMessage(saveError.message);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not delete product.");
      }
      await loadAdminProducts(token);
      setMessage("Product deleted.");
    } catch (deleteError) {
      setMessage(deleteError.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not update order.");
      }
      await loadAdminProducts(token);
    } catch (statusError) {
      setMessage(statusError.message);
    }
  }

  if (!token) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-brand">
          <a className="footer-brand" href="/"><span className="brand-mark"><Store size={18} /></span>{shopConfig.name}</a>
          <div>
            <span className="eyebrow">SELLER WORKSPACE</span>
            <h1>Manage your shop with confidence.</h1>
            <p>Products, customers, orders and store performance — all in one place.</p>
          </div>
        </section>
        <section className="admin-login-form-wrap">
          <a className="back-link" href="/">← Back to shop</a>
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

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href="/"><span className="brand-mark"><Store size={19} /></span><div>{shopConfig.name}<small>Admin panel</small></div></a>
        <nav>
          <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}><LayoutDashboard size={18} /> Overview</button>
          <button className={activeView === "products" ? "active" : ""} onClick={() => setActiveView("products")}><Boxes size={18} /> Products</button>
          <button className={activeView === "orders" ? "active" : ""} onClick={() => setActiveView("orders")}><ShoppingCart size={18} /> Orders <span>{stats.orderCount}</span></button>
        </nav>
        <button className="admin-signout" onClick={() => setToken("")}><LogOut size={18} /> Sign out</button>
      </aside>
      <section className="admin-content">
        <header className="admin-topbar"><div><span>Seller dashboard</span><h1>{activeView === "overview" ? "Overview" : activeView === "products" ? "Products" : "Orders"}</h1></div><a href="/" target="_blank" rel="noreferrer">View shop <ArrowRight size={15} /></a></header>

        {activeView === "overview" && (
          <>
            <div className="admin-stat-grid">
              <article><span className="stat-icon"><ShoppingCart size={20} /></span><div><small>Total orders</small><strong>{stats.orderCount}</strong></div></article>
              <article><span className="stat-icon stat-orange"><PackageCheck size={20} /></span><div><small>Total revenue</small><strong>{formatPrice(stats.revenue)}</strong></div></article>
              <article><span className="stat-icon stat-blue"><Boxes size={20} /></span><div><small>Products</small><strong>{stats.productCount}</strong></div></article>
              <article><span className="stat-icon stat-purple"><Users size={20} /></span><div><small>Customers</small><strong>{stats.customerCount}</strong></div></article>
            </div>
            <section className="admin-card">
              <div className="admin-section-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent orders</h2></div><button className="text-button" onClick={() => setActiveView("orders")}>View all</button></div>
              {orders.length === 0 ? <p className="empty-cart">No orders have been placed yet.</p> : <div className="admin-table">{orders.slice(0, 5).map((order) => <div className="admin-table-row" key={order._id}><strong>#{order._id.slice(-6).toUpperCase()}</strong><span>{order.customerName}</span><b>{formatPrice(order.total)}</b><span className={`order-status status-${order.status}`}>{order.status}</span></div>)}</div>}
            </section>
          </>
        )}

        {activeView === "products" && (
          <>
            <section className="admin-card">
              <div className="admin-section-heading"><div><span className="eyebrow">CATALOGUE</span><h2>{editingId ? "Edit product" : "Add a product"}</h2></div></div>
              <form className="product-form" onSubmit={saveProduct}>
                <label>Product name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="100" /></label>
                <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
                <label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required /></label>
                <label className="wide-field">Image URL (optional)<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label>
                <label className="availability-field"><input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} /> Available to customers</label>
                <div className="form-actions"><button className="order-button">{editingId ? "Save changes" : "Add product"}</button>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(""); setForm({ name: "", category: "Grocery", price: "", stock: "", imageUrl: "", available: true }); }}>Cancel</button>}</div>
              </form>
              {message && <p className="status-message" role="status">{message}</p>}
            </section>
            <section className="admin-card">
              <div className="admin-section-heading"><div><span className="eyebrow">INVENTORY</span><h2>Current products ({products.length})</h2></div></div>
              {products.length === 0 ? <p>No products yet.</p> : <div className="admin-product-list">{products.map((product) => <div className="admin-product" key={product._id}><div><strong>{product.name}</strong><span>{product.category} · {formatPrice(product.price)} · Stock: {product.stock}</span></div><div className="admin-actions"><button className="text-button" onClick={() => { editProduct(product); }}>Edit</button><button className="text-button danger-text" onClick={() => deleteProduct(product._id)}>Delete</button></div></div>)}</div>}
            </section>
          </>
        )}

        {activeView === "orders" && (
          <section className="admin-card">
            <div className="admin-section-heading"><div><span className="eyebrow">FULFILMENT</span><h2>All orders ({orders.length})</h2></div></div>
            {orders.length === 0 ? <p>No orders yet.</p> : <div className="admin-orders-list">{orders.map((order) => <article className="admin-order" key={order._id}><div><strong>#{order._id.slice(-6).toUpperCase()}</strong><span>{order.customerName} · {order.phone}</span><small>{order.address}{order.pincode ? ` · ${order.pincode}` : ""}</small><small>{new Date(order.createdAt).toLocaleString()}</small><small>Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "WhatsApp"}</small></div><div className="order-items">{order.items.map((item) => <span key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</span>)}</div><b>{formatPrice(order.total)}</b><select value={order.status} onChange={(event) => updateOrderStatus(order._id, event.target.value)} aria-label={`Status for order ${order._id}`}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="packed">Packed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></article>)}</div>}
          </section>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return <Storefront />;
}
