#!/usr/bin/env node
const Datastore = require('nedb'),
  db = process.env.NODE_ENV === 'test' ?
    new Datastore({ filename: "db", autoload: true })
    : new Datastore({ filename: `${process.env.COURIER}/db`, autoload: true }),
  shell = require('shelljs'),
  shellOptions = { silent: true },
  watch = require('node-watch'),
  log = console.log,
  debounce = require('debounce'),
  chalk = require('chalk'),
  helper = require('./helper');

module.exports = {
  currentHash: '',
  pickup(_, sub, options) {
    const pickedUpPackage = require(process.cwd() + '/package.json')
    const { name, version } = pickedUpPackage;
    db.update({name}, { name, version, path: process.cwd(), recipients: [] }, {upsert: true}, (err, doc) => {
      if(err) return console.error(err)
      log(chalk.green(name), 'picked up')
    })
  },
  nuke(_, sub, options) {
    db.remove({}, { multi: true })
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
      db.findOne({ name }, (err, packageInfo) => {
        if(err) return console.error(err)    
        if(!packageInfo) return console.error('packageInfo not found in registry')
        packageInfo.recipients.forEach(recipient => {
          helper.installPackage(packageInfo, recipient);
        })
      })
    }
    const detectChanges = async () => {
      const newHash = await helper.hashDirectory()
      if(newHash !== this.currentHash){
        log(chalk.yellow("File contents changed"));
        this.currentHash = newHash;
        changeHandler()
      }else{
        log(chalk.yellow("Change detected but contents are unchanged. Installation skipped."));
      }
    }
    const watcher = watch(process.cwd(), { recursive: true })
    watcher.on('change', debounce(detectChanges, 1000))
  },
  reset(_, sub, options) {
    let packageInfos = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packageInfos = dropLocation.courier || sub;
    }
    db.find({ name: { $in: packageInfos }}, function (err, pickedUpPackages) {
      if(err) return console.error(err)    
      pickedUpPackages.forEach(packageInfo => {
        db.update({ name: packageInfo.name }, { $pull: { recipients: dropLocation } });
        shell.exec(`npm install --save ${packageInfo.name}@${packageInfo.version}`)
      })
    })
  },
  drop(_, sub, options) {
    let packageInfos = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packageInfos = dropLocation.courier || sub;
    }
    db.find({ name: { $in: packageInfos }}, function (err, pickedUpPackages) {
      if(err) return console.error(err)  
      pickedUpPackages.forEach(pickedUpPackage => {
        db.update(pickedUpPackage, { $addToSet: { recipients: process.cwd() } }, (err, docs) => {});
        helper.installPackage(pickedUpPackage, process.cwd());
      });
    });
  }
}
