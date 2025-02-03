import express from "express";
import cors from "cors";
import session from "express-session";
import UserRoutes from "./Routes/users.routes.js";
import AuthRoutes from "./Routes/auth.routes.js";
import PermissionRoutes from "./Routes/permission.routes.js";
import BrandsRoutes from "./Routes/brands.routes.js";
import ProductRoutes from "./Routes/category.routes.js";
import PaymentRoutes from "./Routes/payment_type.routes.js";
import SaleRoutes from "./Routes/sales.routes.js";
import ProductsRoutes from "./Routes/products.routes.js";
import InvoiceRoutes from "./Routes/invoice.routes.js";
import sequelizeStore from "connect-session-sequelize";
import SallingRoutes from "./Routes/salling.routes.js";
import db from "./Config/database.js";
import Expenses from "./Routes/expenses.routes.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

const sessionStore = sequelizeStore(session.Store);
const store = new sessionStore({
  db: db,
});

// Update CORS configuration to allow both frontend origins
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both origins
};
app.use(cors(corsOptions));

// Session middleware
app.use(
  session({
    secret: process.env.SESS_SECRET || "2759fkn3knvkebvuebfkgh3ubevgo",
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto", // Adjust for production with HTTPS
    },
  })
);

app.use(express.json());

// Routes
app.use("/api", UserRoutes);
app.use("/api", AuthRoutes);

app.use("/api", UserRoutes);
app.use("/api", AuthRoutes);
app.use("/api", PermissionRoutes);
app.use("/api", BrandsRoutes);
app.use("/api", ProductRoutes);
app.use("/api", PaymentRoutes);
app.use("/api", ProductsRoutes);
app.use("/api", SaleRoutes);
app.use("/api", Expenses);
app.use("/api", InvoiceRoutes);
app.use("/api", SallingRoutes);
app.use("/api", CustomerModel);
import CustomerModel from "./Routes/customer.routes.js";

// Database Connection & Sync (Uncomment to test database connection)
// (async () => {
//   try {
//     await db.authenticate();
//     console.log("Database connection established successfully.");
//     await db.sync(); // Sync the models if needed
//     console.log("Database synchronized successfully.");
//   } catch (error) {
//     console.error("Error connecting or synchronizing the database:", error);
//   }
// })();

// Sync session store
// store.sync();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is working at http://localhost:${PORT}`);
});
