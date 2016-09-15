module.exports = (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    process.env.NODE_ENV !== 'production') ?
    require('./dist/falcor') :
    require('./dist/falcor.min');
