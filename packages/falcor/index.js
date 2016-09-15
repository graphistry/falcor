module.exports = (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    process.env.NODE_ENV !== 'production') ?
    require('./lib') :
    require('./dist/falcor.min');
