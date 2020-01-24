const R = require('ramda');
const program = require('commander');
const { ETL, run, runExaggeratedPortfolio } = require('./index');

//REMOVE ME
const { authenticate, writeTable} = require('./google-docs');
authenticate().then(writeTable);
return;

program
    .option('-d, --debug', 'output extra debugging')
    .option('-l, --load', 'load the data')
    .option('-r, --run', 'run the real portfolio simulation')
    .option('-e, --exaggerated-run', 'run the exaggerated portfolio simulation');

program.parse(process.argv);

if (program.debug) console.log(program.opts());
Promise.resolve(program.opts())
    .then(ETL)
    .then(function handleRealPortfolio(options) {
        const initialPortfolio = {
            BTC: 17,
            USD: 80000
        };

        const tens = R.reject(R.modulo(R.__, 10));
        return R.reduce((accu, i) => {
            return accu.then(() => run(options, initialPortfolio, {
                BTC: i / 100,
                USD: (100 - i) / 100
            }));
        },
            Promise.resolve(options),
            tens(R.range(0, 101)));
    })
    .then(function handleExaggeratedPortfolio(options) {
        const initialPortfolio = {
            BTC: 17,
            USD: {
                real: 80000,
                fake: 120000
            }
        };
        return runExaggeratedPortfolio(options, initialPortfolio, {
            BTC: 0.5,
            USD: {
                real: 0.2,
                fake: 0.3
            }
        });
        /**
        const tens = R.reject(R.modulo(R.__, 10));
        return R.reduce((accu, i) => {
            return accu.then(() =>
                runExaggeratedPortfolio(options, initialPortfolio, {
                    BTC: 0.5,
                    USD: {
                        fake: 0.5 - (i/100),
                        real: i / 100
                    }
                }));
        },
            Promise.resolve(options),
            tens(R.range(0, 51)));
            */
    })
    .catch(console.error);