export default function mergeIntoFalcorJSON(data, json) {
    data.$__key = json.$__key;
    data.$__path = json.$__path;
    data.$__refPath = json.$__refPath;
    data.$__version = json.$__version;
    data.$__keysPath = json.$__keysPath;
    data.$__keyDepth = json.$__keyDepth;
    data.$__toReference = json.$__toReference;
    return Object.assign(data, json);
}
