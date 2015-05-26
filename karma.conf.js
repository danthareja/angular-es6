module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['browserify', 'jasmine'],
    reporters: ['mocha'],
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.js': ['jshint', 'browserify'],
      'test/**/*.js': ['jshint', 'browserify']
    },
    browserify: {
      debug: true,
      transform: [ 'babelify' ]
    },
    jshint: {
      options: {
        browser: true,
        devel: true,
        esnext: true
      }
    }
  });
};