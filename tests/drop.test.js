var exec = require('shelljs.exec')

test('Drop command works', () => {
  const response = exec('courier drop npm-courier')
  expect(response.stderr).toHaveLength(0)
  expect(response.stdout).toContain('Installed package')
})
