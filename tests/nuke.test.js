var exec = require('shelljs.exec')

test('Nuke command works', () => {
  const response = exec('courier nuke')
  expect(response.stderr).toHaveLength(0)
  expect(response.stdout).toMatch('Registry nuked')
})
