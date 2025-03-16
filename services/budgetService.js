const budgetModel = require("../models/budgetModel");
const expenseModel = require("../models/expenseModel");
const { getcategories } = require("./categoryService");
const currentYear = new Date().getFullYear().toString();
const currentMonth =  (new Date().getMonth());
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getBudgets = async(month = null) => {
    const monthIndex = month ? months.indexOf(month) : currentMonth;
    const budgets = await budgetModel.find({month: monthIndex});

    return {
        budgets,
    };
};

const getBudget = async(id) => {
    const data = await budgetModel.findById(id);

    return data;
};

const getBudgetByCondition = async(condition) => {
    const data = await budgetModel.findOne(condition);

    return data;
};

const create = async(body) => {
    const startDate = new Date(currentYear, body.month, 1);
    const endDate = new Date(currentYear, body.month+1, 1);
    const expenses = await expenseModel.find({
        date: { $gte: startDate, $lt: endDate },
        categoryId: body.categoryId,
    }).sort({date: -1});
    let categoryTotal = 0;
    expenses.forEach(expense => {
        categoryTotal += parseFloat(expense.amount)
    });
    body.spent = categoryTotal;
    body.remaining = parseFloat(body.limit) - categoryTotal;

    const budgetModelObj = new budgetModel(body);
    const budget = await budgetModelObj.save();

    

    return budget;
};

const addCurrentMonthBudgets = async(body) => {
    const { categories } = await getcategories();
    const data = [];
    for (let i = 0; i < categories.length; i++) {
        const budget = {
            spent: 0,
            limit: 50,
            remaining: 50,
        }
        const response = await budgetModel.updateOne(
            { categoryId: categories[i]._id, year: currentYear, month: currentMonth },
            { $set: budget }, // Only set fields on insert
            { upsert: true } // Create if not exists
        );
        data.push(response);
    }

    return data;
};

const updatebudget = async(id, body) => {
    const data = await budgetModel.findByIdAndUpdate(id, body);

    return data;
};

const deletebudget = async(id) => {
    const data = await budgetModel.findByIdAndDelete(id);

    return data;
};

const deleteBudgetsByCondition = async(condition) => {
    const data = await budgetModel.deleteMany(condition);

    return data;
};

const createOrUpdate = async(newBudget) => {
    const data = await budgetModel.updateOne(
        { name: newBudget }, // Search condition
        { $setOnInsert: { name: newBudget } }, // Only set fields on insert
        { upsert: true } // Create if not exists
    );

    return data;
};

module.exports = {
    getBudgets,
    getBudget,
    create,
    updatebudget,
    deletebudget,
    getBudgetByCondition,
    createOrUpdate,
    addCurrentMonthBudgets,
    deleteBudgetsByCondition,
};
