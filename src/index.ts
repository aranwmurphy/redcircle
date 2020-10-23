import { Redis } from "ioredis";

export class RedCircle {

    public static readonly DEFAULT_CAPACITY = 1000;

    constructor(
        public readonly client: Redis,
        public readonly capacity: number = RedCircle.DEFAULT_CAPACITY,
    ) {}
}