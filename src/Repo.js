const path = require('path')
const fs = require('fs')

class Repo {
  constructor(repoPath) {
    const pkgPath = path.resolve(repoPath, 'package.json')
    const pkg = require(pkgPath)

    this._package = pkg
    this.path = repoPath
    this.isDirty = false
    this.pkgPath = pkgPath

  }

  get key () {
    return this._package.name || this.repoPath
  }

  get dirName () {
    return path.dirname(this.path)
  }

  /**
   * Saves package.json to disk, using updated values (like version or dependencies)
   */
  save () {
    return fs.writeFileSync(
      this.pkgPath, 
      this.serialize(), 
      'utf8'
    )
  }

  serialize () {
    return JSON.stringify(this._package)
  }

  get version () { 
    return this._package.version 
  }

  set version (value) { 
    this._package.version = value
    return this._package.version
  }

  get allDependencies () {
    return {
      ...this.dependencies,
      ...this.devDependencies,
      ...this.peerDependencies
    }
  }

  updateDependency (name, versionOrUrl) {
    const depsObj = name in (this.dependencies || {})
      ? this.dependencies
      : name in (this.devDependencies || {})
        ? this.devDependencies
        : name in (this.peerDependencies || {})
          ? this.peerDependencies
          : null

    if (!depsObj)
      throw new Error(`Cannot update dependency [${name}:${versionOrUrl}] -- Does not exist in current dependencies.`)

    depsObj[name] = versionOrUrl
  }

  get dependencies () {
    return this._package.dependencies
  }

  get devDependencies () {
    return this._package.devDependencies
  }
  
  get peerDependencies () {
    return this._package.peerDependencies
  }

}

module.exports = { Repo }