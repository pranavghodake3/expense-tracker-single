const expenseModel = require("../models/expenseModel");
const categoryModel = require("../models/categoryModel");
const budgetModel = require("../models/budgetModel");
const currentYear = new Date().getFullYear().toString();
const currentMonth =  (new Date().getMonth()) + 1;

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
            const newCategoryCreated = await createOrUpdate(newCategory);
            console.log("newCategoryCreated: ",newCategoryCreated)
            finalSubCategoryId = newCategoryCreated.upsertedId;
        }
        const expenseModelObj = new expenseModel({
            categoryId: finalSubCategoryId, amount, date, title,
        });
        const response = await expenseModelObj.save();
        const budget = await budgetModel.findOne({categoryId: finalSubCategoryId, month: currentMonth});
        console.log("Existing budget: ",budget)
        const spentTotal = parseFloat(budget.spent) + parseFloat(amount);
        const remainingTotal = parseFloat(budget.limit) - parseFloat(spentTotal);
        const updatedBudget = await budgetModel.findByIdAndUpdate(budget._id, {
            spent: spentTotal,
            remaining: remainingTotal,
        });
        console.log("updatedBudget: ",updatedBudget)
        data.push(response);
    }

    return data;
};

const updateExpense = async(id, body) => {
    const { categoryId, amount, date, title, newCategory } = body;
    let finalSubCategoryId = categoryId;
    // if (newCategory) {
    //     const newCategoryCreated = await categoryService.updateOne(
    //         { name: newCategory }, // Search condition
    //         { $setOnInsert: { name: newCategory } }, // Only set fields on insert
    //         { upsert: true } // Create if not exists
    //       );
    //     finalSubCategoryId = newCategoryCreated._id;
    // }
    const expenseModelObj = new expenseModel({
        amount, date, title, categoryId: finalSubCategoryId,
    });
    const data = await expenseModel.findByIdAndUpdate(id, {categoryId: finalSubCategoryId, amount, date, title});

    return data;
};

const deleteExpense = async(id) => {
    const expense = await expenseModel.findById(id);
    const expenseMonth = new Date(expense.date).getMonth();
    console.log("expense: ",expense, ", expenseMonth: ",expenseMonth)
    const budget = await budgetModel.findOne({categoryId: expense.categoryId, month: expenseMonth+1});
    console.log("budget: ",budget)
    if(budget){
        const spentTotal = parseFloat(budget.spent) - parseFloat(expense.amount);
        const remainingTotal = parseFloat(budget.limit) - parseFloat(spentTotal);
        const budgetUpdate = await budgetModel.findByIdAndUpdate(budget._id, {
            spent: spentTotal,
            remaining: remainingTotal,
        });
        console.log("budgetUpdate: ",budgetUpdate)
    }
    const data = await expenseModel.findByIdAndDelete(id);

    return data;
};

const deleteExpensesByCondition = async(condition) => {
    const data = await expenseModel.deleteMany(condition);

    return data;
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    deleteExpensesByCondition,
};
