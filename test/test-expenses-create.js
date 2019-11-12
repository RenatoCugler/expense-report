'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const test = require('tape');
const request = require('supertest');
const app = require('../server');
const { cleanup } = require('./helper');
const User = mongoose.model('User');
const Expense = mongoose.model('Expense');
const agent = request.agent(app);

const _user = {
  email: 'foo@email.com',
  name: 'Foo bar',
  username: 'foobar',
  password: 'foobar'
};

test('Clean up', cleanup);

test('Create user', async t => {
  const user = new User(_user);
  return await user.save(t.end);
});

test('POST /expense - when not logged in - should redirect to /login', t => {
  request(app)
    .get('/expense/new')
    .expect('Content-Type', /plain/)
    .expect(302)
    .expect('Location', '/login')
    .expect(/Redirecting/)
    .end(t.end);
});

// login
test('User login', t => {
  agent
    .post('/users/session')
    .field('email', _user.email)
    .field('password', _user.password)
    .expect('Location', '/')
    .expect('Content-Type', /text/)
    .end(t.end);
});

test('POST /expense - invalid form - should respond with error', t => {
  agent
    .post('/expense')
    .field('title', '')
    .field('body', 'foo')
    .expect('Content-Type', /text/)
    .expect(422)
    .expect(/Expense title cannot be blank/)
    .end(async err => {
      const count = await Expense.countDocuments().exec();
      t.ifError(err);
      t.same(count, 0, 'Count should be 0');
      t.end();
    });
});
/*
test('POST /expense - valid form - should redirect to the new expense page', t => {
  agent
    .post('/expense')
    .field('title', 'foo')
    .field('body', 'bar')
    .expect('Content-Type', /plain/)
    .expect('Location', /\/expense\//)
    .expect(302)
    .expect(/Redirecting/)
    .end(async err => {
      const count = await Expense.countDocuments().exec();
      t.ifError(err);
      t.same(count, 1, 'Count should be 1');
      t.end();
    });
});
*/
test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
