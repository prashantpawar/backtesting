const R = require('ramda');
const tablename = "Kraken_BTCUSD_1h";
const nSQL = require("@nano-sql/core").nSQL;
const fs = require('fs');
const moment = require('moment');

const {processData, calculateTotalPortfolio} = require("./portfolio");

const initialPortfolio = {
    BTC: 10,
    USD: 80000
};

const csvRaw = fs.readFileSync(`${tablename}.csv`);
nSQL().createDatabase({
    id: "shrimpy-backtest",
    mode: "TEMP",
    tables: [
        {
            name: tablename,
            model: {
                "id:int": { pk: true, ai: true },
                "timestamp:date": {},
                "symbol:string": {},
                "open:float": {},
                "high:float": {},
                "low:float": {},
                "close:float": {}
            },
            indexes: {
                'timestamp:date' : {}
            }
        }
    ],
    version: 1
}).then(() => {
    return nSQL(tablename).loadCSV(csvRaw.toString(),
        (row) => {
            return {
                'timestamp': moment(row.at, "YYYY-MM-DD HH-a").toISOString(),
                'symbol': 'BTCUSD',
                'open': row.pe,
                'high': row.ig,
                'low': row.o,
                'close': row.los
            };
        },
        (progress) => {
            if (progress % 10 == 0) {
                process.stdout.write('=');
            }
        })
        .then(() => console.log("\nData is in the database and ready"))
        .catch(console.error);
}).then((res) => {
    return nSQL(tablename)
    .query("select")
    .orderBy(["timestamp ASC"])
    // .limit(100)
    .exec()
})
.then(processData(initialPortfolio))
.then((finalPortfolio) => {
    //ready to query
    nSQL(tablename)
    .query("select")
    .orderBy(["timestamp ASC"])
    .limit(1)
    .exec()
    .then((records) => {
        const lastRow = R.head(records);
        console.log(calculateTotalPortfolio(initialPortfolio, lastRow))
        console.log(calculateTotalPortfolio(finalPortfolio, lastRow))
    });
}).catch(console.error);