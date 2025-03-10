const { successResponse, errorResponse } = require("../utils/responseHelper");

const homeFirstFunction = async (req, res) => {
    try {
        return res.render('index');
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    homeFirstFunction,
};
