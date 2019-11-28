'use strict';

/**
 * Module dependencies.
 */

 /**
  * Interact with database
  * communicates with controller
  */

const mongoose = require('mongoose');
const notify = require('../mailer');

// const Imager = require('imager');
// const config = require('../../config');
// const imagerConfig = require(config.root + '/config/imager.js');

const Schema = mongoose.Schema;

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',').slice(0, 10); // max tags

/**
 * Expense Schema
 */

const ReceiptSchema = new Schema({
  vendor: { type: String, default: '', maxlength: 300 },
  itemsPurchased: { type: String, default: '', maxlength: 1000 },
  totalCost: { type: Number, default: '0' },
  event: { type: String, default: '', maxlength: 300 },
  user: { type: Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  purchasedDate: { type: Date, default: Date.now } 
});

//TODO esta salvando novo recibo mas so o ID, os demais campos nào estao sendo salvos.

const ExpenseSchema = new Schema({
  title: { type: String, default: '', trim: true, maxlength: 400 },
  body: { type: String, default: '', trim: true, maxlength: 1000 },
  user: { type: Schema.ObjectId, ref: 'User' },
  comments: [
    {
      body: { type: String, default: '', maxlength: 1000 },
      user: { type: Schema.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  tags: { type: [], get: getTags, set: setTags },
  image: {
    cdnUri: String,
    files: []
  },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['draft', 'pending','approved','rejected'],
    default: 'draft'
    },
  receipts: [ { ReceiptSchema } ]
});

/**
 * Validations
 */

ExpenseSchema.path('title').required(true, 'Expense title cannot be blank');
ExpenseSchema.path('status').required(true, 'Status cannot be blank');

/**
 * Pre-remove hook
 */

ExpenseSchema.pre('remove', function(next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'expense');

  next();
});

/**
 * Methods
 */

ExpenseSchema.methods = {
  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function(user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });

    //TODO - verify
    if (!this.user.email) this.user.email = 'renatocugler@gmail.com';

//    notify.comment({
//      expense: this,
//      currentUser: user,
//      comment: comment.body
//    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function(commentId) {
    const index = this.comments.map(comment => comment.id).indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  },
   /**
   * Add receipt
   *
   * @param {User} user
   * @param {Object} receipt
   * @api private
   */
  addReceipt: function(user, receipt) {

    console.log("add receipt");
    console.log(receipt);

    this.receipts.push({
      vendor: receipt.vendor,
      itemsPurchased: receipt.itemsPurchased,
      totalCost: receipt.totalCost,
      event: receipt.event,
      user: user._id,
      createdAt: receipt.createdAt,
      purchasedDate: receipt.purchasedDate,
      _id:receipt._id
    });

    /*
    //TODO - add notification
    if (!this.user.email) this.user.email = 'email@product.com';

    notify.receipt({
      expense: this,
      currentUser: user,
      receipt: receipt.body
    });
    */

    return this.save();
  },

  /**
   * Remove receipt
   *
   * @param {receiptId} String
   * @api private
   */
  removeReceipt: function(receiptId) {
    const index = this.receipts.map(receipt => receipt.id).indexOf(receiptId);

    if (~index) this.receipts.splice(index, 1);
    else throw new Error('Receipt not found');
    return this.save();
  }
};

/**
 * Statics
 */

ExpenseSchema.statics = {
  /**
   * Find expense by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec();
  },

  /**
   * List expenses
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

/**
 * Receipt Methods
 */

ReceiptSchema.methods = {

 

};

mongoose.model('Expense', ExpenseSchema);
