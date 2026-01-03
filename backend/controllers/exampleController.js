// @desc    Get example data
// @route   GET /api/example
// @access  Public
export const getExample = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: 'This is an example response' }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getExample
};
