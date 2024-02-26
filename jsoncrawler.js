function jsonCrawler(json, search, option) {
    let { replace, filter = [] } = option || {};

    search = Array.isArray(search) ? search : search !== undefined ? [search] : [];

    for (let s of search)
        if (!(typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean' || s === null))
            throw 'search: invalid argument';

    if (replace !== undefined && !Array.isArray(replace)) {
        replace = [replace];

        for (let r of replace)
            if (!(typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean' || r === null))
                throw 'replace: invalid argument';
    }

    if (typeof filter === 'string' || typeof filter === 'number')
        filter = [filter];

    if (!Array.isArray(filter))
        throw 'filter: invalid argument';

    let found = [];

    let _jsonCrawler = (o, callback, map) => {
        let _dataType = (v) => {
            return Array.isArray(v) && v.length ? 'array' : (typeof v) === 'object' && v !== null ? 'object' : 'value';
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
        for (let k in o) {
            let key = dataType === 'array' ? Number(k) : k;

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
        if (search.length === 0) {
            if (!filter.includes(m.dataKey) && typeof m.value === 'string' || typeof m.value === 'number' || typeof m.value === 'boolean' || m.value === null || m.value === undefined) {
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

        else
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
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.jsonCrawler = factory();
    }
}(this, function () {
    // Your function here
    return jsonCrawler;
}));