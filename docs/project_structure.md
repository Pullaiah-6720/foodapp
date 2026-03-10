```markdown
# NutriKart Project Structure

Below is the complete production-ready folder structure for the NutriKart Full-Stack Application.

## Root Directory (`/Nutrikart`)
├── backend/                       # Node.js + Express.js API
│   ├── .env                       # Environment Variables (Spoonacular API Key, Supabase Keys)
│   ├── package.json               # Backend Dependencies
│   ├── server.js                  # Entry Point
│   ├── src/                       # Application Source Files
│   │   ├── config/                # Configuration Files
│   │   │   ├── db.js              # Supabase Client Initialization
│   │   ├── controllers/           # Route Logic
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── vendorController.js
│   │   │   ├── orderController.js
│   │   │   └── foodController.js
│   │   ├── middleware/            # Custom Middleware
│   │   │   ├── authMiddleware.js  # Verify Supabase JWT & Extract User
│   │   │   ├── roleMiddleware.js  # Role-Based Access Control
│   │   ├── routes/                # API Endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── vendorRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── foodRoutes.js
│   │   ├── services/              # External API & Business Logic
│   │   │   ├── spoonacularService.js
│   │   │   └── storageService.js  # Supabase Storage Logic (Docs Upload)
│   │   └── utils/                 # Utility Functions (Formatting, Validation)
│   │       ├── responseHandler.js
│   │       └── validators.js      # Input validation using Joi / Zod
│
├── frontend/                      # React.js UI built with Vite
│   ├── .env                       # Environment Variables
│   ├── package.json               # Frontend Dependencies
│   ├── vite.config.js             # Vite Config
│   ├── src/                       # React Source Files
│   │   ├── assets/                # Images, Icons
│   │   ├── components/            # Reusable UI Components
│   │   │   ├── common/            # Buttons, Inputs, Modals
│   │   │   ├── layout/            # Navbar, Sidebar, Footer
│   │   │   └── cards/             # FoodCard, RestaurantCard
│   │   ├── context/               # React Context API (Auth Context)
│   │   ├── hooks/                 # Custom React Hooks
│   │   ├── pages/                 # Full Page Components
│   │   │   ├── Home/
│   │   │   ├── Auth/              # Login, Register
│   │   │   ├── Admin/             # Admin Dashboard, Approvals
│   │   │   ├── Vendor/            # Vendor Dashboard, Add Food
│   │   │   ├── Customer/          # Browse, Cart, Orders
│   │   │   └── Delivery/          # Delivery Dashboard
│   │   ├── services/              # API Client (Axios configuration)
│   │   │   └── api.js
│   │   ├── styles/                # Global CSS (or Tailwind)
│   │   │   └── globals.css
│   │   └── App.jsx                # Main App Component + Router Setup
│   └── index.html                 # HTML Template
│
├── db/                            # Database Files
│   └── supabase_schema.sql        # Table Creation SQL Script
│
└── docs/                          # Documentation Deliverables
    ├── project_structure.md
    ├── er_diagram_explanation.md
    ├── api_documentation.md
    ├── deployment_steps.md
    └── viva_explanation.md
```
