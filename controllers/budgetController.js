const budgetService = require("../services/budgetService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getBudgets = async (req, res) => {
    try {
        const month = req?.query?.month ?? null;
        const response = await budgetService.getBudgets(month);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const getBudget = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await budgetService.getBudget(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const create = async (req, res) => {
    try {
        const response = await budgetService.create(req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const addCurrentMonthBudgets = async (req, res) => {
    try {
        const response = await budgetService.addCurrentMonthBudgets(req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const updatebudget = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await budgetService.updatebudget(id, req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deletebudget = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await budgetService.deletebudget(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getBudgets,
    getBudget,
    create,
    updatebudget,
    deletebudget,
    addCurrentMonthBudgets,
};
