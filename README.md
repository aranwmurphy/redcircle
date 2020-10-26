# RedCircle
Implementation of an append-only, capped circular buffer using Redis

## Available Scripts

In the project directory, you can run:

### `npm test`

Runs the library test suite, and reports the results of each test.

### `npm build`

Builds the library for production to the `lib` folder.<br />
It correctly bundles the library in production mode and optimizes the build for the best performance.

### `npm lint`

Lints the project files.

## Usage

### JavaScript

```javascript
const Redis = require('ioredis');
const RedCircle = require('redcircle');

// Maximum number of elements allowed
const CAPACITY = 1000;

// Time to Live (TTL) in milliseconds, use 0 if you want to keep the list until it is deleted.
const EXPIRES = 60000;

// Instantiate RedCircle
const rcircle = new RedCircle(client, 'local:elements', CAPACITY, EXPIRES);

async function main() {
    // Clear the list
    await rcircle.clear();

    // Get the length of the buffer
    const length = await rcircle.length();
    console.log(length);
    // 0

    // Append elements to the buffer
    await rcircle.append('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    
    // Get the length of the buffer
    const length = await rcircle.length();
    console.log(length);
    // 10
    
    // Get all elements in the buffer
    const elements = await rcircle.elements();
    console.log(elements);
    // ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0']

    // Get a range of elements in the buffer
    const range = await rcirlce.range(0, 2);
    console.log(range);
    // ['9', '8', '7']

    // Extend the Time to Live (TTL) if applicable
    await rcircle.touch();

    // Clear the list
    await rcircle.clear();
}
```

### TypeScript


```typescript
import Redis = require("ioredis");
import RedCircle from "redcircle"

// Maximum number of elements allowed
const CAPACITY = 1000;

// Time to live (TTL) in milliseconds, use 0 if you want to keep the list until it is deleted.
const EXPIRES = 60000;

// Instantiate RedCircle
const rcircle = new RedCircle<string>(client, "local:elements", CAPACITY, EXPIRES);

async function main(): Promise<void> {
    // Clear the list
    await rcircle.clear();

    // Get the length of the buffer
    const length = await rcircle.length();
    console.log(length);
    // 0

    // Append elements to the buffer
    await rcircle.append("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
    
    // Get the length of the buffer
    const length = await rcircle.length();
    console.log(length);
    // 10
    
    // Get all elements in the buffer
    const elements = await rcircle.elements();
    console.log(elements);
    // ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0']

    // Get a range of elements in the buffer
    const range = await rcirlce.range(0, 2);
    console.log(range);
    // ['9', '8', '7']

    // Extend the Time to Live (TTL) if applicable
    await rcircle.touch();

    // Clear the list
    await rcircle.clear();
}
```

## License
MIT