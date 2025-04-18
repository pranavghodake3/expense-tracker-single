const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    title: { type: String, required: false },
    categoryId: { type: String, required: true },
    amount: { type: Number, required: true },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
