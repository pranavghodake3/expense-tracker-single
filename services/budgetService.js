const budgetModel = require("../models/budgetModel");
const { getcategories } = require("./categoryService");

const getBudgets = async() => {
    const budgets = await budgetModel.find();

    return {
        budgets,
    };
};

const getbudget = async(id) => {
    const data = await budgetModel.findById(id);

    return data;
};

const getBudgetByCondition = async(condition) => {
    const data = await budgetModel.findOne(condition);

    return data;
};

const create = async(body) => {
    const budgetModelObj = new budgetModel(body);
    const data = await budgetModelObj.save();

    return data;
};

const addCurrentMonthBudgets = async(body) => {
    const { categories } = await getcategories();
    const currentYear = new Date().getFullYear().toString();
    const currentMonth =  (new Date().getMonth()) + 1;
    console.log("currentYear: ",currentYear, "currentMonth: ",currentMonth)
    const data = [];
    for (let i = 0; i < categories.length; i++) {
        const budget = {
            spent: 0,
            limit: 50,
            remaining: 0,
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
    getbudget,
    create,
    updatebudget,
    deletebudget,
    getBudgetByCondition,
    createOrUpdate,
    addCurrentMonthBudgets,
};
