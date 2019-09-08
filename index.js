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
  return !_.isUndefined(_.find(portfolio, { 'name': item.symbol}));
});

const backtestSettings = {
    exchange,
    rebalancePeriod,
    
}

let counter = 0;
let fiatAllocation = 0;
let rebalancePeriod = 1;
for(i = 0; i <= 25; i+=5) {
  for(j = 0; j <= 45; j+=5) {
    console.log('rebalancePeriod: ' + (rebalancePeriod + i) + ' cash percent: ' + (fiatAllocation + j));
    counter++;
  }
}

console.log('Total Cases: ' + counter);
