const discord_notify = true;
const myDiscordID = "";
const discordWebhook = "";

const telegram_notify = false;
const myTelegramID = "";
const telegramBotToken = "";

const gameList = [
  {
    title: "バディミッション BOND",
    id: {
      JP: "70010000012243",
      US: "",
    },
    retailPrice: {
      JP: 7128,
      US: 0,
    },
    apiUrl: {
      JP: "https://api.ec.nintendo.com/v1/price?country=JP&lang=ja&ids=70010000012243",
      US: "",
    },
  },
    {
    title: "ファイアーエムブレム無双 風花雪月",
    id: {
      JP: "70010000038434",
      US: "",
    },
    retailPrice: {
      JP: 7128,
      US: 0,
    },
    apiUrl: {
      JP: "https://api.ec.nintendo.com/v1/price?country=JP&lang=ja&ids=70010000038434",
      US: "",
    },
  },
]

const divider = `\n`;

const forexUrl = {
  SGD: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/sgd.json",
};

async function main() {
  var jpyExchangeRate = checkForexRates("jpy");
  var usdExchangeRate = checkForexRates("usd");

  if (jpyExchangeRate !== null && usdExchangeRate !== null) {
    const eshopResponse = checkGamePrice(jpyExchangeRate, usdExchangeRate);

    if (discord_notify && discordWebhook) {
      postDiscordWebhook(eshopResponse);
    }
    if (telegram_notify && telegramBotToken && myTelegramID) {
      postTelegramWebhook(eshopResponse);
    }
  } else {
    Logger.log("Error: Unable to fetch the exchange rates");
  }
}

function checkForexRates(currency) {
  var exchangeRate = null;

  try {
    var response = UrlFetchApp.fetch(forexUrl["SGD"]);
    var responseData = JSON.parse(response.getContentText());
    var currencyExchangeRate = responseData.sgd[currency];
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

  let result = `Daily price check:`;
  result += divider;
  result += "------------------------";
  result += divider;

  for (let i = 0; i < gameList.length; i++) {
    let game = gameList[i];
    result += `${game.title}`

    result += divider;

      if (game.apiUrl.JP != "") {
        // JP eShop price check
        try {
          var response1 = UrlFetchApp.fetch(game.apiUrl.JP);
          var responseData1 = JSON.parse(response1.getContentText());
          var priceDetails = responseData1.prices[0];
          if ('discount_price' in priceDetails) {
            var discountedPrice = parseInt(responseData1.prices[0].discount_price?.raw_value);
            const convertedJPYPrice = convertPrice(discountedPrice, jpyRate);
            if (discountedPrice < game.retailPrice.JP) {
              result += `\nJP Store Sale! Current price: ${discountedPrice} JPY`;
              result += `\nSGD/JPY ${parseFloat(
                jpyRate.toFixed(2)
              )}: ${convertedJPYPrice} SGD`;
            }
          } else {
            var regularPrice = parseInt(responseData1.prices[0].regular_price?.raw_value);
            const convertedJPYPrice = convertPrice(regularPrice, jpyRate);
            result += `\nJP Store No Discount: ${regularPrice} JPY`;
            result += `\nSGD/JPY ${parseFloat(
              jpyRate.toFixed(2)
            )}: ${convertedJPYPrice} SGD`;
          }
        } catch (error) {
          result += `\nError fetching JP eShop data: ${error.message}`;
        }
      }

      result += divider;

      // US eShop price check
      if (game.apiUrl.US != "") {
        try {
          var response2 = UrlFetchApp.fetch(game.apiUrl.US);
          var responseData2 = JSON.parse(response2.getContentText());

          var productUS = responseData2.data.products.find(
            (product) => product.nsuid === game.id.US
          );
          var priceUSD = productUS.prices.minimum.finalPrice;
          const convertedUSDPrice = convertPrice(priceUSD, usdRate);
          if (priceUSD < game.retailPrice.US) {
            result += `\nUS Store Sale! Current price: ${priceUSD} USD`;
            result += `\nSGD/USD ${parseFloat(
              usdRate.toFixed(2)
            )}: ${convertedUSDPrice} SGD`;
          } else {
            result += `\nUS Store No Discount: ${priceUSD} USD`;
            result += `\nSGD/USD ${parseFloat(
              usdRate.toFixed(2)
            )}: ${convertedUSDPrice} SGD`;
          }
        } catch (error) {
          result += `\nError fetching US eShop data: ${error.message}`;
        }
      }

      result += "------------------------";
      result += divider;

  }

  return result;
}

function postDiscordWebhook(data) {
  let payload = JSON.stringify({
    username: "eShop",
    content: data,
  });

  const options = {
    method: "POST",
    contentType: "application/json",
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
    chat_id: myTelegramID,
    text: data,
    parse_mode: "HTML",
  });

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: payload,
    muteHttpExceptions: true,
  };

  try {
    UrlFetchApp.fetch(
      "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage",
      options
    );
  } catch (error) {
    Logger.log(`Error posting webhook: ${error.message}`);
  }
}
