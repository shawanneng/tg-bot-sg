const axios = require('axios');
const instance = axios.create();
const headers = {
  'content-type': 'application/json',
  'accept-language': 'zh-CN,zh;q=0.9',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
};

Object.entries(headers).forEach(([key, value]) => {
  instance.defaults.headers[key] = value;
});

instance.interceptors.request.use(
  async function (config) {
    const rep = new RegExp(/^http(s)?:\/\/(.*?)\//);
    const [Referer] = rep.exec(config.url);
    config.headers['Referer'] = Referer;

    //获取代理IP
    const { data: getProxy } = await require('axios')({
      url: 'http://cn.lwwangluo.store/cn',
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      },
    }).catch((err) => console.log('正在获取代理IP中'));
    const { host, port } = getProxy || {};

    if (host && port) {
      config.proxy = { host, port };
    }

    return config;
  },
  function (error) {
    return {};
  }
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return {};
  }
);

module.exports = instance;
