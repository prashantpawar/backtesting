const alasql = require('alasql');
const ohlcDataFilename = "./Kraken_BTCUSD_1h.csv";
const tablename = 'Kraken_BTCUSD_1H';

//const timeseries = new alasql.Database("Kraken_BTCUSD_1H");

function ETL() {
    alasql(`ATTACH FILESTORAGE DATABASE one("./${tablename}.json");`)
    alasql(`CREATE TABLE ${tablename} (
        Id INT PRIMARY KEY,
        Date_ DATE,
        Close_ DOUBLE PRECISION
    )`);
    let result = alasql.promise([
        `SELECT * INTO ${tablename} FROM CSV("${ohlcDataFilename}", {headers:true})`,
        ])
        .then(function (results) {
            console.log(results);
        }).catch(console.error);
    return result;
}

function READ() {
    let result = alasql.promise([
        `SELECT * FROM ${tablename}`
        ])
        .then(function (results) {
            console.log(results);
        })
        .catch(console.error);
    return result;
}

ETL().then(READ);
READ();