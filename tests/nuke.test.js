const faker = require('faker')
const Datastore = require('nedb-promises')
const db = Datastore.create({ filename: `${__dirname}/db` })
const shell = require('shelljs')
process.env.COURIER = __dirname

beforeAll(async () => {
  return await db.load()
})


test('Nuke command works',async () => {
  shell.exec('courier nuke')
  let result = await db.find({})
  expect(result).toHaveLength(0)
})
