'use strict';

/**
 * Module dependencies.
 * ask model for data and load view
 * 
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
 * New receipt
 */

exports.new = function(req, res) {
  res.render('receipts/new', {
    title: 'New Receipt',
    receipt: new Receipt()
  });
};


/**
 * Create receipt
 */

exports.create = async(function*(req, res) {
  const expense = req.expense;
  console.log("controller");
  console.log(expense);
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
