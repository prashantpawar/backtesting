const program = require('commander');
const { ETL, run } = require('./index');

const desiredAllocation = {
    BTC: 0.8,
    USD: 0.2
};
const initialPortfolio = {
    BTC: 10,
    USD: 80000
};

program
    .option('-d, --debug', 'output extra debugging')
    .option('-l, --load', 'load the data')
    .option('-r, --run', 'run the simulation');

program.parse(process.argv);

if (program.debug) console.log(program.opts());
Promise.resolve(program.opts())
.then(ETL)
.then(run(desiredAllocation, initialPortfolio))
.catch(console.error);