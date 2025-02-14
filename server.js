const express = require("express");
const app = express();
const testRoute = require("./routes/testRoute");
const bodyParser = require('body-parser');
require("dotenv").config();



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home Route - Show Posts
app.get('/', (req, res) => {
    let expenses = [{date: 'Fri,14-02-25', category: 'Petrol', amount: 500}];
    res.render('index', { expenses });
});

app.use("/test", testRoute);





app.listen(process.env.PORT, () => {
    console.log("Server started on PORT: ", process.env.PORT)
});
