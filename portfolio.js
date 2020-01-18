const R = require('ramda');
module.exports = {
    process: R.curry(function (portfolio, rows) {
        return R.reduce(function (current, row) {
            return R.map(current, function (val, key, obj) {
                
            });
        }, portfolio, rows);
    })
};