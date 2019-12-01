'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const Expense = mongoose.model('Expense');
const Receipt = mongoose.model('Receipt');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.expense = yield Expense.load(id);
    if (!req.expense) return next(new Error('Expense not found'));

    req.expense.receipts = yield Receipt.find().where('expense').equals(req.expense.id);

  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async(function*(req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 15;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const expenses = yield Expense.list(options);
  const count = yield Expense.countDocuments();

  res.render('expenses/index', {
    title: 'Expenses',
    expenses: expenses,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New expense
 */

exports.new = function(req, res) {
  res.render('expenses/new', {
    title: 'New Expense',
    expense: new Expense()
  });
};

/**
 * Create an expense
 */

exports.create = async(function*(req, res) {
  const expense = new Expense(only(req.body, 'title body tags'));
  expense.user = req.user;
  try {
    yield expense.save();
    //yield expense.uploadAndSave(req.file);
    req.flash('success', 'Successfully created expense!');
    res.redirect(`/expenses/${expense._id}`);
  } catch (err) {
    res.status(422).render('expenses/new', {
      title: expense.title || 'New Expense',
      errors: [err.toString()],
      expense
    });
  }
});

/**
 * Edit an expense
 */

exports.edit = function(req, res) {
  res.render('expenses/edit', {
    title: 'Edit ' + req.expense.title,
    expense: req.expense
  });
};

/**
 * Update expense
 */

exports.update = async(function*(req, res) {
  const expense = req.expense;
  assign(expense, only(req.body, 'title body tags'));
  try {
    yield expense.save();
    //yield expense.uploadAndSave(req.file);
    res.redirect(`/expenses/${expense._id}`);
  } catch (err) {
    res.status(422).render('expenses/edit', {
      title: 'Edit ' + expense.title,
      errors: [err.toString()],
      expense
    });
  }
});

/**
 * Show
 */

exports.show = function(req, res) {
  res.render('expenses/show', {
    title: req.expense.title,
    expense: req.expense
  });
};

/**
 * Delete an expense
 */

exports.destroy = async(function*(req, res) {
  yield req.expense.remove();
  req.flash('info', 'Deleted successfully');
  res.redirect('/expenses');
});
