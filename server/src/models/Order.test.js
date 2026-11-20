import assert from "node:assert/strict";
import test from "node:test";
import Order from "./Order.js";

test("orders without a payment method default to WhatsApp", () => {
  const order = new Order();

  assert.equal(order.paymentMethod, "whatsapp");
});

test("orders accept cash on delivery and reject unknown methods", () => {
  const cashOnDeliveryOrder = new Order({ paymentMethod: "cod" });
  const invalidOrder = new Order({ paymentMethod: "online" });

  assert.equal(cashOnDeliveryOrder.validateSync()?.errors.paymentMethod, undefined);
  assert.ok(invalidOrder.validateSync()?.errors.paymentMethod);
});
