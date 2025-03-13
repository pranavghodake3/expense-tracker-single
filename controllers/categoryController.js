const categoryService = require("../services/categoryService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getcategories = async (req, res) => {
    try {
        const response = await categoryService.getcategories();
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const getcategory = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await categoryService.getcategory(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const create = async (req, res) => {
    try {
        const response = await categoryService.create(req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const updatecategory = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await categoryService.updatecategory(id, req.body);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deletecategory = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await categoryService.deletecategory(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deleteByMultipleIds = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await categoryService.deleteByMultipleIds(id);
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    getcategories,
    getcategory,
    create,
    updatecategory,
    deletecategory,
    deleteByMultipleIds,
};
