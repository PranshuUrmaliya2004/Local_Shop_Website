import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

function Cart({ cart, onClose, onChangeQuantity, onOrder, customer, formatPrice, orderError }) {
  const total = cart.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0,
  );
  const [customerName, setCustomerName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [placingOrder, setPlacingOrder] = useState(false);
  const detailsValid =
    customerName.trim() &&
    phone.trim() &&
    address.trim() &&
    /^[0-9]{6}$/.test(pincode);

  useEffect(() => {
    if (!customer) {
      return;
    }

    setCustomerName(customer.name || "");
    setPhone(customer.phone || "");
  }, [customer]);

  async function submitOrder() {
    setPlacingOrder(true);

    try {
      await onOrder({ customerName, phone, address, pincode, paymentMethod });
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="cart-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">YOUR BASKET</span>
            <h2>Your cart</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Add a few items to get started.</p>
        ) : (
          <>
            <ol className="checkout-steps" aria-label="Checkout progress">
              {["Delivery", "Payment", "Review"].map((step, index) => (
                <li
                  className={
                    checkoutStep === index + 1
                      ? "active"
                      : checkoutStep > index + 1
                        ? "complete"
                        : ""
                  }
                  key={step}
                  aria-current={checkoutStep === index + 1 ? "step" : undefined}
                >
                  <span>
                    {checkoutStep > index + 1 ? <CircleCheck size={14} /> : index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="cart-items">
              {cart.map(({ product, quantity }) => (
                <div className="cart-item" key={product._id}>
                  <div className="cart-item-info">
                    <div className="cart-thumb">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                    </div>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{formatPrice(product.price)} each</span>
                    </div>
                  </div>
                  <div className="quantity-control">
                    <button
                      onClick={() => onChangeQuantity(product._id, quantity - 1)}
                      aria-label={`Remove one ${product.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => onChangeQuantity(product._id, quantity + 1)}
                      aria-label={`Add one ${product.name}`}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <span>Estimated total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            {checkoutStep === 1 && (
              <>
                <div className="checkout-fields">
                  <label>
                    Full name
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      maxLength={20}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </label>
                  <label>
                    Delivery address
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="House / flat no., street, area, landmark"
                      autoComplete="street-address"
                      required
                    />
                  </label>
                  <label>
                    Pincode
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit pincode"
                      autoComplete="postal-code"
                      required
                    />
                  </label>
                </div>
                <p className="cart-note">
                  The shop will confirm availability, delivery charges, and final price.
                </p>
                <button
                  className="order-button"
                  data-magnetic
                  onClick={() => setCheckoutStep(2)}
                  disabled={!detailsValid}
                >
                  Continue to payment <ArrowRight size={18} />
                </button>
              </>
            )}

            {checkoutStep === 2 && (
              <>
                <fieldset className="payment-options">
                  <legend>Choose how to complete your order</legend>
                  <label className={paymentMethod === "whatsapp" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="whatsapp"
                      checked={paymentMethod === "whatsapp"}
                      onChange={() => setPaymentMethod("whatsapp")}
                    />
                    <span className="payment-option-icon whatsapp">
                      <MessageCircle size={18} />
                    </span>
                    <span>
                      <strong>Confirm on WhatsApp</strong>
                      <small>Review the prefilled order and send it to the shop.</small>
                    </span>
                  </label>
                  <label className={paymentMethod === "cod" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <span className="payment-option-icon cod">
                      <Truck size={18} />
                    </span>
                    <span>
                      <strong>Cash on delivery</strong>
                      <small>Pay cash when the shop delivers your order.</small>
                    </span>
                  </label>
                </fieldset>
                <div className="checkout-navigation">
                  <button
                    className="checkout-back-button"
                    data-magnetic
                    onClick={() => setCheckoutStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className="order-button"
                    data-magnetic
                    onClick={() => setCheckoutStep(3)}
                  >
                    Review order <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 3 && (
              <>
                <div className="checkout-review">
                  <div className="checkout-review-heading">
                    <strong>Delivery details</strong>
                    <button className="text-button" onClick={() => setCheckoutStep(1)}>
                      Edit
                    </button>
                  </div>
                  <p>
                    {customerName}
                    <br />
                    {phone}
                    <br />
                    {address}, {pincode}
                  </p>
                  <div className="checkout-review-heading">
                    <strong>Payment</strong>
                    <button className="text-button" onClick={() => setCheckoutStep(2)}>
                      Edit
                    </button>
                  </div>
                  <p>
                    {paymentMethod === "cod" ? "Cash on delivery" : "Confirm on WhatsApp"}
                  </p>
                  <div className="checkout-review-total">
                    <span>Estimated total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </div>
                {orderError && <p className="error-message" role="alert">{orderError}</p>}
                <p className="cart-note">
                  {paymentMethod === "cod"
                    ? "The shop will contact you to confirm your COD order."
                    : "WhatsApp opens with a draft. Your order is sent only after you press Send."}
                </p>
                <div className="checkout-navigation">
                  <button
                    className="checkout-back-button"
                    data-magnetic
                    onClick={() => setCheckoutStep(2)}
                  >
                    Back
                  </button>
                  <button
                    className="order-button"
                    data-magnetic
                    onClick={submitOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder
                      ? "Placing order..."
                      : paymentMethod === "cod"
                        ? "Place COD order"
                        : "Save & continue on WhatsApp"}
                    {!placingOrder && <ArrowRight size={18} />}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

export default Cart;
