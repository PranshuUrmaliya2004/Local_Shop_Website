# Backend and Feature Guide

## Application structure

- `src/server.js` is the API entry point. It validates required environment
  variables, configures CORS and JSON parsing, mounts routes, and starts the
  HTTP server after MongoDB connects.
- `src/config/database.js` owns the shared Mongoose connect/disconnect helpers.
  The API and database seed scripts use the same connection code.
- `src/routes/` contains HTTP endpoints and request validation.
- `src/models/` defines MongoDB document schemas and relationships.
- `src/middleware/` validates admin and customer bearer tokens.
- `src/scripts/` contains commands for preparing the first admin and optional
  sample products.

The storefront UI is in `../client/src/App.jsx`; shop name, address, WhatsApp
number, currency, and branding settings are in
`../client/src/config/shopConfig.js`. The seller dashboard is in
`../admin/src/App.jsx`.

## MongoDB data

- **Product** (`models/Product.js`): name, category, price, stock, image URL, and
  availability.
- **Customer** (`models/Customer.js`): profile with required name, unique email,
  phone number, password hash, and favorite product IDs.
- **Order** (`models/Order.js`): customer/contact and delivery details, items,
  total, payment method, status, and timestamps. Each item stores a product
  reference plus name and price snapshots so the placed order remains
  understandable if a product is later changed. New orders must belong to a
  signed-in customer.
- **Admin** (`models/Admin.js`): unique email and password hash.

The connection URL is supplied by the `MONGODB_URI` environment variable. Keep
it in the private server environment; never put it in frontend configuration.

### Connect MongoDB Atlas

1. In Atlas, create a cluster and a **database user**. This is separate from
   your Atlas website login.
2. In **Network Access**, allow the public IP of the computer running this app.
   For a hosted backend later, allow the backend host's outbound IP instead.
3. Open the cluster's **Connect > Drivers** flow, choose Node.js, and copy the
   connection string.
4. Put the URI in `server/.env` as `MONGODB_URI`. Replace the username, password,
   and cluster placeholders, and use `general-shop` as the database name if you
   want to keep the default database. URL-encode special characters in the
   database user's password.
5. Restart the API with `npm run server`. The API and seed scripts use the same
   URI from this environment variable.

The `server/.env.example` keeps a local MongoDB URI as its default and shows
the Atlas URI shape in a comment. Do not paste a real Atlas URI or password into
that example file, frontend code, or a public Git repository.

## API features

All routes below are mounted under `/api`.

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /health` | Public | Basic API health response. |
| `GET /products` | Public | List products for the storefront. |
| `POST /products` | Admin | Add a product. |
| `PUT /products/:id` | Admin | Update product details and inventory. |
| `DELETE /products/:id` | Admin | Delete a product. |
| `POST /customer/register` | Public | Create a customer account and return a customer token. |
| `POST /customer/login` | Public | Verify customer credentials and return a token. |
| `GET /customer/profile` | Customer | Load the signed-in customer profile. |
| `PUT /customer/profile` | Customer | Update name and phone number. |
| `PUT /customer/wishlist` | Customer | Save that customer's favorite product IDs. |
| `POST /orders` | Customer | Validate products and quantities, reduce stock, and save the order. |
| `GET /orders/mine` | Customer | List the signed-in customer's orders. |
| `GET /orders` | Admin | List all orders. |
| `PATCH /orders/:id/status` | Admin | Change an order's fulfillment status. |
| `DELETE /orders/:id` | Admin | Delete an order record. |
| `POST /admin/login` | Public | Verify admin credentials and return an admin token. |
| `GET /admin/dashboard` | Admin | Return counts, revenue, and recent orders. |

Admin-only endpoints use `middleware/requireAdmin.js`; customer-only endpoints
use `middleware/requireCustomer.js`. Both require a valid JWT in the
`Authorization: Bearer <token>` header.

## Order flow

1. The signed-in client submits item IDs, quantities, delivery details, and a
   payment method (`whatsapp` or `cod`) with the customer's bearer token.
2. The API checks that each product is available and has enough stock, reduces
   inventory, and saves an order with item snapshots and the selected payment
   method.
3. WhatsApp orders open a prefilled message that the customer sends manually.
   COD orders are saved as pending for the shop to confirm.
4. An admin can review orders and update their status in the seller dashboard.

## Setup scripts

- `npm run seed:admin` creates or updates the admin account from
  `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- `npm run seed:products` inserts sample products if they are not already
  present.

Both scripts require `MONGODB_URI`. The API also requires a `JWT_SECRET` of at
least 32 characters. See the root README for local setup instructions.
