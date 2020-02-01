const R = require('ramda');
const tablename = "Kraken_BTCUSD_1h";
const nSQL = require("@nano-sql/core").nSQL;
const fs = require('fs');
const moment = require('moment');
const numeral = require('numeral');

const { processData, processExaggeratedPortfolioData, calculateTotalPortfolio } = require("./portfolio");
const { authenticateGDocs, writeTable } = require('./google-docs');

function ETL({ options, output }) {
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
                    if (progress % 10 === 0) {
                        process.stdout.write('=');
                    }
                })
                .then(_ => console.log())
                .then(() => output);
        }).then((output_) => ({ options, output: output_ }));
    } else {
        return Promise.resolve({ options, output });
    }
}
const fetchAllPriceData = () => {
    return nSQL(tablename)
        .query("select")
        .orderBy(["timestamp ASC"])
        // .limit(100)
        .exec();
}
const getfinalBTCValue = (finalPortfolio) => {
    //ready to query
    return nSQL(tablename)
        .query("select")
        .orderBy(["timestamp ASC"])
        .limit(1)
        .exec()
        .then((records) => [R.head(records), finalPortfolio]);
};
const run = R.curry(function ({ options, output }, initialPortfolio, desiredAllocation) {
    if (options.run) {
        return fetchAllPriceData()
            .then(processData(desiredAllocation, initialPortfolio))
            .then(getfinalBTCValue)
            .then(([btcPrice, finalPortfolio]) => {
                const originalPortfolioValue = calculateTotalPortfolio(initialPortfolio, btcPrice);
                const newPortfolioValue = calculateTotalPortfolio(finalPortfolio, btcPrice);
                return R.append(({
                    performance: numeral((newPortfolioValue - originalPortfolioValue) / originalPortfolioValue).format("0.00%"), 
                    startValue: numeral(originalPortfolioValue).format("$0,0.00"),
                    endingValue: numeral(newPortfolioValue).format("$0,0.00"),
                    portfolio: desiredAllocation
                }), output);
            })
            .then((output_) => ({ options, output: output_ }));
    } else {
        return Promise.resolve({ options, output });
    }
});

const runExaggeratedPortfolio = R.curry(function ({ options, output }, initialPortfolio, desiredAllocation) {
    if (options.exaggeratedRun) {
        return fetchAllPriceData()
            .then(processExaggeratedPortfolioData(desiredAllocation, initialPortfolio))
            .then(getfinalBTCValue)
            .then(([btcPrice, finalPortfolio]) => {
                const originalPortfolioValue = calculateTotalPortfolio(initialPortfolio, btcPrice);
                const newPortfolioValue = calculateTotalPortfolio(finalPortfolio, btcPrice);
                return R.append(
                    `Performance: ${numeral((newPortfolioValue - originalPortfolioValue) / originalPortfolioValue).format("0.00%")} ${JSON.stringify(desiredAllocation)}`,
                    R.append(
                        `Starting Value: ${numeral(originalPortfolioValue).format("$0,0.00")}`,
                        R.append(
                            `Ending Value: ${numeral(newPortfolioValue).format("$0,0.00")}`, output)));
            })
            .then((output_) => ({ options, output: output_ }));
    } else {
        return Promise.resolve({options, output});
    }
});

module.exports = {
    ETL: ETL,
    run: run,
    runExaggeratedPortfolio: runExaggeratedPortfolio
};