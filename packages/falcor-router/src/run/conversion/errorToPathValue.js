var JSONGraphError = require('./../../errors/JSONGraphError');
module.exports = function errorToPathValue(error, path) {

    var typeValue = {
        $type: 'error',
        value: {}
    };

    // If it is a special JSONGraph error then pull all the data
    if (error instanceof JSONGraphError) {
        typeValue = error.typeValue;
    } else if (error instanceof Error) {
        typeValue.value.message = error.message;
    } else if (typeof error === 'object') {
        typeValue.value = error;
    } else {
        typeValue.value.message = '' + error;
    }

    return {
        path: path,
        value: typeValue
    };
};
