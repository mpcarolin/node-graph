const DepGraph = require('dependency-graph').DepGraph

class Graph extends DepGraph {

  dirtyNodes () {
    return this.values().filter(node => node.isDirty)
  }

  values () {
    return this.overallOrder().map(key => this.getNodeData(key))
  }
}

module.exports = { Graph }