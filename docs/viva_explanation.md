# NutriKart Viva & Architecture Reference Notes

## Project Overview for Viva
NutriKart is a specialized multi-role enterprise e-commerce food platform. It tackles a unique problem in food delivery: dynamic, weight-based nutritional tracking. 
Instead of static descriptions, vendors input the exact weight of a portion size (e.g., 150g), which NutriKart leverages through the **Spoonacular Natural Language API** to mathematically deduce the Macro & Micro nutritional payloads before persistently storing them as unstructured JSONB data.

### Key Workflows Tested in Viva

**1. The Admin Limit Validation**
*How does the system ensure only 2 admins exist at any time?*
- The backend features a specialized middleware check (`enforceAdminRegistrationLimit`) attached exclusively to the `/api/auth/register` endpoint. If a user attempts to send `role: 'admin'`, the middleware explicitly triggers a SQL Aggregate (`SELECT COUNT(*) FROM users WHERE role = 'admin'`). If the count equals or exceeds 2, it throws an edge-case HTTP 403 Forbidden payload, preventing the row insertion. 
- The React Frontend simultaneously obfuscates the Admin Signup radio-button globally using a `/api/public/admin-status` hook.

**2. The Restaurant Approval Pipeline**
*How do permissions flow from Vendor to their specific Dashboard menus?*
- Creating an account does not inherently grant a vendor permissions to write records into the `food_items` db schema.
- Upon signup, the vendor's required workflow is to submit physical document logic to Supabase Storage (FSSAI, GST, License). A `Restaurant` record is created pointing to these Storage URLs and mapped as `status: 'pending'`.
- Only an authenticated `/api/admin/` route can issue a `PATCH` updating the `status` enum string to `approved`.
- The vendor's subsequent requests to `/api/vendor/food` are gated by a middleware that queries the `restaurants` schema to verify status before parsing the body.

**3. Spoonacular Extensibility**
*Why dynamically calculate Nutrition rather than manual entry?*
- It reduces administrative overhead for standard street-vendors who lack certified nutritionists.
- NutriKart sends natural language formats (e.g. `150g Paneer Butter Masala`) to the Spoonacular `guessNutrition` API. This external service uses generalized food-science mappings to return total Calories, Fat, and Proteins.
- The Node.js Backend structures this into an Array of Objects and writes it to a dynamic PostgreSQL `JSONB` column on the `food_items` record. This allows arbitrary micro-nutrients (e.g., Calcium, Sugar) to be stored without schema migrations.

**4. Role Based Access Control (RBAC) Mechanics**
*How are unauthorized users stopped from viewing data?*
- Supabase JWTs are leveraged heavily. The Express backend reads the JWT `Authorization` header.
- The JWT decodes to reveal the `sub` (UUID). The backend extracts the role linked to that UUID in `public.users` (or via custom App Metadata Claims).
- The `authorizeRole(['admin', 'vendor'])` middleware acts as a gatekeeper against malicious API calls.

## System Characteristics
* **Security:** Supabase handles brute-force protection, JWT generation, and password hashing organically.
* **Performance:** Vercel automatically deploys the frontend via Edge Networks globally.
* **Database Model:** Normalization is practiced to map Users -> Restaurants -> Food Items seamlessly. Extraneous JOIN overhead is reduced by adopting JSONB arrays within `food_items` directly.
* **Payment constraints:** Payment is strictly limited to Cash on Delivery (COD), simplifying legal liabilities tied to online gateways and maintaining immediate scope focus on the logistical software stack matching Vendors with Buyers.
