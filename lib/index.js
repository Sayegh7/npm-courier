#!/usr/bin/env node
const Store = require('data-store'),
  store = new Store({ name: 'courier' }),
  shell = require('shelljs'),
  watch = require('node-watch'),
  log = console.log,
  debounce = require('debounce'),
  chalk = require('chalk'),
  helper = require('./helper'),
  npm = require('npm-programmatic');

module.exports = {
  currentHash: {},
  pickup(_, sub, options) {
    const pickedUpPackage = require(process.cwd() + '/package.json')
    if(!pickedUpPackage) return log(chalk.red('No package.json found'))
    const { name, version } = pickedUpPackage;
    store.set(name, { name, version, path: process.cwd(), recipients: [] })
    log(chalk.green(name), 'picked up')
  },
  nuke(_, sub, options) {
    store.unlink()
    log(chalk.red('Registry nuked'))
  },
  async watch(_, sub, options) {
    this.currentHash = await helper.hashDirectory()
    log(chalk.blue('Watching directory'))

    const changeHandler = function() {
      log(chalk.yellow("Changes detected"))
      const available = helper.moduleIsAvailable(process.cwd() + '/package.json')
      if(!available) return log(chalk.red("Missing package.json"));
      const dropLocation = require(process.cwd() + '/package.json')
      const { name } = dropLocation;
      const pkg = store.get(name)
      if(!pkg) return console.error('packageInfo not found in registry')
      pkg.recipients.forEach(recipient => {
        helper.installPackage(packageInfo, recipient);
      })
    }

    // TODO: incorporate file hashing
    // FIXME: When using this func with debounce, only the last file to change would be called
    // and if the last file has no changes, the entire list of changes is ignored
    const detectChanges = async (event, fileChanged) => {
      const path = fileChanged.replace(process.cwd(), '').slice(1);
      let node = this.currentHash;
      path.split('/').forEach(folder => {
        node = node.children.find(x => x.name === folder)
      })
      const oldFileHash = node;
      const newFileHash = await helper.hashFile(path)
      if(oldFileHash.hash !== newFileHash.hash){
        log(chalk.yellow("File contents changed"));
        this.currentHash = await helper.hashDirectory()
        changeHandler()
      }
    }
    const watcher = watch(process.cwd(), { recursive: true })
    watcher.on('change', debounce(changeHandler, 1000))
  },
  reset(_, sub, options) {
    let packageInfos = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packageInfos = dropLocation.courier || sub;
    }
    packageInfos.forEach(packageName => {
      const packageDetails = store.get(packageName)
      const recipients = packageDetails.recipients.filter(function(i) {
        return i != dropLocation
      });
      packageDetails.recipients = recipients;
      store.set(packageName, packageDetails)
      shell.rm('-rf', `${process.cwd()}/node_modules${packageName}/*`)
      npm.install([packageName], {
        save: true,
        cwd: process.cwd()
      }).then(() => {
        console.log("Installed", packageName);
      }).catch(() => {
        console.log("Unable to install", packageName);
      })
    })
  },
  drop(_, sub, options) {
    let packageInfos = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packageInfos = dropLocation.courier || sub;
    }
    packageInfos.forEach(packageName => {
      const packageDetails = store.get(packageName)
      if(!packageDetails) return log(chalk.red(`${packageName} was never picked up`))
      packageDetails.recipients.push(process.cwd())
      store.set(packageName, packageDetails)
      helper.installPackage(packageDetails, process.cwd());
    });
  }
}
