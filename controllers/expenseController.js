const expenseService = require("../services/expenseService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getExpenses = async (req, res) => {
    try {
        const response = await expenseService.getExpenses();
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const getExpenseById = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await expenseService.getExpenseById(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const createExpense = async (req, res) => {
    try {
        console.log("req.body: ",req.body)
        const response = await expenseService.createExpense(req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const updateExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await expenseService.updateExpense(id, req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deleteExpenseById = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await expenseService.deleteExpenseById(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpenseById,
};
