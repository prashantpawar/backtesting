const tablename = "Kraken_BTCUSD_1h";
const nSQL = require("@nano-sql/core").nSQL;
const fs = require('fs');
const moment = require('moment');

const {process} = require("./portfolio");

const initialPortfolio = {
    BTC: 0,
    USD: 0
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
                "timestamp:date": {}
            }
        }
    ],
    version: 1
}).then(() => {
    return nSQL(tablename).loadCSV(csvRaw.toString(),
        (row) => {
            return {
                'timestamp': moment(row.at, "YYYY-MM-DD HH-a"),
                'symbol': ''
                'open': row.pe,
                'high': row.ig,
                'low': row.o,
                'close': row.los
            };
        })
        .then(() => "Data is in the database and ready")
        .catch(console.error);
}).then((res) => {
    return nSQL(tablename)
    .query("select")
    .exec()
    //.stream(cycle(initialPortfolio), complete, console.error);
})
.then(process(initialPortfolio))
.then((res) => {
    //ready to query
    console.log(res);
}).catch(console.error);