module.exports = function(x) {
    return x.hasOwnProperty('path') && (
        x.hasOwnProperty('value') ||
        x.hasOwnProperty('invalidated')
    );
};
