"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RedCircle {
    constructor(client, name, capacity = RedCircle.DEFAULT_CAPACITY, expires = RedCircle.DEFAULT_EXPIRES) {
        this.client = client;
        this.name = name;
        this.capacity = capacity;
        this.expires = expires;
    }
    async length() {
        return this.client.llen(this.name);
    }
    async range(start, end) {
        const results = await this.client.lrange(this.name, start, end);
        const elements = [];
        for (const result of results) {
            elements.push(JSON.parse(result));
        }
        return elements;
    }
    async elements() {
        return this.range(0, -1);
    }
    async append(...elements) {
        const strings = [];
        for (const element of elements) {
            strings.push(JSON.stringify(element));
        }
        let results;
        if (this.expires === 0) {
            results = await this.client.multi()
                .lpush(this.name, ...strings)
                .ltrim(this.name, 0, this.capacity - 1)
                .exec();
        }
        else {
            results = await this.client.multi()
                .lpush(this.name, ...strings)
                .ltrim(this.name, 0, this.capacity - 1)
                .pexpire(this.name, this.expires)
                .exec();
        }
        for (const result of results) {
            if (result[0] !== null) {
                throw result[0];
            }
        }
    }
    async touch() {
        if (this.expires !== 0) {
            await this.client.pexpire(this.name, this.expires);
        }
    }
    async clear() {
        await this.client.del(this.name);
    }
}
exports.default = RedCircle;
RedCircle.DEFAULT_CAPACITY = 100;
RedCircle.DEFAULT_EXPIRES = 0;
//# sourceMappingURL=index.js.map