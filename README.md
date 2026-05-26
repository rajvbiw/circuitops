# Gada Electronics – AI Powered Electronics Marketplace

Welcome to **Gada Electronics**, a complete, production-ready full-stack e-commerce marketplace infused with an intelligent AI Assistant, inspired by the nostalgic electronics shop vibe!

---

## Step 1: Architecture

The application follows a modern MERN-like stack (using MySQL instead of MongoDB) with an AI integration layer.

1. **Frontend (Client)**: React.js + Vite + Tailwind CSS + Redux Toolkit.
2. **Backend (API)**: Node.js + Express.js. Handles business logic, authentication, and database interaction.
3. **Database**: MySQL. Relational data modeling for users, products, orders, etc.
4. **AI Layer**: An abstracted Provider interface that can dynamically use OpenAI, Claude, Ollama (Local), or a fallback mock.
5. **Storage & Payments**: Architected to support Cloudinary (images) and Razorpay (transactions).

---

## Step 2: Folder Structure

```text
gada-electronics/
├── backend/                  # Express API server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Route handlers (auth, products, admin, ai)
│   ├── middlewares/          # Custom middlewares (auth, error handling)
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (e.g., aiProvider.js for LLMs)
│   ├── .env                  # Environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express entry point
├── database/                 # MySQL setup scripts
│   ├── schema.sql            # Full table definitions and relationships
│   └── seed.sql              # Initial mock data for testing
├── frontend/                 # React client app (Vite)
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── assets/           # Images and icons
│   │   ├── components/       # Reusable UI (Navbar, Footer, ProductCard, GadaAIModal)
│   │   ├── pages/            # View components (Home, Dashboard, Cart, Auth)
│   │   ├── store/            # Redux Toolkit slices (auth, cart, products)
│   │   ├── utils/            # Helper functions (API axios instance)
│   │   ├── App.jsx           # App routing definition
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Styling configuration
└── README.md                 # Project documentation
```

---

## Step 3: Database Schema

The relational database is designed for scale and integrity:

- **Users**: Customers and Admins (`id`, `name`, `email`, `password_hash`, `role`).
- **Categories**: Product grouping (`id`, `name`, `slug`).
- **Products**: The catalog (`id`, `name`, `price`, `discount_price`, `stock_quantity`, `category_id`).
- **Inventory**: Detailed tracking (`id`, `product_id`, `bin_location`, `safety_stock`).
- **Addresses**: Shipping info (`id`, `user_id`, `street`, `city`, `pin_code`).
- **Coupons**: Discount management (`code`, `discount_value`, `active_until`).
- **Orders & OrderItems**: Transaction records and snapshots of purchased prices.
- **Cart & Wishlist**: User shopping session states.
- **Reviews**: Customer feedback (`rating`, `comment`).
- **Payments**: Razorpay transaction tracking.
- **AIChatHistory**: History for context-aware assistant memory.

*(See `database/schema.sql` for exact DDL statements, Foreign Keys, and Indexing.)*

---

## Step 4: Backend Implementation

The Node/Express backend provides a robust REST API:
- **Security**: JWT-based authentication for user sessions. Middleware protects private routes (`/api/v1/orders`, `/api/v1/dashboard`) and admin-only routes (`/api/v1/admin/*`).
- **Controllers**: Separated logic for `auth`, `products`, `cart`, `orders`, and `ai`.
- **Error Handling**: Centralized error catching via `errorHandler.js` prevents server crashes and returns consistent JSON structures.
- **API Prefixing**: Versioned API paths (e.g., `/api/v1/products`).

---

## Step 5: Frontend Implementation

The React frontend delivers a premium, dynamic, and modern UI:
- **Design System**: Dark blue with vibrant yellow accents, glassmorphism overlays, and smooth micro-animations.
- **State Management**: Redux Toolkit is utilized to manage `Auth`, `Cart`, and `Products` globally.
- **Routing**: `react-router-dom` enables SPA navigation between Home, Catalog, Checkout, Dashboards, and Auth pages.
- **Dashboards**: Dedicated `UserDashboard` (Profile, Orders, Addresses) and `AdminDashboard` (Analytics, CRUD tools).

---

## Step 6: AI Integration Layer

The **Gada AI Assistant** features a robust abstraction pattern located at `backend/services/aiProvider.js`.

- **Provider Agnostic**: Contains a base `AIProvider` class.
- **Plug-and-Play Implementations**: Includes classes for `OpenAIProvider` (GPT-4), `ClaudeProvider` (Anthropic), `OllamaProvider` (Local LLM), and a fallback `MockAIProvider`.
- **RAG (Retrieval-Augmented Generation)**: The AI endpoint fetches relevant product context from the MySQL database and feeds it to the LLM via a custom system prompt, ensuring the AI *never invents products* and strictly recommends real, available inventory.
- **Capabilities**: Configured to Handle: Product recommendations, feature comparisons, summarization, and troubleshooting.

---

## Step 7: Complete README (Local Setup Guide)

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
1. Open your MySQL client.
2. Execute the commands in `database/schema.sql` to create tables.
3. Execute `database/seed.sql` to populate initial products and an admin user.

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your details:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=gada_electronics
   JWT_SECRET=super_secret_key
   AI_PROVIDER=mock # options: mock, openai, claude, ollama
   OPENAI_API_KEY=your_key
   ```
4. Start the server: `npm run dev` (or `node server.js`)

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Start the dev server: `npm run dev`
4. Open the displayed local network URL in your browser.

**Enjoy building and scaling Gada Electronics!**
