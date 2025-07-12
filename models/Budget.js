const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Food',
      'Transportation',
      'Housing',
      'Entertainment',
      'Utilities',
      'Healthcare',
      'Education',
      'Shopping',
      'Other',
    ],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Budget', budgetSchema);