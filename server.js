const express = require("express");
const app = express();
const expenseRoute = require("./routes/expenseRoute");
const categoryRoute = require("./routes/categoryRoute");
const budgetRoute = require("./routes/budgetRoute");
const incomeTransactionRoute = require("./routes/incomeTransactionRoute");
const homeRoute = require("./routes/homeRoute");
const bodyParser = require('body-parser');
const session = require("express-session");
const connectDB = require("./config/db");
require("dotenv").config();
connectDB();

const PORT = process.env.PORT ?? 5000;
app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
    })
  );
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static('public'));

// Home Route - Show Posts
app.get('/', homeRoute);
app.use("/expenses", expenseRoute);
app.use("/categories", categoryRoute);
app.use("/budgets", budgetRoute);
app.use("/income-transactions", incomeTransactionRoute);

app.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT)
});
