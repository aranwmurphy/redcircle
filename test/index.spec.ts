// tslint:disable-next-line: no-implicit-dependencies
import { expect } from "chai";
import Redis = require("ioredis");
import RedCircle from "../src";

const client = new Redis();

describe("RedCircle", () => {
    describe("#size()", () => {
        it("should return 0 for an empty buffer", async () => {
            const rcircle = new RedCircle<string>(client, "test:size1");
            await rcircle.clear();
            const size = await rcircle.size();
            expect(size).to.equal(0);
            await rcircle.clear();
        });

        it("should return the correct buffer size", async () => {
            const rcircle = new RedCircle<string>(client, "test:size2");
            await rcircle.clear();
            await rcircle.push("foo");
            const size = await rcircle.size();
            expect(size).to.equal(1);
            await rcircle.clear();
        });
    });

    describe("#slice()", () => {
        it("should return the values between a specified range", async () => {
            const rcircle = new RedCircle<string>(client, "test:slice1");
            await rcircle.clear();
            await rcircle.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const slice = await rcircle.slice(0, 2);
            expect(slice).to.deep.equal(["9", "8", "7"]);
            await rcircle.clear();
        });

        it("should return an empty array if the range does not exist", async () => {
            const rcircle = new RedCircle<string>(client, "test:slice2");
            await rcircle.clear();
            const slice = await rcircle.slice(0, 2);
            expect(slice).to.deep.equal([]);
            await rcircle.clear();
        });

        it("should return a partial array if one of the indexes is out-of-bounds", async () => {
            const rcircle = new RedCircle<string>(client, "test:slice3");
            await rcircle.clear();
            await rcircle.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const slice = await rcircle.slice(8, 12);
            expect(slice).to.deep.equal(["1", "0"]);
            await rcircle.clear();
        });
    });

    describe("#values()", () => {
        it("should return an empty array for an empty buffer", async () => {
            const rcircle = new RedCircle<string>(client, "test:values1");
            await rcircle.clear();
            const slice = await rcircle.values();
            expect(slice).to.deep.equal([]);
            await rcircle.clear();
        });

        it("should return all values present in the buffer", async () => {
            const rcircle = new RedCircle<string>(client, "test:values2");
            await rcircle.clear();
            await rcircle.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const slice = await rcircle.values();
            expect(slice).to.deep.equal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });
    });

    describe("#push()", () => {
        it("should add the specified values to the buffer", async () => {
            const rcircle = new RedCircle<string>(client, "test:push1");
            await rcircle.clear();
            await rcircle.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const slice = await rcircle.values();
            expect(slice).to.deep.equal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });

        it("should not exceed the specified capacity", async () => {
            const rcircle = new RedCircle<string>(client, "test:push2", 5);
            await rcircle.clear();
            await rcircle.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const slice = await rcircle.values();
            expect(slice).to.deep.equal(["5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });
    });

    describe("#touch()", () => {
        it("should extend the expiration date of the buffer if expires is not 0", async () => {
            const rcircle = new RedCircle<string>(client, "test:touch1", 20, 10000);
            await rcircle.clear();
            await rcircle.push("0");
            for (let i = 0; i < 100000; i++) {
                i = i;
            }
            const expires1 = await rcircle.client.pttl(rcircle.name);
            await rcircle.touch();
            const expires2 = await rcircle.client.pttl(rcircle.name);
            expect(expires2).to.be.greaterThan(expires1);
            await rcircle.clear();
        });

        it("should not extend the expiration date of the buffer if expires is 0", async () => {
            const rcircle = new RedCircle<string>(client, "test:touch2", 20, 0);
            await rcircle.clear();
            await rcircle.push("0");
            await rcircle.touch();
            const expires1 = await rcircle.client.pttl(rcircle.name);
            expect(expires1).to.equal(-1);
            await rcircle.clear();
        });
    });

    describe("#clear()", () => {
        it("should delete/remove all values in the buffer", async () => {
            const rcircle = new RedCircle<string>(client, "test:clear1");
            await rcircle.clear();
            const size = await rcircle.size();
            expect(size).to.equal(0);
            await rcircle.clear();
        });
    });
});