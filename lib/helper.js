const { hashElement } = require('folder-hash');
const shell = require('shelljs');
const log = console.log;
const chalk = require('chalk');
const options = {
  algo: 'md5',
  folders: { exclude: ['node_modules'] },
  files: { include: ['*.js', '*.json', '*.md'] }
};


module.exports = {
  hashDirectory: async () => {
    const hash = await hashElement(process.cwd(), options);
    return hash
  },
  hashFile: async (path) => {
    const hash = await hashElement(path, options);
    return hash
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
    const oldCWD = process.cwd();
    shell.set('+v');
    shell.cd(location + '/node_modules/')
    log('Installing', packageInfo.name)
    shell.rm('-rf', `./${packageInfo.name}/*`)
    shell.mkdir('-p', `./${packageInfo.name}/`);
    shell.cp('-R', `${packageInfo.path}/*`, `./${packageInfo.name}/`);
    log(chalk.green('Installed package in'), location);
    shell.cd(oldCWD);
  },
}
