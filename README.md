# General Shop Website Template

A small, reusable MERN starter for a local shop. The customer-facing site reads
products from MongoDB and prepares an order message for WhatsApp. The customer
must send that message themselves; the shop confirms stock, delivery, and final
price.

The code is intentionally split into small files. Start with `client/src/App.jsx`
for the storefront, `client/src/config/shopConfig.js` for shop branding, and
`server/src/routes/productRoutes.js` for the product API.

## Requirements

- Node.js 20 or newer
- MongoDB (local or MongoDB Atlas)
- A WhatsApp number that can receive customer orders

## Run locally

1. Install dependencies from this folder:

   ```sh
   npm install
   ```

2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`,
   `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, and
   `ADMIN_PASSWORD` (at least 12 characters).
3. Create the initial admin account:

   ```sh
   npm run seed:admin
   ```

4. Optionally add starter products for local testing:

   ```sh
   npm run seed:products
   ```

5. Open two terminals in this folder:

   ```sh
   npm run server
   ```

   ```sh
   npm run client
   ```

5. Visit the storefront at `http://localhost:5173` and the separate admin app
   at `http://localhost:5174` (start it with `npm run admin`).

The client and admin Vite servers proxy `/api` requests to Express at port 5000.
For deployment, set `VITE_API_URL` to the backend's public origin when building
both frontends, and set `CLIENT_ORIGIN` on the backend to the comma-separated
deployed origins for the storefront and admin app. During development, both
localhost origins are allowed automatically.

## Customize for a shop

Edit `client/src/config/shopConfig.js` to update the shop name, tagline, address,
WhatsApp number, currency, and colors. Replace the empty WhatsApp number with
the shop's international number in digits only (country code included, no `+`,
spaces, or dashes). Add and maintain products through the admin page.

Product images are currently image URLs, not uploaded files. Use a reputable
image-hosting service if the shop needs uploads; do not put provider secrets in
the React app.

## Important behavior and security notes

- WhatsApp opens a prefilled message; it does not send an order automatically.
- Product prices shown in the message are a customer-facing estimate. Confirm
  stock, delivery charges, and final price before accepting an order.
  - Admins can permanently delete individual orders from order history after a
    confirmation prompt; deletion removes the history record and does not restore
    product stock.
  - Keep `.env` private. Use a long, unique `JWT_SECRET` and strong admin password.
- The starter has one admin account per database. It is designed for separate
  shop deployments, not for hosting many shops in one shared database.
- This is a learning-friendly starting point, not a complete production
  security or operations checklist. Before taking real customer data, add
  production monitoring, backups, rate limiting, and a privacy notice.
