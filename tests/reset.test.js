const faker = require('faker')
const Datastore = require('nedb-promises')
const db = Datastore.create({ filename: `${__dirname}/db` })
const shell = require('shelljs')

beforeAll(async () => {
  return await db.load()
})

test('Reset command works', async () => {
})
