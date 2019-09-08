module.exports = {
  client: {
    getBacktestAssets: function(exchangeName) {
      return [
        {
          "symbol": "ETH",
          "endTime": "2019-07-05T23:00:00.000Z",
          "startTime": "2016-09-06T13:00:00.000Z"
        },
        {
          "symbol": "XTZ",
          "endTime": "2019-07-05T23:00:00.000Z",
          "startTime": "2018-11-06T13:00:00.000Z"
        },
        {
          "symbol": "LTC",
          "endTime": "2018-11-05T23:00:00.000Z",
          "startTime": "2016-09-06T13:00:00.000Z"
        },
        {
          "symbol": "BTC",
          "endTime": "2019-07-05T23:00:00.000Z",
          "startTime": "2015-05-17T01:00:00.000Z"
        },
      ];
    },
  }
};
