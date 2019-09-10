const _ = require('lodash');

require('dotenv').config();

async function init() {
  const Shrimpy = require('shrimpy-node');
  const client = new Shrimpy.ShrimpyApiClient(
    process.env.SHRIMPY_PUBLIC_KEY,
    process.env.SHRIMPY_PRIVATE_KEY,
  );

  const portfolio = [
    {
      symbol: 'XTZ',
      percent: 46.5,
    },
    {
      symbol: 'ETH',
      percent: 44.3,
    },
    {
      symbol: 'XBT',
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

  const backtestAssetsAll = await client.getBacktestAssets(exchange);
  const backtestAssets = _.filter(backtestAssetsAll, function(item) {
    return !_.isUndefined(_.find(portfolio, {symbol: item.symbol}));
  });

  let counter = 0;
  let fiatAllocation = 0;
  let rebalancePeriod = 1;
  let backtestSettings;

  const startingTime = _.reduce(_.map(backtestAssets, 'startTime'), function(
    latestStartTime,
    itemStartTime,
  ) {
    if (latestStartTime < itemStartTime) {
      return itemStartTime;
    }
    return latestStartTime;
  });

  const endingTime = _.reduce(_.map(backtestAssets, 'endTime'), function(
    earliestEndTime,
    itemEndTime,
  ) {
    if (earliestEndTime > itemEndTime) {
      return itemEndTime;
    }
    return earliestEndTime;
  });

  const getAllocationFromFiat = function(initialPortfolio, fiatAllocation) {
    const [fiatPortfolio, portfolioWitoutFiat] = _.partition(initialPortfolio, {
      symbol: 'USD',
    });
    const extraFiatAllocation = fiatAllocation - fiatPortfolio[0].percent;
    const cryptoTotal = _.reduce(
      _.map(portfolioWitoutFiat, 'percent'),
      function(sum, assetPercent) {
        return sum + assetPercent;
      },
    );

    return _.map(initialPortfolio, function(item) {
      if (item.symbol === 'USD') {
        return {
          symbol: item.symbol,
          percent: fiatAllocation,
        };
      } else {
        return {
          symbol: item.symbol,
          percent:
            (item.percent * (cryptoTotal - extraFiatAllocation)) / cryptoTotal,
        };
      }
    });
  };

  const newAlloc = getAllocationFromFiat(portfolio, 5);
  console.log(newAlloc);
  console.log(
    _.reduce(_.map(newAlloc, 'percent'), function(sum, item) {
      return sum + item;
    }),
  );
  /**

  for (i = 0; i <= 25; i += 5) {
    for (j = 0; j <= 45; j += 5) {
      backtestSettings = {
        exchange,
        rebalancePeriod,
        fee,
        startingTime,
        endingTime,
        startingCapital,
      };
      //console.log('rebalancePeriod: ' + (rebalancePeriod + i) + ' cash percent: ' + (fiatAllocation + j));
      console.log(backtestSettings);
      process.exit(1);
      counter++;
    }
  }

  console.log('Total Cases: ' + counter);
  **/
}
init();
