const faker = require('faker')
const Datastore = require('nedb-promises')
const db = Datastore.create({ filename: `${__dirname}/db` })
const shell = require('shelljs')
process.env.COURIER = __dirname

beforeAll(async () => {
  return await db.load()
})

test('Drop command works',async () => {
  shell.exec('courier drop')
  let result = await db.findOne({name: 'npm-courier'});
  expect(result.recipients).toContain(process.cwd())
})

