const express = require("express");
const router = express.Router();
const incomeTransactionController = require("../controllers/incomeTransactionController")

router.get("/", incomeTransactionController.getIncomeTransactions);
router.get("/:id", incomeTransactionController.getIncomeTransaction);
router.post("/", incomeTransactionController.create);
router.put("/:id", incomeTransactionController.updateIncomeTransaction);
router.delete("/:id", incomeTransactionController.deleteIncomeTransaction);

module.exports = router;
