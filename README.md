# jsoncrawler

**jsoncrawler** is a simple module that search/replace data inside complex javascript objects

## Getting started
Add script tag in your header

```html
<script src="https://cdn.jsdelivr.net/npm/jsoncrawler@latest/jsoncrawler.js"></script>
```

Or on node.js or webpack based projects:

```
npm i jsoncrawler
```

And in your javascript:

```
import jsonCrawler from 'jsoncrawler';
```

## Parameters

``` ts
function jsonCrawler(
    object_to_search: {[key:string]: any} | any[],
    value_to_search: Array<number | string | boolean>,
    options: {
        replace: Array<number | string | boolean>, // Value to replace. Must be in the same order as the search array.
        filter: Array<number | string> // Key names or index numbers to exclude from search/replacement
    }): {
        path: Array<number | string>, // Nested key path in order to the parent location
        key: string | number, // Key names or index number of the parent value
        siblings: Array<number | string>, // Key names or index numbers of the siblings that are present on the same level
        value: number | string | boolean // Value you have searched
    }[]
```

## Full scan
You can scan the whole object and get the key path, key name, siblings and value

**_Example_**
```js
let obj = {
    artist: "DIA",
    tracks: [
        "Paradise",
        {
            hidden: "Come On Down"
        }
    ]
}

let result = jsonCrawler(obj);

/*
result returns:
[
  { path: [], key: 'artist', siblings: [ 'tracks' ], value: 'DIA' },
  { path: [ 'tracks' ], key: 0, siblings: [ 1 ], value: 'Paradise' },
  {
    path: [ 'tracks', 1 ],
    key: 'hidden',
    siblings: [],
    value: 'Come On Down'
  }
]
*/
```

## Searching value
Search and locate value inside complex json object

**_Example_**

``` js
// Let's find value "DIA" and "Come On Down"

let obj = {
    artist: "DIA",
    tracks: [
        "Paradise",
        {
            hidden: "Come On Down"
        }
    ]
}

let result = jsonCrawler(obj, ["Come On Down", "DIA"]);

/*
result returns:
[
  { path: [], key: 'artist', siblings: [ 'tracks' ], value: 'DIA' },
  {
    // 'path' is the key path to the data location:
    path: [ 'tracks', 1 ],
    
    // 'key' is the key name of the value
    key: 'hidden',
    
    // 'siblings' is the key names that are present on the same level
    siblings: [],
    
    // 'value' is the value you have searched
    value: 'Come On Down'
  }
]

Note: search results does not come in order.
*/

// to get to the searched data:

let ComeOnDown = obj;

result[1].path.forEach(p => {
    // dive in to the key path
    ComeOnDown = ComeOnDown[p];
});

// your value is in the key
ComeOnDown = ComeOnDown[result[1].key];

let DIA = obj;
result[0].path.forEach(p => {
    DIA = DIA[p];
});
DIA = DIA[result[0].key];

```

## Replacing value
You can replace the value easily

**_Example_**

```js
let replace = ['Linux', 'Ubuntu', ['Mint', {mini: ['Lubuntu', 'linux']}]];

// replace 'Lubuntu' with 'Xubuntu' and 'Linux' with 'Linus'
// Make sure the search array and replace array values are in the same order.

jsonCrawler(replace, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus']
});

console.log(replace);
// returns ["Linus","Ubuntu",["Mint",{"mini":["Xubuntu","linux"]}]]
```

## Filtering keys
You can exclude your search/replacement in certain key names or index numbers

**_Example_**

```js
let replace = ['Linux', 'Ubuntu', ['Mint', {mini: ['Lubuntu', 'linux']}]];

// replace 'Lubuntu' with 'Xubuntu' and 'Linux' with 'Linus'
// but exclude data inside keyname 'mini'
 
jsonCrawler(replace, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus'],
    filter: ['mini']
});

console.log(replace);
// returns ["Linus","Ubuntu",["Mint",{"mini":["Lubuntu","linux"]}]]

```