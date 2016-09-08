import Chai from "chai";
import Falcor from "@graphistry/falcor";
import Rx4 from "rx";
import Rx5 from "rxjs";

import Server from "./server";
import FalcorSocketDataSource from "../source";
/* eslint-disable */
import { devDependencies } from "../package";
/* eslint-enable */

const expect = Chai.expect;

Chai.config.showDiff = true;

runTestsWithRx(Rx4, devDependencies.rx);
runTestsWithRx(Rx5, devDependencies.rxjs);

function runTestsWithRx(Rx, rxVersion) {
	describe(`Falcor Socket DataSource with Rx ${rxVersion}`, () => {
		describe("Socket DataSource", () => {
			let server = null;
			let model = null;
			beforeEach(() => {
				server = new Server();
				model = new Falcor.Model({
					source: new FalcorSocketDataSource(server.getUrl(), { forceNew: true })
				});
			});
			it("should get data from the server", (done) => {
				model.get(["foo", "bar"]).subscribe((data) => {
					try {
						expect(data.json.foo.bar).to.equal("foo");
						done();
					} catch (error) {
						done(error);
					}
				});
			});
			it("should set data on the server", (done) => {
				model.set({ path: ["foo", "bar"], value: "bar" }).subscribe((data) => {
					try {
						expect(data.json.foo.bar).to.equal("bar");
						done();
					} catch (error) {
						done(error);
					}
				});
			});
			it("should call a function on the server", (done) => {
				model.call("bar", ["foo"]).subscribe((data) => { // eslint-disable-line prefer-reflect
					try {
						expect(data.json.foo.bar).to.equal("foo");
						done();
					} catch (error) {
						done(error);
					}
				});
			});
			it("should cancel a get operation", (done) => {
				const messages = [];
				const eventName = "falcor";
				const cancelName = "cancel_falcor_operation";
				const { _source: { socket } } = model;

				model._source.socket = {
					emit(event, data, ...rest) {
						messages.push({ data, event });
						socket.emit(event, data, ...rest);
					},
					off(...args) {
						return socket.off(...args);
					},
					on(...args) {
						return socket.on(...args);
					}
				};

				Rx.Observable
					.create((observer) => {
						const disposable = model.get(["long", "running", "operation"]).subscribe(observer);
						if (!disposable.unsubscribe) {
							disposable.unsubscribe = disposable.dispose.bind(disposable);
						} else if (!disposable.dispose) {
							disposable.dispose = disposable.unsubscribe.bind(disposable);
						}
						return disposable;
					})
					.timeout(500)
					.catch((e) => {
						// delay forwarding the timeout so the stack has time to unwind to unsubscribe
						return Rx.Observable.of(e).delay(100);
					})
					.do(() => {
						expect(messages.length).to.equal(2);

						const [requestEvent, cancelEvent] = messages;
						const { id: requestId } = requestEvent.data;

						// validate the request event.
						expect(requestEvent.event).to.equal(eventName);
						expect(requestEvent.data.method).to.equal("get");
						expect(requestEvent.data.pathSets).to.deep.equal([
							["long", "running", "operation"]
						]);

						// validate that the cancelation event was send properly
						expect(cancelEvent.event).to.equal(`${cancelName}_${requestId}`);

						// make sure the route response definitely isn"t in the cache.
						const { _root: { cache } } = model;
						expect(typeof cache.long).to.equal("undefined");
					})
					.subscribe(() => {
						// noop
					}, done, done);
			});
			afterEach(() => {
				server.socket.close();
			});
		});
	});
}
