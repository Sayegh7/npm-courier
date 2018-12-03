#!/usr/bin/env node
const lib = require('../lib')
const args = require('args')

args
  .command('pickup', 'Picks up your package', lib.pickup)
  .command('drop', 'Drops your package in your project', lib.drop)
  .command('nuke', 'Clears out everything', lib.nuke)
  .command('watch', 'Watch file changes', lib.watch)
  .command('reset', 'Brings pack the actual packages', lib.reset)

const flags = args.parse(process.argv)
