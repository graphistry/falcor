import { Observable } from "rxjs";
import FalcorRouter from "falcor-router";

export default new FalcorRouter([{
	call: (path, parameters) => {
		return [{ path: ["foo", "bar"], value: parameters && parameters[0] }];
	},
	route: ["bar"]
}, {
	get: () => {
		return { jsonGraph: { foo: { bar: "foo" } } };
	},
	route: ["foo", "bar"],
	set: (jsonGraph) => {
		return { jsonGraph };
	}
}, {
	get: () => {
		return Observable.timer(5000).map((value) => {
			return {
				path: ["long", "running", "operation"], value
			};
		});
	},
	route: ["long", "running", "operation"]
}]);
