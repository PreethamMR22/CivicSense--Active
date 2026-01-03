// This middleware handles async/await errors in route handlers
// It wraps the async function and catches any errors, passing them to Express's error handling middleware

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
