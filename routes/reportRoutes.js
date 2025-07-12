const express = require('express');
const {
  getExpenseSummary,
  getBudgetVsActual,
  getGoalsProgress,
  generateExpensePdf,
  generateExpenseCsv,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/expenses/summary', protect, getExpenseSummary);
router.get('/budget-vs-actual', protect, getBudgetVsActual);
router.get('/goals-progress', protect, getGoalsProgress);
router.get('/expenses/pdf', protect, generateExpensePdf);
router.get('/expenses/csv', protect, generateExpenseCsv);

module.exports = router;