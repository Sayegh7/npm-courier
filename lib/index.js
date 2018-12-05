#!/usr/bin/env node
const Datastore = require('nedb'),
  db = new Datastore({ filename: `${process.env.COURIER}/db`, autoload: true }),
  shell = require('shelljs'),
  shellOptions = { silent: true },
  watch = require('node-watch'),
  debounce = require('debounce');

function moduleIsAvailable (path) {
  try {
      require.resolve(path);
      return true;
  } catch (e) {
      return false;
  }
}

module.exports = {
  pickup(_, sub, options) {
    const pickedUpPackage = require(process.cwd() + '/package.json')
    const { name, version } = pickedUpPackage;
    db.update({name}, { name, version, path: process.cwd(), recipients: [] }, {upsert: true}, (err, doc) => {
      if(err) return console.error(err)
      const tgzName = `${name}-${version}.tgz`.replace('@', '').replace('/', '-')
      shell.exec('npm pack', shellOptions)
      shell.exec(`rm ${process.env.COURIER}/${tgzName}`, shellOptions)
      shell.exec(`mv ${tgzName} ${process.env.COURIER}`, shellOptions)
      console.log(name, 'picked up')
    })
  },
  nuke(_, sub, options) {
    db.remove({}, { multi: true })
    console.log('Registry nuked')
  },
  watch(_, sub, options) {
    console.log('Watching directory')

    const changeHandler = function(files) {
      console.log("Change detected")
      const available = moduleIsAvailable(process.cwd() + '/package.json')
      if(!available) return;
      const dropLocation = require(process.cwd() + '/package.json')
      const { name } = dropLocation;
      db.findOne({ name }, (err, package) => {
        if(err) return console.error(err)    
        if(!package) return console.error('Package not found in registry')
        package.recipients.forEach(recipient => {
          const tgzName = `${package.name}-${package.version}.tgz`.replace('@', '').replace('/', '-')
          console.log('Bundling', name)
          shell.exec('npm pack', shellOptions)
          shell.exec(`rm ${process.env.COURIER}/${tgzName}`, shellOptions)
          shell.exec(`mv ${tgzName} ${process.env.COURIER}`, shellOptions)
          console.log('Bundled', name)
          const oldCWD = process.cwd()
          shell.cd(recipient)
          console.log('Installing', name)
          shell.exec(`npm install --save ${process.env.COURIER}/${tgzName}`, shellOptions)
          console.log('Installed package in', recipient);
          shell.cd(oldCWD)
        })
      })
    }

    watch(process.cwd(), { recursive: true, delay: 1000 }, debounce(changeHandler, 1000))
  },
  reset(_, sub, options) {
    let packages = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packages = dropLocation.courier || sub;
    }
    db.find({ name: { $in: packages }}, function (err, pickedUpPackages) {
      if(err) return console.error(err)    
      db.update({ name }, { $pull: { recipients: dropLocation } });
      pickedUpPackages.forEach(package => {
        shell.exec(`npm install --save ${package.name}@${package.version}`, shellOptions)
      })
    })
  },
  drop(_, sub, options) {
    let packages = sub
    const dropLocation = require(process.cwd() + '/package.json')
    if (sub.length === 0){
      packages = dropLocation.courier || sub;
    }
    db.find({ name: { $in: packages }}, function (err, pickedUpPackages) {
      if(err) return console.error(err)  
      
      pickedUpPackages.forEach(pickedUpPackage => {
        const { name, version } = pickedUpPackage;
        db.update(pickedUpPackage, { $addToSet: { recipients: process.cwd() } }, (err, docs) => {});
        const tgzName = `${name}-${version}.tgz`.replace('@', '').replace('/', '-')
        shell.exec(`npm install --save ${process.env.COURIER}/${tgzName}`, shellOptions)
        console.log(name, 'dropped off')          
      });
    });
  }
}
