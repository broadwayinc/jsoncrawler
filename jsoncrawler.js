function jsonCrawler(json, search, option) {
    let { replace, filter = [] } = option || {};

    if (typeof json === 'string') {
        try {
            json = JSON.parse(json);
        } catch (err) {
            throw new Error('json: invalid JSON string');
        }
    }

    let isAllowedValue = (value) => {
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null;
    };

    let isAllowedReplaceValue = (value) => {
        return value === undefined
            || value === null
            || typeof value === 'string'
            || typeof value === 'number'
            || typeof value === 'boolean'
            || (typeof value === 'object');
    };

    let isSameValue = (left, right) => {
        return left === right || (Number.isNaN(left) && Number.isNaN(right));
    };

    let isFilteredKey = (key, filterList) => {
        return filterList.includes(key)
            || (typeof key === 'number' && filterList.includes(String(key)))
            || (typeof key === 'string' && /^\d+$/.test(key) && filterList.includes(Number(key)));
    };

    search = Array.isArray(search) ? search : search !== undefined ? [search] : [];

    for (let s of search)
        if (!isAllowedValue(s))
            throw new Error('search: invalid argument');

    if (replace !== undefined && !Array.isArray(replace))
        replace = [replace];

    if (Array.isArray(replace))
        for (let r of replace)
            if (!isAllowedReplaceValue(r))
                throw new Error('replace: invalid argument');

    if (typeof filter === 'string' || typeof filter === 'number')
        filter = [filter];

    if (!Array.isArray(filter))
        throw new Error('filter: invalid argument');

    let found = [];
    let foundSearchIndexes = [];
    let visitedNodes = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

    let _jsonCrawler = (o, callback, map) => {
        let _dataType = (v) => {
            return Array.isArray(v) && v.length ? 'array' : (typeof v) === 'object' && v !== null && Object.keys(v).length ? 'object' : 'value';
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
                if(valueType === 'array' && map.value.length === 0) {
                    map.dataKey = key;
                }
                else if(valueType === 'object' && Object.keys(value).length === 0) {
                    map.dataKey = key;
                }
                else if (!isFilteredKey(key, filter)) {
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

        if ((dataType === 'array' || dataType === 'object') && visitedNodes) {
            if (visitedNodes.has(o))
                return;
            visitedNodes.add(o);
        }

        if (dataType === 'value') {
            // exit
            callback({ node: [], value: o, dataKey: null, siblings: [] });
            return;
        }

        // loop through object keys
        for (let k of Object.keys(o)) {
            let key = dataType === 'array' ? Number(k) : k;

            // map is passed from _jsonCrawler argument. undefined at first run.
            let _map = setMap(key, o, map);

            if (isFilteredKey(key, filter))
                continue;

            if (_dataType(_map.value) === 'value' && !isFilteredKey(_map.dataKey, filter)) {
                let { node, value, dataKey, siblings } = _map;
                callback({ node, value, dataKey, siblings });
                continue;
            }

            _jsonCrawler(_map.value, callback, _map);
        }
    };

    _jsonCrawler(json, (m) => {
        if (search.length === 0) {
            if (!isFilteredKey(m.dataKey, filter)) {
                let siblings = m.siblings.slice();
                let keyIndex = siblings.indexOf(m.dataKey);

                if (keyIndex !== -1)
                    siblings.splice(keyIndex, 1);

                found.push({
                    path: m.node.slice(),
                    key: m.dataKey,
                    siblings,
                    value: m.value
                });
                foundSearchIndexes.push(-1);
            }
        }

        else
            for (let index = 0; index < search.length; index++) {
                let f = search[index];

                if (!isFilteredKey(m.dataKey, filter) && isSameValue(m.value, f)) {
                    let siblings = m.siblings.slice();
                    let keyIndex = siblings.indexOf(m.dataKey);

                    if (keyIndex !== -1)
                        siblings.splice(keyIndex, 1);

                    found.push({
                        path: m.node.slice(),
                        key: m.dataKey,
                        siblings,
                        value: m.value
                    });
                    foundSearchIndexes.push(index);
                }
            }
    });

    if (replace) {
        for (let i = 0; i < found.length; i++) {
            let f = found[i];
            let j = json;
            let index = foundSearchIndexes[i];

            if (replace[index] !== undefined) {
                for (let idx = 0; f.path.length > idx; idx++)
                    // goto path
                    j = j[f.path[idx]];

                j[f.key] = replace[index];
            }
        }
    }

    return found;
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node / CommonJS
        let exported = factory();
        module.exports = exported;
        module.exports.default = exported;
    } else {
        // Browser globals
        root.jsonCrawler = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
    // Your function here
    return jsonCrawler;
}));