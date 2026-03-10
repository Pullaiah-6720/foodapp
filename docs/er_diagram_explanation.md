# NutriKart ER Diagram Explanation

The NutriKart Entity-Relationship (ER) model maps out the Multi-Role Food Marketplace. It integrates Authentication (Supabase Auth), Users, Restaurants, Food Items (with JSONB Nutrition), and Orders.

## Core Entities and Their Relationships

### 1. `users` Table
- **Purpose**: Stores all application users, linked securely to Supabase `auth.users` via UUID. Includes Role-Based Access Control (RBAC).
- **Key Attributes**: `id`, `email`, `role` (admin, vendor, customer, delivery), `phone_number`.
- **Relationships**: 
  - 1 User (Vendor) -> 1 or Many `restaurants`
  - 1 User (Customer) -> Many `orders`
  - 1 User (Delivery) -> Many `orders`

### 2. `restaurants` Table
- **Purpose**: Vendor's business entity, requires approval from the Admin before usage. Mapped directly to the Vendor (`vendor_id`).
- **Key Attributes**: Basic Details, Owner Details, Document Resource URLs from Supabase Storage, and `status` (`pending`, `approved`, `rejected`).
- **Relationships**: 
  - Mapped to `users` (vendor) on `vendor_id`.
  - 1 Restaurant -> Many `food_items`.
  - 1 Restaurant -> Many `orders`.

### 3. `food_items` Table
- **Purpose**: Items sold by an approved restaurant, enriched by the Spoonacular API upon creation.
- **Key Attributes**: `name`, `price`, `weight` (portion in grams), and `nutrients` (a `JSONB` column storing dynamic arrays of data like Calories, Carbs, Fat, etc.).
- **Relationships**:
  - Mapped to `restaurants` on `restaurant_id`.
  - 1 Food Item -> Many `order_items`.

### 4. `orders` Table
- **Purpose**: Represents a Customer transaction directed towards a specific Restaurant. Only supports COD.
- **Key Attributes**: `total_amount`, `payment_type` (default 'COD'), `status` (placed, confirmed, preparing, picked, delivered).
- **Relationships**:
  - Mapped to `users` (customer) on `customer_id`.
  - Mapped to `restaurants` on `restaurant_id`.
  - Mapped to `users` (delivery_boy) on `delivery_boy_id`.
  - 1 Order -> Many `order_items`.

### 5. `order_items` Table
- **Purpose**: The bridge/associative table to breakdown standard many-to-many relationship mapping between Orders and Food Items. Captures historically accurate price limits to prevent retroactive pricing bugs.
- **Key Attributes**: `quantity`, `price` (historical freeze).
- **Relationships**:
  - Mapped to `orders` on `order_id`.
  - Mapped to `food_items` on `food_item_id`.

## ER Logical Flow

1. An account is created in `auth.users`, pushing a public row to **USERS**.
2. A Vendor attempts to submit a row to **RESTAURANTS**. It is flagged as `pending`.
3. An Admin updates the row in **RESTAURANTS** to `approved`.
4. The vendor can now populate **FOOD_ITEMS** referencing their restaurant. Spoonacular writes array data into the `nutrients` JSONB column.
5. A Customer constructs a cart and submits an **ORDER**, generating `order_items` spanning across food choices.
6. The RESTAURANT updates status to `preparing`.
7. Once ready, a Delivery Boy picks it up and resolves the foreign key `delivery_boy_id` in the **ORDER**, ending the flow as `delivered`.
