const homeService = require("../services/homeService");
const { getExpenses } = require("../services/expenseService")
const { successResponse, errorResponse } = require("../utils/responseHelper");

const homeFirstFunction = async (req, res) => {
    try {
        const data = await getExpenses();
        const formData = req.session?.formData ?? {};
        data.formData = formData;
        if(req.session?.formData)   req.session.formData = null;
        return res.render('index', data);
    } catch (error) {
        return errorResponse(res, error);
    }
};

module.exports = {
    homeFirstFunction,
};
