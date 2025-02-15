
const successResponse = (res, data, message = "Success") => {
    return res.status(200).json({
      status: true,
      message,
      data,
    });
};

const errorResponse = (res, error = null, message = "An error occurred, please contact developer.", code = 500) => {
  console.log(error)
    return res.status(code).json({
      status: false,
      message,
      ...(error && { error: error.toString() }),
    });
};

const validationError = (res, errors, code = 422) => {
    return res.status(code).json({
      status: false,
      message: "Validation errors",
      errors,
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationError,
};
