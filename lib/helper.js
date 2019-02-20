const { hashElement } = require('folder-hash');
const shell = require('shelljs');
const log = console.log;
const chalk = require('chalk');
const exec = require('shelljs.exec')
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
    log('Installing', packageInfo.name)
    exec(`
      exec 2>/dev/null
      cd ${location}/node_modules/
      rm -rf ./${packageInfo.name}/*
      mkdir -p ./${packageInfo.name}/
      mv ${packageInfo.path}/node_modules ${packageInfo.path}/../tmpx2
      cp -R ${packageInfo.path}/* ./${packageInfo.name}/
      mv ${packageInfo.path}/../tmpx2 ${packageInfo.path}/node_modules
      cd ${oldCWD}
    `)
    log(chalk.green('Installed package in'), location);
  },
}
