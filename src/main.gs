const discord_notify = true
const myDiscordID = ""
const discordWebhook = ""

const telegram_notify = false
const myTelegramID = ""
const telegramBotToken = ""

const game = {
  title: "THEATRHYTHM FINAL BAR LINE",
  id: {
    JP: "",
    US: "70070000015204"
  },
  retailPrice: {
    JP: 11880,
    US: 99.99
  },
  apiUrl: {
    JP: 'https://api.ec.nintendo.com/v1/price?country=JP&lang=ja&ids=70070000015202',
    US: 'https://graph.nintendo.com/?operationName=ProductsBySku&variables=%7B%22locale%22%3A%22en_US%22%2C%22personalized%22%3Afalse%2C%22skus%22%3A%5B%227700015204%22%2C%227100056360%22%5D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2238a6ad9c4e61fc840abcaf65021262b6122c52040051acb97f07846d2cd7099c%22%7D%7D',
  }
}

const divider = `\n`

const forexUrl = {
  JPY: 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/sgd/jpy.json',
  USD: 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/sgd/usd.json',
}

async function main() {

  var jpyExchangeRate = checkForexRates('JPY');
  var usdExchangeRate = checkForexRates('USD');
  
  if (jpyExchangeRate !== null && usdExchangeRate !== null) {
    const eshopResponse = checkGamePrice(jpyExchangeRate, usdExchangeRate);

    if(discord_notify && discordWebhook){
      postDiscordWebhook(eshopResponse);
    }
    if (telegram_notify && telegramBotToken && myTelegramID) {
      postTelegramWebhook(eshopResponse);
    }
  } else {
  Logger.log('Error: Unable to fetch the exchange rates');
  }
}

function checkForexRates(currency) {
  var exchangeRate = null;

  try {
    var response = UrlFetchApp.fetch(forexUrl[currency]);
    var responseData = JSON.parse(response.getContentText());
    var currencyExchangeRate = responseData[currency.toLowerCase()];
    exchangeRate = currencyExchangeRate;
  } catch (error) {
    Logger.log(error.message);
  }
  return exchangeRate;
}

function convertPrice(price, exchangeRate) {
  const convertedPrice = price / exchangeRate;
  return parseFloat(convertedPrice.toFixed(2));
}

function checkGamePrice(jpyRate, usdRate) {
  let result = `Daily price check: ${game.title}`;

  result += divider

  // JP eShop price check
  try {
    var response1 = UrlFetchApp.fetch(game.apiUrl.JP);
    var responseData1 = JSON.parse(response1.getContentText());

    var priceJPY = parseInt(responseData1.prices[0].regular_price.raw_value);
    const convertedJPYPrice = convertPrice(priceJPY, jpyRate);
    if (priceJPY < game.retailPrice.JP) {
      result += `\nJP Store Sale! Current price: ${priceJPY} JPY`;
      result += `\nSGD/JPY ${parseFloat(jpyRate.toFixed(2))}: ${convertedJPYPrice} SGD`;
    } else {
      result += `\nJP Store No Discount: ${priceJPY} JPY`;
      result += `\nSGD/JPY ${parseFloat(jpyRate.toFixed(2))}: ${convertedJPYPrice} SGD`;
    }
  }
  catch (error) {
    result += `\nError fetching JP eShop data: ${error.message}`;
  }

  result += divider

  // US eShop price check
    try {
    var response2 = UrlFetchApp.fetch(game.apiUrl.US);
    var responseData2 = JSON.parse(response2.getContentText());

    var productUS = responseData2.data.products.find(product => product.nsuid === game.id.US);
    var priceUSD = productUS.prices.minimum.finalPrice;
    const convertedUSDPrice = convertPrice(priceUSD, usdRate);
    if (priceUSD < game.retailPrice.US) {
      result += `\nUS Store Sale! Current price: ${priceUSD} USD`;
      result += `\nSGD/USD ${parseFloat(usdRate.toFixed(2))}: ${convertedUSDPrice} SGD`;
    } else {
      result += `\nUS Store No Discount: ${priceUSD} USD`;
      result += `\nSGD/USD ${parseFloat(usdRate.toFixed(2))}: ${convertedUSDPrice} SGD`;
    }
  } catch (error) {
    result += `\nError fetching US eShop data: ${error.message}`;
  }

  result += divider

  return result;
}

function postDiscordWebhook(data) {

  let payload = JSON.stringify({
    'username': 'eShop',
    'content': data
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
  };

  try {
    UrlFetchApp.fetch(discordWebhook, options);
  } catch (error) {
    Logger.log(`Error posting webhook: ${error.message}`);
  }
}

function postTelegramWebhook(data) {

  let payload = JSON.stringify({
    'chat_id': myTelegramID,
    'text': data,
    'parse_mode': 'HTML'
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', options);
  } catch (error) {z`
    Logger.log(`Error posting webhook: ${error.message}`);
  }
  
}