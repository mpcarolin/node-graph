const { buildGraph } = require('../buildGraph')
const mockRepos = require('../__mocks__/mockRepos')

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  resolve: (arg, arg2) => arg + '/' + arg2,
}))

jest.mock('../git', () => ({
  repoHasChanged: (repo) => {
    // treat 'buz' repo as the only one with git differences from master
    return repo.key.includes('buz')
  }
}))

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: () => true
}))

jest.mock('biz/package.json', () => mockRepos['biz'], { virtual: true })
jest.mock('foo/package.json', () => mockRepos['foo'], { virtual: true })
jest.mock('bar/package.json', () => mockRepos['bar'], { virtual: true })
jest.mock('buz/package.json', () => mockRepos['buz'], { virtual: true })
jest.mock('baz/package.json', () => mockRepos['baz'], { virtual: true })

describe('buildGraph', () => {

  let graph;

  beforeEach(async () => {
    graph = await buildGraph([
      'biz',
      'foo',
      'bar',
      'buz',
      'baz'
    ])
  })

  it('should build a dependency graph', async () => {
    expect(graph.overallOrder()).toEqual([
      'buz', 'foo', 'bar', 'baz', 'biz'
    ])
    expect(graph.getNodeData('biz').version).toEqual((mockRepos['biz'].version))
  })

  it('should provide a list of repos needing version updates, in the correct order', () => {
    expect(graph.dirtyNodes().map(repo => repo.key)).toEqual([
      'buz', 'foo', 'biz'
    ])
  })
})
