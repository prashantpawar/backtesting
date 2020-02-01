const { chain, fromPairs, toPairs, go, type, map } = require('ramda');

const flattenObj = obj => {
    const go = obj_ => chain(([k, v]) => {
        if (type(v) === 'Object' || type(v) === 'Array') {
            return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
        } else {
            return [[k, v]]
        }
    }, toPairs(obj_))

    return fromPairs(go(obj))
};

module.exports = {
    flattenObj
};