# jsoncrawler

`jsoncrawler` searches and optionally replaces values in nested JavaScript objects/arrays.

It returns match metadata so you can locate each value:
- `path`: parent path to the value
- `key`: key/index of the value on that parent
- `siblings`: keys/indexes on the same level (excluding current key)
- `value`: matched value

## Install

Browser:

```html
<script src="https://cdn.jsdelivr.net/npm/jsoncrawler@latest/jsoncrawler.js"></script>
```

Node:

```bash
npm i jsoncrawler
```

## Import / Usage

### Node.js (CommonJS)

```js
const jsonCrawler = require('jsoncrawler');
```

### Node.js (ESM)

```js
import jsonCrawler from 'jsoncrawler';
```

If your runtime/bundler resolves CommonJS default exports differently, use:

```js
import pkg from 'jsoncrawler';
const jsonCrawler = pkg.default || pkg;
```

### Browser global (from script tag)

```html
<script src="https://cdn.jsdelivr.net/npm/jsoncrawler@latest/jsoncrawler.js"></script>
<script>
    const result = jsonCrawler({ a: 1, b: 'x' }, 'x');
    console.log(result);
</script>
```

## API

```ts
function jsonCrawler(
    data: { [key: string]: any } | any[] | string,
    search?: Array<string | number | boolean | null> | string | number | boolean | null,
    option?: {
        replace?: any[] | any,
        filter?: Array<string | number> | string | number
    }
): Array<{
    path: Array<string | number>,
    key: string | number,
    siblings: Array<string | number>,
    value: any
}>;
```

### Input behavior

- `data` can be:
    - object/array (normal traversal), or
    - JSON string (parsed once with `JSON.parse` before traversal).
- Invalid JSON string throws: `Error('json: invalid JSON string')`.
- `search` can be single value or array. If omitted, crawler performs full scan.
- `filter` can be single key/index or array.

## Quick examples

### 1) Full scan (no search)

```js
const obj = {
    artist: 'DIA',
    tracks: ['Paradise', { hidden: 'Come On Down' }]
};

const result = jsonCrawler(obj);
console.log(result);
```

### 2) Search values

```js
const result = jsonCrawler(obj, ['Come On Down', 'DIA']);
console.log(result);
```

### 3) Replace values (in-place for object/array input)

```js
const data = ['Linux', 'Ubuntu', ['Mint', { mini: ['Lubuntu', 'linux'] }]];

jsonCrawler(data, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus']
});

console.log(data);
// ["Linus","Ubuntu",["Mint",{"mini":["Xubuntu","linux"]}]]
```

### 4) Filter keys/indexes

```js
jsonCrawler(data, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus'],
    filter: ['mini']
});
```

### 5) JSON string input

```js
const source = '{"a":1,"b":{"c":"x"},"arr":["x",2]}';
const found = jsonCrawler(source, 'x');
console.log(found);
```

## Notes from current implementation

- Traversal is recursive and visits own enumerable keys.
- Circular references are safely skipped (no infinite recursion).
- `NaN` search is supported when input is a JS object/array.
- If `replace` is provided, replacements are mapped by search index order.
- For JSON string input, replacements apply to the parsed internal object; your original string is not mutated.

## Demo reference

See `demo.js` for complete examples of:
- full scan,
- targeted search,
- in-place replacement (including object replacement),
- key filtering.