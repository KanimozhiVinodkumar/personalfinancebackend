const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/v1/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single goal
// @route   GET /api/v1/goals/:id
// @access  Private
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add goal
// @route   POST /api/v1/goals
// @access  Private
exports.addGoal = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const goal = await Goal.create(req.body);

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update goal
// @route   PUT /api/v1/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user is goal owner
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this goal',
      });
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user is goal owner
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this goal',
      });
    }

    await goal.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update goal progress
// @route   PUT /api/v1/goals/:id/progress
// @access  Private
exports.updateGoalProgress = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user is goal owner
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this goal',
      });
    }

    // Update current amount
    if (req.body.amountToAdd) {
      goal.currentAmount += req.body.amountToAdd;
    } else if (req.body.currentAmount) {
      goal.currentAmount = req.body.currentAmount;
    }

    // Ensure current amount doesn't exceed target
    if (goal.currentAmount > goal.targetAmount) {
      goal.currentAmount = goal.targetAmount;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};