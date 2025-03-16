const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController")

router.get("/set-current-month", budgetController.addCurrentMonthBudgets);
router.get("/", budgetController.getBudgets);
router.get("/:id", budgetController.getBudget);
router.post("/", budgetController.create);
router.put("/:id", budgetController.updatebudget);
router.delete("/:id", budgetController.deletebudget);

module.exports = router;
