const incomeTransactionModel = require("../models/incomeTransactionModel");
const expenseModel = require("../models/expenseModel");
const budgetModel = require("../models/budgetModel");

const getIncomeTransactions = async() => {
    const incomeTransactions = await incomeTransactionModel.find();

    return {
        incomeTransactions,
    };
};

const getIncomeTransaction = async(id) => {
    const data = await incomeTransactionModel.findById(id);

    return data;
};

const getIncomeTransactionByCondition = async(condition) => {
    const data = await incomeTransactionModel.findOne(condition);

    return data;
};

const create = async(body) => {
    const incomeTransactionModelObj = new incomeTransactionModel(body);
    const data = await incomeTransactionModelObj.save();

    return data;
};

const updateIncomeTransaction = async(id, body) => {
    const data = await incomeTransactionModel.findByIdAndUpdate(id, body);

    return data;
};

const deleteIncomeTransaction = async(id) => {
    const data = [];
    data.push(await expenseModel.deleteMany({incomeTransactionId: id}));
    data.push(await budgetModel.deleteMany({incomeTransactionId: id}));
    data.push(await incomeTransactionModel.findByIdAndDelete(id));

    return data;
};

const createOrUpdate = async(newIncomeTransaction) => {
    const data = await incomeTransactionModel.updateOne(
        { name: newIncomeTransaction }, // Search condition
        { $setOnInsert: { name: newIncomeTransaction } }, // Only set fields on insert
        { upsert: true } // Create if not exists
    );

    return data;
};

module.exports = {
    getIncomeTransactions,
    getIncomeTransaction,
    create,
    updateIncomeTransaction,
    deleteIncomeTransaction,
    getIncomeTransactionByCondition,
    createOrUpdate,
};
