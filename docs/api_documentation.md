# NutriKart API Endpoints Documentation

This document explicitly defines the core endpoints for the NutriKart application's Node.js & Express REST API architecture.
All protected routes require an `Authorization: Bearer <token>` passed in headers generated via Supabase JWT.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Description**: Registers a new user. Assigns specific roles. Admin role count is checked implicitly.
- **Body**: `{ email, password, full_name, phone_number, role }`
- **Limit Logic Check**: If `role` == `admin`, backend checks DB count. Rejects (403) if `count >= 2`.
- **Response**: `{ user_id, token, role }`

### `POST /api/auth/login`
- **Description**: Authenticates via Supabase Auth and returns user payload + JWT.
- **Body**: `{ email, password }`
- **Response**: `{ user_id, token, role, email }`

---

## 2. Admin Endpoints
*Role Middleware required:* `requireRole('admin')`

### `GET /api/admin/restaurants/pending`
- **Description**: Retrieves all restaurants whose status is currently `pending`. Admin reviews documents.
- **Response**: `[ { id, name, documents_urls, owner_details, ... } ]`

### `PATCH /api/admin/restaurants/:id/approve`
- **Description**: Approves a restaurant (`status = 'approved'`).
- **Response**: `{ message: 'Restaurant Approved Successfully.' }`

### `PATCH /api/admin/restaurants/:id/reject`
- **Description**: Rejects a restaurant (`status = 'rejected'`).
- **Response**: `{ message: 'Restaurant Rejected.' }`

---

## 3. Vendor Endpoints
*Role Middleware required:* `requireRole('vendor')`

### `POST /api/vendor/restaurants`
- **Description**: Vendor submits a restaurant registration. Status initialized to `pending`.
- **Body**: Uses `multipart/form-data` for documents (FSSAI, Shop License, ID Proof).
- **Response**: `{ restaurant_id, status }`

### `POST /api/vendor/food`
- **Description**: Add a food item. Calculates nutrition automatically using weight via Spoonacular.
- **Pre-requisite Check**: Verify Vendor's restaurant id is `status == 'approved'`. Returns 403 Forbidden otherwise.
- **Body**: `{ name, description, price, weight }`
- **Processing**: Controller triggers `spoonacularService.js` to process the weight string and extract nutrients -> JSONB.
- **Response**: `{ id, name, nutrients, ... }`

---

## 4. Customer Endpoints
*Role Middleware required:* `requireRole('customer')` (for cart & orders), Public for Browsing

### `GET /api/public/restaurants`
- **Description**: Get a list of *only* `approved` restaurants.
- **Response**: Array of Restaurants.

### `GET /api/public/restaurants/:id/menu`
- **Description**: Get food items for a specific approved restaurant.
- **Response**: Array containing `{ name, price, weight, nutrients: [ { name, amount, unit } ] }`

### `POST /api/customer/orders`
- **Description**: Places an order. Payment forced to `COD`.
- **Body**: `{ restaurant_id, items: [ { food_item_id, quantity } ], total_amount }`
- **Response**: `{ order_id, status: 'placed', message: 'Order created successfully.' }`

---

## 5. Delivery Boy Endpoints
*Role Middleware required:* `requireRole('delivery')`

### `GET /api/delivery/orders/assigned`
- **Description**: See orders assigned to the logged-in delivery driver.

### `PATCH /api/delivery/orders/:id/status`
- **Description**: Update order flow tracking.
- **Body**: `{ status }` (picked, delivered)
- **Response**: `{ order_id, new_status }`
