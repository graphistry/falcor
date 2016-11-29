module.exports = process.env.NODE_ENV === 'test' ?
    require('./lib') : process.env.NODE_ENV === 'development' ?
    require('./dist/falcor.all') : require('./dist/falcor.all.min');
