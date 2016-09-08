export default function mapToFalcorJSON(data, falcor) {
    if (!data || typeof data !== 'object') {
        data = falcor._root.branchSelector();
    } else if (data.$__name !== 'falcor-node') {
        data = Object.assign(falcor._root.branchSelector(), data);
    }
    return data;
}
