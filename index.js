const request = require('request-promise');
const chalk = require('chalk');
const numeral = require('numeral');

const URLS = [
  'https://api.coinmarketcap.com/v1/global/',
  'https://api.coinmarketcap.com/v1/ticker/bitcoin/',
  'https://api.coinmarketcap.com/v1/ticker/vechain/',
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

function makeRequest(url) {
  return request(url).then(res => {
    let data = res; 
    try {
      if (url.includes('global')) {
        data = JSON.parse(res);
        const {total_market_cap_usd, total_24h_volume_usd, bitcoin_percentage_of_market_cap} = data;
        data = `MC: ${numeral(total_market_cap_usd).format('($ 0.00 a)')}   Vol: ${numeral(total_24h_volume_usd).format('($ 0.00a)')}   Ratio: ${(total_24h_volume_usd/total_market_cap_usd).toFixed(3)}   BTC Dominance: ${bitcoin_percentage_of_market_cap}%`;

      } else {
        data = eval(data)[0];
        const {name, symbol, rank, price_usd, percent_change_24h } = data;
        const pc = numeral(percent_change_24h).value();
        const color = pc < 0 ? 'red' : 'green';
        const pc_text = chalk[color](pc + '%');
        const price = chalk[color](`$${price_usd}`);
        data = `#${rank}\t${name}(${symbol})\t${price} \t${pc_text}`;
      }
    } catch(e) {
      console.log(e);
    }
    return data;
  }).catch(e => {
      console.log('Error fetching the coin', e);
  });
}

async function fetchData() {
  console.log('\n');
  console.log(formatDate(new Date()));

  for (let url of URLS) {
    const coin = await makeRequest(url)
    console.log(coin)
  }
}


fetchData();
setInterval(fetchData, 60000);
