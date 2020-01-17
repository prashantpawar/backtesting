const tablename = "Kraken_BTCUSD_1h";
const nSQL = require("@nano-sql/core").nSQL;
const fs = require('fs');
const moment = require('moment');

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
                "open:float": {},
                "high:float": {},
                "low:float": {},
                "close:float": {}
            },
            indexes: {
                "timestamp:date":{}
            }
        }
    ],
    version: 1
}).then(() => {
    return nSQL(tablename).loadCSV(csvRaw.toString(),
    (row) => {
        return {
            'timestamp': moment(row.at, "YYYY-MM-DD HH-a"),
            'open': row.pe,
            'high': row.ig,
            'low': row.o,
            'close': row.los
        };
    })
    .then(() => {
        return "Data is in the databsase and ready";
    })
    .catch(console.error);
}).then((res) => {
    return nSQL(tablename).query("select").exec();
}).then((res) => {
    //ready to query
    console.log(res);
}).catch(console.error);