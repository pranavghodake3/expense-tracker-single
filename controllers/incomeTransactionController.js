const incomeTransactionService = require("../services/incomeTransactionService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getIncomeTransactions = async (req, res) => {
    try {
        const response = await incomeTransactionService.getIncomeTransactions();
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const getIncomeTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await incomeTransactionService.getIncomeTransaction(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const create = async (req, res) => {
    try {
        const response = await incomeTransactionService.create(req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const updateIncomeTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await incomeTransactionService.updateIncomeTransaction(id, req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deleteIncomeTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await incomeTransactionService.deleteIncomeTransaction(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getIncomeTransactions,
    getIncomeTransaction,
    create,
    updateIncomeTransaction,
    deleteIncomeTransaction,
};
