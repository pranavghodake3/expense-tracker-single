const expenseModel = require("../models/expenseModel");
const categoryService = require("../services/categoryService");

const getExpenses = async() => {
    const expenses = await expenseModel.find().sort({date: -1});

    return {
        expenses,
    };
};

const getExpenseById = async(id) => {
    const expense = await expenseModel.findById(id);

    return {
        expense,
    };
};

const createExpense = async(body) => {
    const data = [];
    for (let i = 0; i < body.length; i++) {
        const { categoryId, amount, date, title, newCategory } = body[i];
        let finalSubCategoryId = categoryId;
        if (newCategory) {
            const newCategoryCreated = await categoryService.createOrUpdate(newCategory);
            console.log("newCategoryCreated: ",newCategoryCreated)
            finalSubCategoryId = newCategoryCreated.upsertedId;
        }
        const expenseModelObj = new expenseModel({
            categoryId: finalSubCategoryId, amount, date, title,
        });
        const response = await expenseModelObj.save();
        data.push(response);
    }

    return data;
};

const updateExpense = async(id, body) => {
    const { categoryId, amount, date, title, newCategory } = body;
    let finalSubCategoryId = categoryId;
    if (newCategory) {
        const newCategoryCreated = await categoryService.updateOne(
            { name: newCategory }, // Search condition
            { $setOnInsert: { name: newCategory } }, // Only set fields on insert
            { upsert: true } // Create if not exists
          );
        finalSubCategoryId = newCategoryCreated._id;
    }
    const expenseModelObj = new expenseModel({
        amount, date, title, categoryId: finalSubCategoryId,
    });
    const data = await expenseModel.findByIdAndUpdate(id, {categoryId: finalSubCategoryId, amount, date, title});

    return data;
};

const deleteExpense = async(id) => {
    const data = await expenseModel.findByIdAndDelete(id);

    return data;
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
};
