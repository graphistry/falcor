var isArray = Array.isArray;
var isPathValue = require("../support/isPathValue");
var isJSONEnvelope = require("../support/isJSONEnvelope");
var isJSONGraphEnvelope = require("../support/isJSONGraphEnvelope");

module.exports = groupCacheArguments;

function groupCacheArguments(args) {

    var groups = [];
    var argIndex = -1;
    var argCount = args.length;
    var group, groupType, arg, argType;

    while (++argIndex < argCount) {
        arg = args[argIndex];
        if (isArray(arg)) {
            arg = { path: arg };
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            argType = "PathValues";
        } else if (isJSONGraphEnvelope(arg)) {
            argType = "JSONGraphs";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        }

        if (groupType !== argType) {
            groupType = argType;
            groups.push(group = {
                arguments: [],
                inputType: argType
            });
        }

        group.arguments.push(arg);
    }

    return groups;
}
