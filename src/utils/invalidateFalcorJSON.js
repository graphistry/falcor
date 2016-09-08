export default function invalidateFalcorJSON(data) {
    data.$__hash__$ = undefined;
    return data;
}
