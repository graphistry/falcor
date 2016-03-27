import Chai from "chai";
import Falcor from "falcor";

import FalcorSocketDataSource from "../source";
import Server from "./server";

const expect = Chai.expect;

Chai.config.showDiff = true;

describe("Falcor", () => {
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
		afterEach(() => {
			server.socket.close();
		});
	});
});
