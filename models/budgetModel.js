const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    categoryId: { type: String, required: true },
    spent: { type: Number, required: true },
    limit: { type: Number, required: true },
    remaining: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
});

const Budget = mongoose.model("Budget", BudgetSchema);

module.exports = Budget;
