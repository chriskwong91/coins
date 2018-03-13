const request = require('request');
const chalk = require('chalk');
const numeral = require('numeral');

const URLS = [
  'https://api.coinmarketcap.com/v1/ticker/vechain/',
  'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
];

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function makeRequest(url, params, cb) {
  request(url, function(err, res) {
    if (err) {
      console.log('Error fetching the coin', err);
      return;
    }

  
    let data = res.body; 

    try {
      data = eval(res.body)[0];
    } catch(e) {
      console.log(e);
    }
    return cb(data);
  });
}

function fetchData() {
  console.log('\n');
  console.log(formatDate(new Date()));
  request('https://api.coinmarketcap.com/v1/global/', (err, res) => {
    const data = JSON.parse(res.body);
    const {total_market_cap_usd, total_24h_volume_usd, bitcoin_percentage_of_market_cap} = data;
    console.log(`MC: ${numeral(total_market_cap_usd).format('($ 0.00 a)')}   Vol: ${numeral(total_24h_volume_usd).format('($ 0.00a)')}   Ratio: ${(total_24h_volume_usd/total_market_cap_usd).toFixed(3)}   BTC Dominance: ${bitcoin_percentage_of_market_cap}%`);
  });

  URLS.forEach(url => {
    makeRequest(url, {}, res => {
      const {name, symbol, rank, price_usd, percent_change_24h } = res
      const pc = numeral(percent_change_24h).value();
      const color = pc < 0 ? 'red' : 'green';
      const pc_text = chalk[color](pc + '%');
      const price = chalk[color](`$${price_usd}`);
      const display = `#${rank}\t${name}(${symbol})\t${price}\t${pc_text}`;
      console.log(display)
    });
  });
}


fetchData();
setInterval(fetchData, 30000);
