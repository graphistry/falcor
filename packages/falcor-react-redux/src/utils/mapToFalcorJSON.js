import { FalcorJSON } from '@graphistry/falcor';

export default function mapToFalcorJSON(data, falcor) {
    if (!data || typeof data !== 'object') {
        data = { __proto__: FalcorJSON.prototype };
    } else if (!(data instanceof FalcorJSON)) {
        data.__proto__ = FalcorJSON.prototype;
    }
    if (falcor && falcor._recycleJSON) {
        falcor._seed = { json: data };
    }
    return data;
}
