// tslint:disable-next-line: no-implicit-dependencies
import { expect } from "chai";
import Redis = require("ioredis");
import { RedCircle } from "../src";

const client = new Redis();

describe("RedCircle", () => {
    describe("#length()", () => {
        it("should return 0 for an empty list", async () => {
            const rcircle = new RedCircle<string>(client, "test:length1");
            await rcircle.clear();
            const length = await rcircle.length();
            expect(length).to.equal(0);
            await rcircle.clear();
        });

        it("should return the correct list size", async () => {
            const rcircle = new RedCircle<string>(client, "test:length2");
            await rcircle.clear();
            await rcircle.append("foo");
            const length = await rcircle.length();
            expect(length).to.equal(1);
            await rcircle.clear();
        });
    });

    describe("#range()", () => {
        it("should return the elements between a specified range", async () => {
            const rcircle = new RedCircle<string>(client, "test:range1");
            await rcircle.clear();
            await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const range = await rcircle.range(0, 2);
            expect(range).to.deep.equal(["9", "8", "7"]);
            await rcircle.clear();
        });

        it("should return an empty list if the range does not exist", async () => {
            const rcircle = new RedCircle<string>(client, "test:range2");
            await rcircle.clear();
            const range = await rcircle.range(0, 2);
            expect(range).to.deep.equal([]);
            await rcircle.clear();
        });

        it("should return a partial list if one of the indexes is out-of-bounds", async () => {
            const rcircle = new RedCircle<string>(client, "test:range3");
            await rcircle.clear();
            await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const range = await rcircle.range(8, 12);
            expect(range).to.deep.equal(["1", "0"]);
            await rcircle.clear();
        });
    });

    describe("#elements()", () => {
        it("should return an empty array for an empty list", async () => {
            const rcircle = new RedCircle<string>(client, "test:elements1");
            await rcircle.clear();
            const range = await rcircle.elements();
            expect(range).to.deep.equal([]);
            await rcircle.clear();
        });

        it("should return all elements present in the list", async () => {
            const rcircle = new RedCircle<string>(client, "test:elements2");
            await rcircle.clear();
            await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const range = await rcircle.elements();
            expect(range).to.deep.equal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });
    });

    describe("#append()", () => {
        it("should add the specified elements to the list", async () => {
            const rcircle = new RedCircle<string>(client, "test:append1");
            await rcircle.clear();
            await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const range = await rcircle.elements();
            expect(range).to.deep.equal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });

        it("should not exceed the specified capacity", async () => {
            const rcircle = new RedCircle<string>(client, "test:append2", 5);
            await rcircle.clear();
            await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
            const range = await rcircle.elements();
            expect(range).to.deep.equal(["5", "6", "7", "8", "9"].reverse());
            await rcircle.clear();
        });
    });

    describe("#touch()", () => {
        it("should extend the expiration date of the list if expires is not 0", async () => {
            const rcircle = new RedCircle<string>(client, "test:touch1", 20, 10000);
            await rcircle.clear();
            await rcircle.append("0");
            for (let i = 0; i < 100000; i++) {
                i = i;
            }
            const expires1 = await rcircle.client.pttl(rcircle.name);
            await rcircle.touch();
            const expires2 = await rcircle.client.pttl(rcircle.name);
            expect(expires2).to.be.greaterThan(expires1);
            await rcircle.clear();
        });

        it("should not extend the expiration date of the list if expires is 0", async () => {
            const rcircle = new RedCircle<string>(client, "test:touch2", 20, 0);
            await rcircle.clear();
            await rcircle.append("0");
            await rcircle.touch();
            const expires1 = await rcircle.client.pttl(rcircle.name);
            expect(expires1).to.equal(-1);
            await rcircle.clear();
        });
    });

    describe("#clear()", () => {
        it("should delete/remove all elements in the list", async () => {
            const rcircle = new RedCircle<string>(client, "test:clear1");
            await rcircle.clear();
            const length = await rcircle.length();
            expect(length).to.equal(0);
            await rcircle.clear();
        });
    });
});