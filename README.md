# General Shop Website Template

A small, reusable MERN starter for a local shop. The customer-facing site reads
products from MongoDB and supports cash-on-delivery orders or WhatsApp order
confirmation. WhatsApp opens a draft that customers send themselves; the shop
confirms stock, delivery, and final price.

The code is intentionally split into small files. Start with `client/src/App.jsx`
for the storefront, `client/src/config/shopConfig.js` for shop branding, and
`server/src/routes/productRoutes.js` for the product API.

## Requirements

- Node.js 20 or newer
- MongoDB (local or MongoDB Atlas)
- A WhatsApp number that can receive customer orders if WhatsApp confirmation is enabled

## Run locally

1. Install dependencies from this folder:

   ```sh
   npm install
   ```

2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`,
   `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, and
   `ADMIN_PASSWORD` (at least 12 characters).
   To use MongoDB Atlas, copy the Node.js connection URI from Atlas **Connect >
   Drivers**, replace the database-user/password/cluster placeholders, and put
   it in `server/.env` as `MONGODB_URI`. In Atlas, create a database user and
   allow your current IP in **Network Access**. URL-encode special characters in
   the database user's password. Never commit or share `server/.env`.
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
For Vercel, deploy `server/` as a separate project named `localshopwebsite-api`
and set its Root Directory to `server`. Add `MONGODB_URI`, `JWT_SECRET`
(at least 32 characters), and `CLIENT_ORIGIN` (the deployed storefront origin,
plus the admin origin if it is separately hosted) to the backend project's
Environment Variables, then deploy it.

Copy the backend's deployed origin into `VITE_API_URL` in the storefront
project's Environment Variables and redeploy the storefront. Set the same
variable for the admin project if it is deployed separately. Use the backend
origin only (no `/api` suffix or trailing slash). Never commit or share the
database URI or JWT secret. During development, both localhost origins are
allowed automatically.

For the currently deployed sites, set `CLIENT_ORIGIN` in the backend project to
`https://local-shop-website-one.vercel.app` and `VITE_API_URL` in the storefront
project to `https://local-shop-website-dusky.vercel.app`. Add the admin site's
origin to `CLIENT_ORIGIN` as a comma-separated value if it is hosted separately.

For a map of the backend modules, API routes, database models, and main customer
flows, see [the backend feature guide](./server/FEATURES.md). MongoDB connection
and disconnection are centralized in `server/src/config/database.js`.

## Customize for a shop

Edit `client/src/config/shopConfig.js` to update the shop name, tagline, address,
WhatsApp number, currency, and colors. Replace the empty WhatsApp number with
the shop's international number in digits only (country code included, no `+`,
spaces, or dashes). Add and maintain products through the admin page.

Product images are currently image URLs, not uploaded files. Use a reputable
image-hosting service if the shop needs uploads; do not put provider secrets in
the React app.

## Important behavior and security notes

- Visitors can browse products without an account. Sign in or create an account
  when adding products to the basket, saving favorites, or placing an order.
  New accounts require a name, email, phone number, and password.
- Checkout offers WhatsApp confirmation and cash on delivery. WhatsApp opens a
  prefilled message; it does not send the message automatically. COD orders are
  saved as pending until the shop confirms them.
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
