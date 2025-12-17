/**
 * Middleware untuk log request
 */
exports.requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

/**
 * Middleware untuk set response headers
 */
exports.setHeaders = (req, res, next) => {
    res.header('X-Powered-By', 'Express');
    next();
};