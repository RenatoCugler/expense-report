'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Expense = mongoose.model('Expense');

/**
 * List items tagged with a tag
 */

exports.index = async(function*(req, res) {
  const criteria = { tags: req.params.tag };
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const limit = 30;
  const options = {
    limit: limit,
    page: page,
    criteria: criteria
  };

  const expenses = yield Expense.list(options);
  const count = yield Expense.countDocuments(criteria);

  res.render('expenses/index', {
    title: 'Expenses tagged ' + req.params.tag,
    expenses: expenses,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});
