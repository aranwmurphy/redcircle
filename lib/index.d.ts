import { Redis } from "ioredis";
export default class RedCircle<TElement> {
    readonly client: Redis;
    readonly name: string;
    readonly capacity: number;
    readonly expires: number;
    static readonly DEFAULT_CAPACITY = 100;
    static readonly DEFAULT_EXPIRES = 0;
    constructor(client: Redis, name: string, capacity?: number, expires?: number);
    size(): Promise<number>;
    slice(start: number, end: number): Promise<TElement[]>;
    values(): Promise<TElement[]>;
    push(...elements: TElement[]): Promise<void>;
    touch(): Promise<void>;
    clear(): Promise<void>;
}
