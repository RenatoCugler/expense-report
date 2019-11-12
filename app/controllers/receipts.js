'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');

/**
 * Load receipt
 */

exports.load = function(req, res, next, id) {
  req.receipt = req.expense.receipts.find(receipt => receipt.id === id);

  if (!req.receipt) return next(new Error('Receipt not found'));
  next();
};

/**
 * Create receipt
 */

exports.create = async(function*(req, res) {
  const expense = req.expense;
  yield expense.addReceipt(req.user, req.body);
  res.redirect(`/expenses/${expense._id}`);
});

/**
 * Delete receipt
 */

exports.destroy = async(function*(req, res) {
  yield req.expense.removeReceipt(req.params.receiptId);
  req.flash('info', 'Removed receipt');
  res.redirect(`/expenses/${req.expense.id}`);
});
