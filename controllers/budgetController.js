const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get all budgets
// @route   GET /api/v1/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user.id,
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate || new Date(),
          },
        });

        const spent = expenses.reduce(
          (total, expense) => total + expense.amount,
          0
        );

        return {
          ...budget.toObject(),
          spent,
          remaining: budget.amount - spent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpent.length,
      data: budgetsWithSpent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single budget
// @route   GET /api/v1/budgets/:id
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Calculate spent amount
    const expenses = await Expense.find({
      user: req.user.id,
      category: budget.category,
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate || new Date(),
      },
    });

    const spent = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const budgetWithSpent = {
      ...budget.toObject(),
      spent,
      remaining: budget.amount - spent,
    };

    res.status(200).json({
      success: true,
      data: budgetWithSpent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add budget
// @route   POST /api/v1/budgets
// @access  Private
exports.addBudget = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    // Set end date based on period
    if (req.body.period === 'weekly') {
      req.body.endDate = new Date(
        new Date(req.body.startDate).getTime() + 7 * 24 * 60 * 60 * 1000
      );
    } else if (req.body.period === 'monthly') {
      const date = new Date(req.body.startDate);
      req.body.endDate = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
    } else if (req.body.period === 'yearly') {
      const date = new Date(req.body.startDate);
      req.body.endDate = new Date(
        date.getFullYear() + 1,
        date.getMonth(),
        date.getDate()
      );
    }

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Make sure user is budget owner
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this budget',
      });
    }

    // Update end date if period or start date changed
    if (req.body.period || req.body.startDate) {
      const period = req.body.period || budget.period;
      const startDate = req.body.startDate
        ? new Date(req.body.startDate)
        : budget.startDate;

      if (period === 'weekly') {
        req.body.endDate = new Date(
          startDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      } else if (period === 'monthly') {
        req.body.endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate()
        );
      } else if (period === 'yearly') {
        req.body.endDate = new Date(
          startDate.getFullYear() + 1,
          startDate.getMonth(),
          startDate.getDate()
        );
      }
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Make sure user is budget owner
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this budget',
      });
    }

    await budget.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};