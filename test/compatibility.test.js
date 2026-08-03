'use strict'

var assert = require('node:assert/strict')
var test = require('node:test')
var Q = require('q')

var library = require('..')
var Queryable = require('../lib/Queryable')
var typedef = require('../lib/typedef')

test('the package and generated API definitions load', function () {
  assert.equal(typeof library.DataContext, 'function')
  assert.equal(Object.keys(library.api.services).length, 14)
  assert.equal(Object.keys(library.api.tables).length, 57)
})

test('generated field metadata remains available to queryables', function () {
  var Contact = library.api.tables.Contact
  var signature = typedef.signature(Contact)

  assert.equal(Contact.Id, 'Id')
  assert.equal(Contact.Email, 'Email')
  assert.equal(signature.Id.decorations.FIELD, true)
  assert.equal(signature.Id.decorations.PRIMARY, true)
  assert.equal(signature.Email.decorations.STRING, true)
  assert.ok(Queryable.getFields(Contact).includes('Email'))
})

test('DataContext creates generated services and tables', function () {
  var context = new library.DataContext('test-token')

  assert.ok(context.ContactService)
  assert.ok(context.DataService)
  assert.ok(context.Contacts instanceof Queryable)
  assert.equal(context.Contacts._T, library.api.tables.Contact)
})

test('generated service methods retain their XML-RPC names and arguments', async function () {
  var context = new library.DataContext('test-token')
  var captured

  context.client = {
    methodCall: function (method, args, callback) {
      captured = {method: method, args: args}
      callback(null, [{Id: 123, Email: 'person@example.com'}])
    }
  }

  var result = await context.ContactService.findByEmail(
    'person@example.com',
    ['Id', 'Email']
  )

  assert.deepEqual(captured, {
    method: 'ContactService.findByEmail',
    args: ['test-token', 'person@example.com', ['Id', 'Email']]
  })
  assert.deepEqual(result, [{Id: 123, Email: 'person@example.com'}])
})

test('Queryable builds and executes a paged DataService query', async function () {
  var Contact = library.api.tables.Contact
  var calls = []
  var dataService = {
    query: function () {
      calls.push(Array.prototype.slice.call(arguments))
      return Q([
        {Id: 1, Email: 'one@example.com'},
        {Id: 2, Email: 'two@example.com'}
      ])
    }
  }

  var results = await new Queryable(Contact, dataService)
    .where(Contact.Email, '%@example.com')
    .select(Contact.Id, Contact.Email)
    .take(2)
    .toArray()

  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0], [
    'Contact',
    2,
    0,
    {Email: '%@example.com'},
    ['Id', 'Email']
  ])
  assert.equal(results.length, 2)
  assert.ok(results[0] instanceof Contact)
  assert.equal(results[1].Email, 'two@example.com')
})
