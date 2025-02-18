const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController")

router.get("/", expenseController.getExpenses);
router.put("/:id", expenseController.updateExpense);
router.post("/", expenseController.addExpense);

module.exports = router;
