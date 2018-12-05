var exec = require('shelljs.exec')

test('Pickup command works', () => {
  const response = exec('courier pickup')
  expect(response.stderr).toHaveLength(0)
  expect(response.stdout).toMatch('npm-courier picked up\n')
})
