import { Redis } from "ioredis";

export class RedCircle<TElement> {

    public static readonly DEFAULT_CAPACITY = 1000;
    public static readonly DEFAULT_EXPIRES = 0;

    constructor(
        public readonly client: Redis,
        public readonly name: string,
        public readonly capacity: number = RedCircle.DEFAULT_CAPACITY,
        public readonly expires: number = RedCircle.DEFAULT_EXPIRES,
    ) {}

    public async length(): Promise<number> {
        let results: [Error | null, any][];
        if (this.expires === 0) {
            results = await this.client.multi()
                .llen(this.name)
                .exec();
        } else {
            results = await this.client.multi()
                .llen(this.name)
                .pexpire(this.name, this.expires)
                .exec()
        }

        for (const result of results) {
            if (result[0] !== null) throw result[0];
        }
    }

    public async elements(): Promise<TElement[]> {
        let results: [Error | null, any][];
        if (this.expires === 0) {
            results = await this.client.multi()
                .lrange(this.name, start, end)
                .exec();
        } else {
            results = await this.client.multi()
                .lrange(this.name, start, end)
                .pexpire(this.name, this.expires)
                .exec()
        }

        for (const result of results) {
            if (result[0] !== null) throw result[0];
        }
    }

    public async range(): Promise<TElement[]> {
        let results: [Error | null, any][];
        if (this.expires === 0) {
            results = await this.client.multi()
                .lrange(this.name, start, end)
                .exec();
        } else {
            results = await this.client.multi()
                .lrange(this.name, start, end)
                .pexpire(this.name, this.expires)
                .exec()
        }

        for (const result of results) {
            if (result[0] !== null) throw result[0];
        }
    }

    public async *stream(): AsyncGenerator<TElement> {
        yield (null as TElement);
    }

    public async append(elements: TElement | TElement[]): Promise<void> {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        const strings = [];
        for (const element of elements) {
            strings.push(JSON.stringify(element));
        }

        let results: [Error | null, any][];
        if (this.expires === 0) {
            results = await this.client.multi()
                .lpush(this.name, ...strings)
                .ltrim(this.name, 0, this.capacity - 1)
                .exec();
        } else {
            results = await this.client.multi()
                .lpush(this.name, ...strings)
                .ltrim(this.name, 0, this.capacity - 1)
                .pexpire(this.name, this.expires)
                .exec()
        }

        for (const result of results) {
            if (result[0] !== null) throw result[0];
        }
    }

    public async touch(): Promise<void> {
        if (this.expires !== 0) {
            await this.client.pexpire(this.name, this.expires);
        }
    }

    public async clear(): Promise<void> {
        await this.client.del(this.name);
    }
}