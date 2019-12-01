'use strict';

/**
 * Module dependencies.
 * ask model for data and load view
 * 
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Receipt = mongoose.model('Receipt');
const assign = Object.assign;

/**
 * Load receipt
 */

 exports.load = async(function*(req, res, next, id) {
  try {
    req.receipt = yield Receipt.load(id);
    if (!req.expense) return next(new Error('Receipt not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * Show new receipt form
 */

exports.new = function(req, res) {
  console.log(req.expense.id);
  res.render('receipts/new', {
    title: 'Add receipt',
    description: req.expense.title,
    receipt: new Receipt(),
    expense: req.expense
  });
};

/**
 * Save
 */

exports.create = async(function*(req, res) {
  const receipt = new Receipt(only(req.body, 'vendor itemsPurchased totalCost event purchasedDate'));
  receipt.user = req.user;
  receipt.expense = req.expense;

  try {
    yield receipt.save();
    req.flash('success', 'Receipt saved');
    res.redirect(`/expenses/${receipt.expense._id}`);
  } catch (err) {
    
    const newReceipt = new Receipt();

    res.status(422).render('receipts/new', {
      title: receipt.expense.title || 'Add receipt',
      errors: [err.toString()],
      expense: req.expense,
      receipt: receipt
    });
  }
});

/**
 * Delete
 */
exports.destroy = async(function*(req, res) {
  //yield req.expense.removeReceipt(req.params.receiptId);
  //req.flash('info', 'Removed receipt');
  //res.redirect(`/expenses/${req.expense.id}`);
});

/**
 * List
 */

exports.index = async(function*(req, res) {
  
  const expense = req.expense;
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const receipts = yield Receipt.list(options);
  const count = yield Receipt.countDocuments();

  res.render('receipts/index', {
    title: 'Receipts',
    expense: expense,
    receipts: receipts,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

