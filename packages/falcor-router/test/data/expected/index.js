module.exports = function() {
    return {
        Videos: require('./VideoExpect')(),
        Genrelists: require('./GenrelistExpect')()
    };
};
