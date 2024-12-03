const TELEGRAM_API_URL = 'https://api.telegram.org/bot<你的tgbot key>/sendMessage';
const CHAT_ID = '';  // 替换为你的聊天ID
const productUrl = '';  // 目标页面 URL

let lastStock = null; 

// 获取库存信息
async function getStock() {
  const response = await fetch(productUrl);
  const text = await response.text();

  //const regex = /<div class="showPrice" style="color: rgb(46, 189, 133);">(\d+)</div>/;
  //自行修改
  const match = regex.exec(text);

  if (match) {
    const stockNumber = parseInt(match[1]);
    return stockNumber;
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

// 处理库存变化，并在库存有变化时发送 Telegram 消息
async function checkAndNotifyStock() {
  const currentStock = await getStock();

  if (currentStock === null) {
    console.error('库存信息未能提取');
    return;
  }

  if (lastStock !== null && currentStock !== lastStock) {
    // 如果库存有变化，发送 Telegram 消息
    if (currentStock <= 1) {
      await sendTelegramMessage(`商品库存警告: 当前库存为 ${currentStock}。`);
    } else {
      await sendTelegramMessage(`商品库存更新: 当前库存为 ${currentStock}。`);
    }
  }

  // 更新库存历史记录
  lastStock = currentStock;
}

// 处理定时任务
export default {
  async scheduled(event, env, ctx) {
    await checkAndNotifyStock();
  },

  // 可选的 fetch 处理逻辑，通常用来处理来自 HTTP 请求的任务
  async fetch(request) {
    await checkAndNotifyStock();
    return new Response('库存检查已完成', { status: 200 });
  }
};

