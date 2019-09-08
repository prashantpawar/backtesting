const client = require('./client').client;
const _ = require('lodash');

const portfolio = [
  {
    symbol: 'XTZ',
    percent: 46.50,
  },
  {
    symbol: 'ETH',
    percent: 44.30,
  },
  {
    symbol: 'BTC',
    percent: 5.03,
  },
  {
    symbol: 'USD',
    percent: 4.17,
  },
];

const exchange = 'kraken';
const startingCapital = 500000;
const fee = 0.15;

const backtestAssetsAll = client.getBacktestAssets(exchange);
const backtestAssets = backtestAssetsAll.filter(function (item) {
  return !_.isUndefined(_.find(portfolio, { 'symbol': item.symbol}));
});

let counter = 0;
let fiatAllocation = 0;
let rebalancePeriod = 1;
let backtestSettings;

const startingTime = _.reduce(_.map(backtestAssets, 'startTime'),
  function (earliestTime, item) {
    if (earliestTime > item) {
      return item;
    }
    return item;
  });
const endingTime = _.reduce(_.map(backtestAssets, 'endTime'),
  function (latestTime, item) {
    if (latestTime < item) {
      return item;
    }
    return item;
  });

for(i = 0; i <= 25; i+=5) {
  for(j = 0; j <= 45; j+=5) {
    backtestSettings = {
      exchange,
      rebalancePeriod,
      fee,
      startingCapital,
    };
    //console.log('rebalancePeriod: ' + (rebalancePeriod + i) + ' cash percent: ' + (fiatAllocation + j));
    console.log(backtestSettings);
    process.exit(1);
    counter++;
  }
}

console.log('Total Cases: ' + counter);
