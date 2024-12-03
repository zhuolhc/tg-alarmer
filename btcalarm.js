const TELEGRAM_API_URL = 'https://api.telegram.org/bot<替换>/sendMessage';
const CHAT_ID = '<替换>'; // 替换为你的聊天ID
const googleSearchUrl = 'https://www.google.com/search?q=btc%2Fusdt&oq=btc%2Fusdt&gs_lcrp';

// 存储上次检查的价格
let lastPrice = null;

// 获取价格信息
async function getPrice() {
  const response = await fetch(googleSearchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    },
  });
  const text = await response.text();

  // 提取价格
  const regex = /<span class="pclqee">([\d,]+\.\d+)<\/span>/;
  const match = regex.exec(text);

  if (match) {
    const price = parseFloat(match[1].replace(/,/g, '')); // 去掉逗号并转换为浮点数
    return price;
  }
  return null;
}

// 发送 Telegram 消息
async function sendTelegramMessage(message) {
  const response = await fetch(TELEGRAM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
  return response.json();
}

// 检查价格变化并通知
async function checkAndNotifyPrice() {
  const currentPrice = await getPrice();

  if (currentPrice === null) {
    console.error('价格信息未能提取');
    return;
  }

  if (lastPrice !== null && currentPrice !== lastPrice) {
    const direction = currentPrice > lastPrice ? '上涨' : '下跌';
    await sendTelegramMessage(`BTC/USDT 价格 ${direction}: 当前价格为 ${currentPrice} USDT。`);
  }

  lastPrice = currentPrice;
}

// 定时任务逻辑
export default {
  async scheduled(event, env, ctx) {
    await checkAndNotifyPrice();
  },

  // 可选的 fetch 处理逻辑
  async fetch(request) {
    await checkAndNotifyPrice();
    return new Response('价格检查已完成', { status: 200 });
  }
};

