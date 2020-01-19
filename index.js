const R = require('ramda');
const tablename = "Kraken_BTCUSD_1h";
const nSQL = require("@nano-sql/core").nSQL;
const fs = require('fs');
const moment = require('moment');
const numeral = require('numeral');

const { processData, calculateTotalPortfolio } = require("./portfolio");

function ETL(options) {
        if (options.load) {
            const csvRaw = fs.readFileSync(`${tablename}.csv`);
            return nSQL().createDatabase({
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
                            'timestamp:date': {}
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
                    .then(() => console.log("\nData is in the database and ready"));
            }).then(() => options);
        } else {
            return Promise.resolve(options);
        }
}
const run = R.curry(function (desiredAllocation, initialPortfolio, options) {
    if (options.run) {
        return nSQL(tablename)
            .query("select")
            .orderBy(["timestamp ASC"])
            // .limit(100)
            .exec()
            .then(processData(desiredAllocation, initialPortfolio))
            .then((finalPortfolio) => {
                //ready to query
                nSQL(tablename)
                    .query("select")
                    .orderBy(["timestamp ASC"])
                    .limit(1)
                    .exec()
                    .then((records) => {
                        const lastRow = R.head(records);
                        const originalPortfolioValue = calculateTotalPortfolio(initialPortfolio, lastRow);
                        const newPortfolioValue = calculateTotalPortfolio(finalPortfolio, lastRow);
                        console.log("Performance: ", numeral((newPortfolioValue - originalPortfolioValue)/originalPortfolioValue).format("0.00%"), desiredAllocation);
                        // console.log("Starting Value:", numeral(originalPortfolioValue).format("$0,0.00"))
                        // console.log("Ending Value:", numeral(newPortfolioValue).format("$0,0.00"));
                    });
            })
            .then(() => options);
    } else {
        return Promise.resolve(options);
    }
});

module.exports = {
    ETL: ETL,
    run: run
};