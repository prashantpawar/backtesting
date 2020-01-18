const program = require('commander');
const { ETL, run } = require('./index');

program
    .option('-d, --debug', 'output extra debugging')
    .option('-l, --load', 'load the data')
    .option('-r, --run', 'run the simulation');

program.parse(process.argv);

if (program.debug) console.log(program.opts());
Promise.resolve(program.opts())
.then(ETL)
.then(run)
.catch(console.error);