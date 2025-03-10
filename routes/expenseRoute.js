const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController")

router.get("/", expenseController.getExpenses);
router.get("/:id", expenseController.getExpenseById);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id/:month", expenseController.deleteExpenseById);
router.post("/", expenseController.createExpense);

module.exports = router;
