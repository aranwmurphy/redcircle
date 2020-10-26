import { Redis } from "ioredis";
export default class RedCircle {
    readonly client: Redis;
    readonly name: string;
    readonly capacity: number;
    readonly expires: number;
    static readonly DEFAULT_CAPACITY = 100;
    static readonly DEFAULT_EXPIRES = 0;
    constructor(client: Redis, name: string, capacity?: number, expires?: number);
    size(): Promise<number>;
    slice(start: number, end: number): Promise<any[]>;
    values(): Promise<any[]>;
    push(...elements: any[]): Promise<void>;
    touch(): Promise<void>;
    clear(): Promise<void>;
}
