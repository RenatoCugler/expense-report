'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Receipt Schema
 */

const ReceiptSchema = new Schema({
  expense: { type: Schema.ObjectId, ref: 'Expense' },
  user: { type: Schema.ObjectId, ref: 'User' },
  vendor: { type: String, default: '', maxlength: 300 },
  itemsPurchased: { type: String, default: '', maxlength: 1000 },
  totalCost: { type: Number, default: '0' },
  event: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
  purchasedDate: { type: Date}
});

ReceiptSchema.path('vendor').required(true, 'Vendor cannot be blank');
ReceiptSchema.path('event').required(true,"Event is required");

/**
 * Methods
 */

ReceiptSchema.methods = {
  /**
   * Add receipt
   *
   * @param {User} user
   * @param {Expense} expense
   * @param {Object} receipt
   * @api private
   */
  addReceipt: function(user, expense, receipt) {

    this.receipts.push({
        vendor: receipt.vendor,
        itemsPurchased: receipt.itemsPurchased,
        totalCost: receipt.totalCost,
        event: receipt.event,
        user: user._id,
        createdAt: receipt.createdAt,
        purchasedDate: receipt.purchasedDate,
        expense: expense._id
      });

    return this.save();
  },

  
};

/**
 * Statics
 */


/**
 * Receipt Methods
 */

mongoose.model('Receipt', ReceiptSchema);