var exec = require('shelljs.exec')
var shell = require('shelljs')

describe('[COMMAND]', () => {

  beforeAll(done => {
    exec('courier nuke')
    done()
  })

  afterAll(done => {
    exec('npm r -S npm-courier-test')
    done()
  })

  it('Pickup command works', done => {
    shell.cd('dummy')
    const response = exec('courier pickup')
    expect(response.stderr).toHaveLength(0)
    expect(response.stdout).toContain('npm-courier-test picked up')
    shell.cd('..')
    done()
  })

  it('Drop command works', done => {
    const response = exec('courier drop npm-courier-test')
    expect(response.stderr).toHaveLength(0)
    expect(response.stdout).toContain('Installed package')
    done()
  })

  it('Reset command works', done => {
    const response = exec('courier reset npm-courier-test')
    expect(response.stderr).toHaveLength(0)
    expect(response.stdout).toContain('Installed npm-courier-test')
    done()
  })

  it('Nuke command works', done => {
    const response = exec('courier nuke')
    expect(response.stderr).toHaveLength(0)
    expect(response.stdout).toMatch('Registry nuked')
    done()
  })
})
