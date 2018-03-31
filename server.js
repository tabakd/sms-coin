import express from 'express';
import axios from 'axios';
import twilio from 'twilio';

const app = express();

const parseText = query => {
  const text = query.Body.split(' ');
  const cryptoId = text[1];
  return {
    command: text[0],
    cryptoId: text[1],
    cryptoUrl: `https://api.coinmarketcap.com/v1/ticker/${cryptoId}`,
  };
};

const handlePrice = (data, response) => {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(`
${data.name} (${data.symbol})
Rank ${data.rank}

Price      (USD)  ${data.price_usd}
24H Volume (USD)  ${data['24h_volume_usd']}
Market Cap (USD)  ${data.market_cap_usd}

Change     (1H)   ${data.percent_change_1h}%
Change     (24H)  ${data.percent_change_24h}%
Change     (7D)   ${data.percent_change_7d}%
`);

  response.writeHead(200, { 'Content-Type': 'text/xml' });
  response.end(twiml.toString());
};

const handleError = response => {
  response.writeHead(404);
  response.end();
};

app.get('/', (request, response) => {
  const { command, cryptoId, cryptoUrl } = parseText(request.query);
  if (command === 'price') {
    axios
      .get(cryptoUrl)
      .then(res => {
        handlePrice(res.data[0], response);
      })
      .catch(err => handleError(response));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SMS-COIN: Listening on port ${port}`));
