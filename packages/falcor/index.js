module.exports = (
    typeof process !== 'undefined' &&
    typeof process.ENV !== 'undefined' &&
    process.ENV.NODE_ENV === 'production') ?
    require('./dist/falcor.min') :
    require('./dist/falcor');
