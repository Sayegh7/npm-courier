const { hashElement } = require('folder-hash');
const shell = require('shelljs');
const log = console.log;
const chalk = require('chalk');

module.exports = {
  hashDirectory: async () => {
    const hash = await hashElement(process.cwd());
    return hash.hash
  },
  moduleIsAvailable: (path) => {
    try {
        require.resolve(path);
        return true;
    } catch (e) {
        return false;
    }
  },
  installPackage: (packageInfo, location) => {
    shell.cd(location + '/node_modules/')
    log('Installing', packageInfo.name)
    shell.rm('-rf', `./${packageInfo.name}/*`)
    shell.mkdir('-p', `./${packageInfo.name}/`);
    shell.cp('-R', `${packageInfo.path}/*`, `./${packageInfo.name}/`);
    log(chalk.green('Installed package in'), location);
  },
}
