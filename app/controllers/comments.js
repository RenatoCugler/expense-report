'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');

/**
 * Load comment
 */

exports.load = function(req, res, next, id) {
  req.comment = req.expense.comments.find(comment => comment.id === id);

  if (!req.comment) return next(new Error('Comment not found'));
  next();
};

/**
 * Create comment
 */

exports.create = async(function*(req, res) {
  const expense = req.expense;
  yield expense.addComment(req.user, req.body);
  res.redirect(`/expenses/${expense._id}`);
});

/**
 * Delete comment
 */

exports.destroy = async(function*(req, res) {
  yield req.expense.removeComment(req.params.commentId);
  req.flash('info', 'Removed comment');
  res.redirect(`/expenses/${req.expense.id}`);
});
