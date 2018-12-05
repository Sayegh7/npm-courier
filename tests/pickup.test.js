const Datastore = require('nedb-promises')
const db = Datastore.create("db")
const courier = require('../lib')


describe('A user', function () {

  beforeAll(async (done) => {
    await db.load()
    await db.remove({}, { multi: true })
    done()
  })

  it('Pickup command works', async () => {
    courier.pickup().then(async () => {
      let result = await db.findOne({name: 'npm-courier'});
      console.log(result)
      result = await db.findOne({name: 'npm-courier'});
      console.log(result)
      expect(result).not.toBeNull()
      expect(result.name).toMatch('npm-courier')
    });
  })
})