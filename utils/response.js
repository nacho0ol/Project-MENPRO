/**
 * Response handler untuk success response
 */
exports.successResponse = (data, message = 'Success', statusCode = 200) => {
    return {
        success: true,
        message: message,
        data: data,
        statusCode: statusCode
    };
};

/**
 * Response handler untuk error response
 */
exports.errorResponse = (message = 'Error', statusCode = 500, error = null) => {
    return {
        success: false,
        message: message,
        error: error,
        statusCode: statusCode
    };
};

/**
 * Pagination helper
 */
exports.paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};
