const testService = require("../services/testService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const testFirstFunction = async (req, res) => {
    try {
        const response = await testService.testFirstFunction();
        return successResponse(res, response);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    testFirstFunction,
};
