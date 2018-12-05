# npm-courier

[![npm version](https://badge.fury.io/js/npm-courier.svg)](https://badge.fury.io/js/npm-courier) ![npm](https://img.shields.io/npm/dt/npm-courier.svg)

Delivers your local packages right to your projects without the need to use `npm link`.

## The Problem
If you've ever developed an npm package. You know how annoying it is to test it locally with `npm link`. This problem gets even worse when you know that `npm link` behaves differently depending on your npm version; even when `npm link` works as expected, you'd need to link the package every time you made a change.
## The Solution
`npm-courier` picks up your local package, and drops it into your project. You can also use it to automatically update your project whenever you make changes to the source code of your package. You can think of `npm-courier` as an alternative to `npm link` that does not use symlinks and has optional automatic reloading.

## Installation
1.  `npm install -g npm-courier`
2.  Create a folder in your home directory called `courier`
3.  Add this line to your `.bash_profile`: `export COURIER=~/courier`
4.  Profit!

## Usage

`npm-courier` acts like a courier (duh!). It picks up a package, and drops it off to recipients. In this case your recipients would be your projects that need to use the local module.
1. Go to your local npm module.
2. Run `courier pickup`.
3. Go to your project root.
4. Run `courier drop <package name>`

Additionally, if you want to run `npm-courier` so that it watches for changes in the package and automatically applies them to your project follow these additional steps:

5. Go to your local npm module.
6. Run `courier watch`

Now whenever any changes are detected, the package will be updated in all places where it has been dropped before.

### Removing project as a drop location
If you drop a package in multiple locations, then using `courier watch` would update all the locations in which the package was dropped. In order to prevent this, run `courier reset <package-name>` in the root directory of your project when done. This will remove that project from the drop locations of the package. This will also change the project's package back to the published version that existed before.

### Removing all drop locations
Basically if you want to start from scratch, use the appropriately named `nuke` command
```
courier nuke
```
### Using package.json
In the case you're always testing the same package(s) in a project and don't want to manually type the package names in the terminal every time. You can add a `courier` key to your project's `package.json` and give it a value of an array with all the package names you'd like to drop. Note that you would still need to pickup the packages manually the first time. All commands that accept a package name would also work with this method.

Example:
1. Go to `packageA`
2. `courier pickup`
3. Go to `packageB`
4. `courier pickup`
5. Add this to your project's package.json
```json
"courier": ["packageA", "packageB"]
```
6. In your project, run `courier drop`
7. When done, run `courier reset`
