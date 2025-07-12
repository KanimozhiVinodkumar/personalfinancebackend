const express = require('express');
const {
  getGoals,
  getGoal,
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getGoals)
  .post(protect, addGoal);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.put('/:id/progress', protect, updateGoalProgress);

module.exports = router;