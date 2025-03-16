const mongoose = require("mongoose");

const IncomeTransactionSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    spentTotal: { type: Number, required: true },
});

const IncomeTransaction = mongoose.model("IncomeTransaction", IncomeTransactionSchema);

module.exports = IncomeTransaction;
