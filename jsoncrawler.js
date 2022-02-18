/**
 * @typedef {Object[]} searchResult
 * @property {(string | number)} result[].path - Value path in JSON Object
 * @property {(string | number)} result[].key - Key name of the result
 * @property {(string | number)} result[].siblings - Key names of the siblings
 * @property {(string | number)} result[].value - Value of the searched result
 */

/**
 * jsonCrawler is a simple module for searching complex JSON objects.
 * @module jsonCrawler
 * @param {(Object | Array)} json - JSON Object | Array to search
 * @param {(number | string | Array<number | string>)} search - Value to search in JSON Object.
 * @param {Object} [option] - Search option
 * @param {(any | any[])} option.replace - Value to replace the original JSON Object. Searched values will be replaced by given parameters. If Array is given, corresponding array index of search parameter will be replaced.
 * @param {(number | string)} option.filter - Key names to exclude. Search will ignore any matching key names of the JSON Object.
 * @returns {searchResult}
 */
function jsonCrawler(json, search, option) {
    let { replace, filter = [] } = option || {};

    if (!search)
        throw 'search: invalid argument';

    search = Array.isArray(search) ? search : [search];

    for (let s of search)
        if (!(typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean'))
            throw 'search: invalid argument';

    if (replace !== undefined && !Array.isArray(replace))
        replace = [replace];

    if (typeof filter === 'string' || typeof filter === 'number')
        filter = [filter];

    if (!Array.isArray(filter))
        throw 'filter: invalid argument';

    let found = [];

    let _jsonCrawler = (o, callback, map) => {
        let _dataType = (v) => {
            return Array.isArray(v) && v.length ? 'array' : (v && typeof v === 'object' && Object.keys(v).length) ? 'object' : 'value';
        };

        let setMap = (key, o, map = {
            node: [],
            value: null,
            checkpoint: [],
            siblings: [],
            checkout: false,
            dataKey: null
        }) => {
            let value = o[key];
            let valueType = _dataType(value);
            let oType = _dataType(o);

            let numberKeyWhenArray = (key) => {
                return oType === 'array' ? isNaN(Number(key)) ? key : Number(key) : key;
            };

            key = numberKeyWhenArray(key);

            // generate array of siblings key name
            map.siblings = Object.keys(o).map(m => numberKeyWhenArray(m));
            map.value = value;
            map.dataKey = null;

            if (map.checkout) {
                // retrieve to checkpoint

                let idx = map.node.length;

                // splice node list from latest checkpoint
                while (idx--) {
                    if (map.node[idx] === map.checkpoint[map.checkpoint.length - 1]) {
                        map.node.splice(idx);
                        break;
                    }
                }

                // splice latest checkpoint
                map.checkpoint.splice(map.checkpoint.length - 1);
                map.checkout = false;
            }

            if (map.siblings[map.siblings.length - 1] === key && valueType === 'value') {
                // end of the keys. revert to checkpoint on next run.
                map.checkout = true;
            }

            if (valueType === 'object' || valueType === 'array') {
                // for nested object. need to add node location
                if (!filter.includes(key)) {
                    map.node.push(key);

                    // push checkpoint key
                    if (map.siblings.length > 1 && map.siblings[map.siblings.length - 1] !== key)
                        map.checkpoint.push(key);
                }
            } else
                // save key name of value
                map.dataKey = key;

            return map;
        };

        let dataType = _dataType(o);

        if (dataType === 'value') {
            // exit
            callback({ node: [], value: o, dataKey: null, siblings: [] });
            return;
        }

        // loop through object keys
        for (let key in o) {
            key = dataType === 'array' ? Number(key) : key;

            // map is passed from _jsonCrawler argument. undefined at first run.
            let _map = setMap(key, o, map);

            if (filter.includes(key))
                continue;

            if (_dataType(_map.value) === 'value' && !filter.includes(_map.dataKey)) {
                let { node, value, dataKey, siblings } = _map;
                callback({ node, value, dataKey, siblings });
                continue;
            }

            _jsonCrawler(_map.value, callback, _map);

        }
    };

    _jsonCrawler(json, (m) => {
        for (let f of search) {
            if (!filter.includes(m.dataKey) && m.value === f) {
                let node = JSON.parse(JSON.stringify(m));
                found.push({
                    path: node.node,
                    key: node.dataKey,
                    siblings: (() => {
                        node.siblings.splice(node.siblings.indexOf(node.dataKey), 1);
                        return node.siblings;
                    })(),
                    value: node.value
                });
            }
        }
    });

    if (replace) {
        for (const f of found) {
            let j = json;
            let index = search.indexOf(f.value);
            if (replace[index] !== undefined) {
                for (let idx = 0; f.path.length > idx; idx++)
                    // goto path
                    j = j[f.path[idx]];

                j[f.key] = replace[index];
            }
        }
    }

    return found;
}

module.exports = { jsonCrawler };