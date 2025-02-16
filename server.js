const express = require("express");
const app = express();
const expenseRoute = require("./routes/expenseRoute");
const homeRoute = require("./routes/homeRoute");
const bodyParser = require('body-parser');
const session = require("express-session");
require("dotenv").config();

const PORT = process.env.PORT ?? 5000;
app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
    })
  );
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home Route - Show Posts
app.get('/', homeRoute);
app.use("/expenses", expenseRoute);

app.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT)
});
