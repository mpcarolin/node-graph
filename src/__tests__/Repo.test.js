const { Repo } = require('../Repo')
const mockRepos = require('../__mocks__/mockRepos')

const repoPath = 'fake-repo'

const mockPkg = mockRepos['biz']

jest.mock('path', () => ({
  resolve: (arg, arg2) => arg + '/' + arg2 
}))
jest.mock('fake-repo/package.json', () => mockPkg, { virtual: true })

describe('Repo', () => {

  let repo;
  beforeEach(() => {
    repo = new Repo(repoPath)
  })

  it('should form a key', () => {
    expect(repo.key).toEqual(mockPkg.name)
  })

  it('should create a model representing the repo', () => {
    expect(repo.path).toEqual(repoPath)
  })

  it('should accept version mutations', () => {
    const version = '1.2.3'
    repo.version = version
    expect(JSON.parse(repo.serialize()).version).toEqual(version)
    expect(repo.version).toEqual(version)
  })

  it('should accept dependency mutations', () => {
    let version = '2.0.0'
    repo.updateDependency('baz', version)
    expect(JSON.parse(repo.serialize()).devDependencies.baz).toEqual(version)

    version = '30.9.0'
    repo.updateDependency('foo', version)
    expect(JSON.parse(repo.serialize()).dependencies.foo).toEqual(version)

    version = 'https://github.com/simpleview/react.git'
    repo.updateDependency('react', version)
    expect(JSON.parse(repo.serialize()).peerDependencies.react).toEqual(version)
  })
})