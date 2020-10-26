import { Redis } from "ioredis";

export default class RedCircle<TElement> {

    public static readonly DEFAULT_CAPACITY = 100;
    public static readonly DEFAULT_EXPIRES = 0;

    constructor(
        public readonly client: Redis,
        public readonly name: string,
        public readonly capacity: number = RedCircle.DEFAULT_CAPACITY,
        public readonly expires: number = RedCircle.DEFAULT_EXPIRES,
    ) {}

    public async size(): Promise<number> {
        return this.client.llen(this.name);
    }

    public async slice(start: number, end: number): Promise<TElement[]> {
        const results = await this.client.lrange(this.name, start, end);
        const elements: TElement[] = [];

        for (const result of results) {
            elements.push(JSON.parse(result));
        }

        return elements;
    }

    public async values(): Promise<TElement[]> {
        return this.slice(0, -1);
    }

    public async push(...elements: TElement[]): Promise<void> {
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
                .exec();
        }

        for (const result of results) {
            if (result[0] !== null) {
                throw result[0];
            }
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