const R = require('ramda');

function calculateTotalPortfolio(portfolio, prices) {
    return (portfolio['BTC'] * prices['close']) + portfolio['USD'];
}
module.exports = {
    process: R.curry(function (portfolio, rows) {
        return R.reduce(function (currentPortfolio, row) {
            const btcPrice = row.close;
            const btcValue = currentPortfolio.BTC * btcPrice;
            const usdValue = currentPortfolio.USD;
            const totalValue = btcValue + usdValue;
            let newPortfolio = {};
            if (btcValue / totalValue * 100 > 50) {
                const diff = btcValue - (totalValue * 0.5);
                newPortfolio.BTC = currentPortfolio.BTC - (diff / btcPrice);
                newPortfolio.USD = currentPortfolio.USD + diff;
           } else if (btcValue / totalValue * 100 < 50) {
                const diff = (totalValue * 0.5) - btcValue;
                newPortfolio.BTC = currentPortfolio.BTC + (diff / btcPrice);
                newPortfolio.USD = currentPortfolio.USD - diff;
           }
           console.log(row.timestamp, row.close, newPortfolio); 
           return newPortfolio;
        }, portfolio, rows);
    })
};