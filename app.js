const TelegramBot = require('node-telegram-bot-api');
const { token, keyName } = require('./enum');
const express = require('express');
const axios = require('./request');
let texts = '';
const app = express();
let port = 8844;
let router = express.Router();
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (data) => {
  // await bot.sendMessage(chatId, '请直接回复QQ/手机号/微博ID');

  const chatId = data.chat.id;
  const query = Number(data.text);
  texts = query;
  console.log('query:', query);
  let qqPattern = new RegExp(/^[1-9][0-9]{4,9}$/);
  let mobilePattern = new RegExp(
    '^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-9])|(18[0-9])|166|198|199|191|(147))\\d{8}$'
  );

  if (qqPattern.test(query) || mobilePattern.test(query)) {
    const result = await byData(query);
    console.log('result:', result);
    await bot.sendMessage(chatId, result, { parse_mode: 'HTML' });
    return;
  } else {
    await bot.sendMessage(chatId, '<i>请直接回复QQ/手机号/微博ID</i>', {
      parse_mode: 'HTML',
    });
    return;
  }
});

function handlePush(args = {}) {
  let { data } = args;
  return (
    data &&
    Object.entries(data).reduce((item, [key, value]) => {
      if (value?.length > 0) {
        item[keyName[key]] = Array.isArray(value)
          ? value?.join('/')
          : value?.split('|')?.join('/');
      }
      return item;
    }, {})
  );
}

// byData('372561990').then((res) => {
//   console.log('res:', res);
// });
//根据qq得出相关信息
async function byData(data) {
  const pro = [
    {
      url: `https://api.sbqb.xyz/qb.php?mod=cha&qq=${data}`,
    },
    {
      url: `https://api.sbqb.xyz/16eqq.php?mod=cha&qq=${data}`,
    },
    {
      url: `https://library.aiuys.com/api/query?value=${data}`,
    },
    {
      url: `https://api.sbqb.xyz/wb.php?mod=cha&uid=${data}`,
    },
    {
      url: `https://api.sbqb.xyz/qb-fc.php?mod=cha&mobile=${data}`,
    },
  ];

  const allData = await Promise.all(pro.map((item) => axios(item)));
  const result = allData
    .map(({ data }) => handlePush(data))
    .filter(Boolean)
    .reduce((x, y) => {
      return Object.assign(x, y);
    }, {});

  return Object.entries(result).reduce((item, [key, value]) => {
    return `
    ${item} \n
    <strong>
    <i>${key}</i>
    <pre>${value}</pre>
    </strong>
      `;
  }, '');
}

router.get('/gettext', (req, res) => {
  res.send(texts);
});

router.get('/getip', async (req, res) => {
  //获取代理IP
  const { data: getProxy } = await require('axios')({
    url: 'http://cn.lwwangluo.store/cn',
    headers: {
      'user-agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    },
  }).catch((err) => console.log('正在获取代理IP中'));
  res.send(getProxy);
});

// s();
// async function s() {
//   //获取代理IP
//   const { data: getProxy } = await require('axios')({
//     url: 'https://cn.lwwangluo.store/cn',
//     headers: {
//       'user-agent':
//         'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
//     },
//   }).catch((err) => console.log('正在获取代理IP中'));
//   console.log('getProxy:', getProxy);
// }

app.use('/', router);
app.listen(port);

module.exports = app;
