const R = require('ramda');

const processData = R.curry(function (desiredAllocation, portfolio, rows) {
    return R.reduce(function (currentPortfolio, row) {
        const btcPrice = row.close;
        const btcValue = currentPortfolio.BTC * btcPrice;
        const usdValue = currentPortfolio.USD;
        const totalValue = btcValue + usdValue;
        let newPortfolio = {};
        if (btcValue / totalValue > desiredAllocation.BTC) {
            const diff = btcValue - (totalValue * desiredAllocation.BTC);
            newPortfolio.BTC = currentPortfolio.BTC - (diff / btcPrice);
            newPortfolio.USD = currentPortfolio.USD + diff;
        } else if (btcValue / totalValue < desiredAllocation.BTC) {
            const diff = (totalValue * desiredAllocation.BTC) - btcValue;
            newPortfolio.BTC = currentPortfolio.BTC + (diff / btcPrice);
            newPortfolio.USD = currentPortfolio.USD - diff;
        } else {
            newPortfolio = currentPortfolio;
        }
        return newPortfolio;
    }, portfolio, rows);
});
module.exports = {
    calculateTotalPortfolio: function (portfolio, prices) {
        return (portfolio['BTC'] * prices['close']) + portfolio['USD'];
    },
    processData: processData,
    processExaggeratedPortfolioData: R.curry(function (desiredAllocation, portfolio, rows) {
        return R.reduce(function (currentPortfolio, row) {
            const btcPrice = row.close;
            const btcValue = currentPortfolio.BTC * btcPrice;
            const usdValue = currentPortfolio.USD.real + currentPortfolio.USD.fake;
            const totalValue = btcValue + usdValue;
            let newPortfolio = R.clone(currentPortfolio);
            if (btcValue / totalValue > desiredAllocation.BTC) {
                const diff = btcValue - (totalValue * desiredAllocation.BTC);
                // if(currentPortfolio.BTC - (diff / btcPrice) >= 0) {
                    newPortfolio.BTC = currentPortfolio.BTC - (diff / btcPrice);
                    newPortfolio.USD.real = currentPortfolio.USD.real + diff;
                // }
            } else if (btcValue / totalValue < desiredAllocation.BTC) {
                const diff = (totalValue * desiredAllocation.BTC) - btcValue;
                if(currentPortfolio.USD.real - diff >= 0) {
                    newPortfolio.BTC = currentPortfolio.BTC + (diff / btcPrice);
                    newPortfolio.USD.real = currentPortfolio.USD.real - diff;
                }
            }
            // console.log(newPortfolio);
            return newPortfolio;
        }, portfolio, rows);
    })
};