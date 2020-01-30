const R = require('ramda');
const program = require('commander');
const { ETL, run, runExaggeratedPortfolio } = require('./index');

const { authenticateGDocs, writeTable } = require('./google-docs');

//REMOVE ME
/**
let values = [
    ['Name', 'Age'],
    ['Prashant', 'CS']
];
const { authenticate, writeTable} = require('./google-docs');
authenticate()
.then(writeTable('1Ms45f7L3ZUDjBFMkznOBRVCorvORNly1ZXH3NK9oYD4', 'A1:B2', values))
.then(console.log)
.catch(console.error);
return;
*/

program
    .option('-d, --debug', 'output extra debugging')
    .option('-l, --load', 'load the data')
    .option('-r, --run', 'run the real portfolio simulation')
    .option('-e, --exaggerated-run', 'run the exaggerated portfolio simulation');

program.parse(process.argv);

if (program.debug) console.log(program.opts());
authenticateGDocs()
    .then(_ => ({ options: program.opts(), output: [] }))
    .then(ETL)
    .then(function handleRealPortfolio({ options, output }) {
        const initialPortfolio = {
            BTC: 17,
            USD: 80000
        };

        const tens = R.reject(R.modulo(R.__, 10));
        return R.reduce((accu, i) => {
            return accu.then((args) => run(args, initialPortfolio, {
                BTC: i / 100,
                USD: (100 - i) / 100
            }));
        },
            Promise.resolve({ options, output }),
            tens(R.range(0, 101)));
    })
    .then()
    .then(o => { console.log("after handleRealPortfolio", o.output); return o;})
    .then(function handleExaggeratedPortfolio({ options, output }) {
        const initialPortfolio = {
            BTC: 17,
            USD: {
                real: 80000,
                fake: 120000
            }
        };
        return runExaggeratedPortfolio({ options, output }, initialPortfolio, {
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
    .then(o => { console.log("after handleExaggeratedPortfolio", o.output); return o;})
    .catch(console.error);