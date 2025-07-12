const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { generatePdf } = require('../utils/generatePdf');
const { generateCsv } = require('../utils/generateCsv');

// @desc    Get expense summary by category
// @route   GET /api/v1/reports/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    const summary = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get budget vs actual report
// @route   GET /api/v1/reports/budget-vs-actual
// @access  Private
exports.getBudgetVsActual = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    const report = await Promise.all(
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
          category: budget.category,
          budgeted: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentage: (spent / budget.amount) * 100,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get financial goals progress
// @route   GET /api/v1/reports/goals-progress
// @access  Private
exports.getGoalsProgress = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    const progress = goals.map((goal) => ({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      targetDate: goal.targetDate,
      daysRemaining: Math.ceil(
        (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate expense report PDF
// @route   GET /api/v1/reports/expenses/pdf
// @access  Private
exports.generateExpensePdf = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    const pdfDoc = await generatePdf(expenses, 'Expense Report');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=expense-report.pdf'
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};

// @desc    Generate expense report CSV
// @route   GET /api/v1/reports/expenses/csv
// @access  Private
exports.generateExpenseCsv = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    const csv = await generateCsv(expenses);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=expense-report.csv'
    );

    res.status(200).end(csv);
  } catch (err) {
    next(err);
  }
};