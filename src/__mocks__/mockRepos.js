

const mocks = {
  'biz': {
    name: 'biz',
    version: '0.1.0',
    dependencies: {
      foo: '1.0.1',
      bar: '2.7.9'
    },
    devDependencies: {
      baz: '0.1.1'
    },
    peerDependencies: {
      react: 'http://github.com/fb/react.git'
    }
  },
  foo: {
    name: 'foo',
    version: '1.2.0',
    dependencies: {
      buz: '0.2.3'
    },
    devDependencies: {},
    peerDependencies: {}
  },
  bar: {
    name: 'bar',
    version: '2.7.9',
    dependencies: {},
    devDependencies: {},
    peerDependencies: {}
  },
  buz: {
    name: 'buz',
    version: '0.2.3',
    dependencies: {},
    devDependencies: {},
    peerDependencies: {}
  },
  baz: {
    name: 'baz',
    version: '0.2.3',
    dependencies: {},
    devDependencies: {},
    peerDependencies: {}
  }, 
}

module.exports = mocks