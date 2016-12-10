import { FalcorJSON } from '@graphistry/falcor';

export default function mapToFalcorJSON(data, falcor) {
    if (!data || typeof data !== 'object') {
        data = { __proto__: FalcorJSON.prototype };
        if (falcor && falcor._recycleJSON) {
            if (falcor._seed) {
                falcor._seed.json = data;
            } else {
                falcor._seed = { json: data, __proto__: FalcorJSON.prototype };
            }
        }
    } else if (!(data instanceof FalcorJSON)) {
        data.__proto__ = FalcorJSON.prototype;
        if (falcor && falcor._recycleJSON) {
            if (falcor._seed) {
                falcor._seed.json = data;
            } else {
                falcor._seed = { json: data, __proto__: FalcorJSON.prototype };
            }
        }
    }
    return data;
}
