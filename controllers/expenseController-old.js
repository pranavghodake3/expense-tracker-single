const expenseService = require("../services/expenseService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getExpenses = async (req, res) => {
    try {
        const month = req?.query?.month ?? null;
        const response = await expenseService.getExpenses(month);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const getCategories = async (req, res) => {
    try {
        const response = await expenseService.getCategories();
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const addExpense = async (req, res) => {
    try {
        console.log("req.body: ",req.body)
        const response = await expenseService.addExpense(req.body);
        req.session.formData = { success: true, message: "Expense added successfully!" };
        // res.redirect("/");
        return successResponse(res, response);
    } catch (error) {
        req.session.formData = { success: false, message: error.message };
        // res.redirect("/");
        return errorResponse(res, error);
    }
};

const updateExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await expenseService.updateExpense(id, req.body);
        req.session.formData = { success: true, message: "Expense updated successfully!" };
        return successResponse(res, response);
    } catch (error) {
        req.session.formData = { success: false, message: error.message };
        return errorResponse(res, error);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const month = req.params.month;
        const response = await expenseService.deleteExpense(id, month);
        req.session.formData = { success: true, message: "Expense deleted successfully!" };
        return successResponse(res, response);
    } catch (error) {
        req.session.formData = { success: false, message: error.message };
        return errorResponse(res, error);
    }
};

module.exports = {
    getExpenses,
    addExpense,
    getCategories,
    updateExpense,
    deleteExpense,
};
