# jsoncrawler

**jsoncrawler** is a simple module that search/replace data inside complex javascript objects
<br />

## Getting started
Add script tag in your header
```
<script src="https://cdn.jsdelivr.net/npm/jsoncrawler@latest/dist/jsoncrawler.js"></script>
```
<br />

Or on node.js or webpack based projects:
```
npm i jsoncrawler
```
And in your javascript:
```
import {jsonCrawler} from 'jsoncrawler';
```
<br />

## Basic usage

#### jsonCrawler(<object | array: object to search>, <number | string | boolean: value to search>, <object: options>)


### Searching value
Search and locate value inside complex json object

**_Example_**

```
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

result[1].path.map(p => {

    // dive in to the key path
    ComeOnDown = ComeOnDown[p];
    
});

// your value is in the key
ComeOnDown = ComeOnDown[result[1].key];

let DIA = obj;
result[0].path.map(p => {
    DIA = DIA[p];
});
DIA = DIA[result[0].key];

```

<br />

### Replacing value
You can replace the value easily

**_Example_**

```
let replace = ['Linux', 'Ubuntu', ['Mint', {mini: ['Lubuntu', 'linux']}]];

// replace 'Lubuntu' with 'Xubuntu' and 'Linux' with 'Linus'
// Make sure the search array and replace array values are in the same order.

jsonCrawler(replace, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus']
});

console.log(JSON.stringify(replace));
// returns ["Linus","Ubuntu",["Mint",{"mini":["Xubuntu","linux"]}]]

```

## Filtering keys
You can exclude your search/replacement in certain key names

**_Example_**

```
let replace = ['Linux', 'Ubuntu', ['Mint', {mini: ['Lubuntu', 'linux']}]];

// replace 'Lubuntu' with 'Xubuntu' and 'Linux' with 'Linus'
// but exclude data inside keyname 'mini'
 
jsonCrawler(replace, ['Lubuntu', 'Linux'], {
    replace: ['Xubuntu', 'Linus'],
    filter: ['mini']
});

console.log(JSON.stringify(replace));
// returns ["Linus","Ubuntu",["Mint",{"mini":["Lubuntu","linux"]}]]

```