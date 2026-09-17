const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8478737437:AAGJYCL0gNf-hGrFD4PBfOe4KzJBYPrl2_Y';
const GROUP_ID = -1004331264988;
const TOPIC_ID = 3; 
const WEB_APP_URL = 'https://Samranjbar19.github.io/baddy-standby/';

const bot = new Telegraf(BOT_TOKEN);

let availableVacancies = [];

// Command to post the button in Topic #3
bot.command('postboard', async (ctx) => {
  await bot.telegram.sendMessage(
    GROUP_ID,
    '🏸 <b>Badminton Social: Standby & Dropouts</b>\n\nTap the button below to cancel your spot or claim an open vacancy:',
    {
      message_thread_id: TOPIC_ID,
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.webApp('🏸 Open Standby Board', WEB_APP_URL)
      ])
    }
  );
});

// Handle data sent from the Mini App
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);

    if (data.action === 'CANCEL_SPOT') {
      availableVacancies.push(data.canceledPlayer);

      await bot.telegram.sendMessage(
        GROUP_ID,
        `🚨 <b>Spot Available!</b>\n<b>${data.canceledPlayer}</b> has cancelled their spot.\nTap the board above to claim it!`,
        { message_thread_id: TOPIC_ID, parse_mode: 'HTML' }
      );
    } 
    else if (data.action === 'JOIN_WAITLIST') {
      let announcement = '';

      if (availableVacancies.length > 0) {
        const replacedPlayer = availableVacancies.shift();
        const handle = data.username ? `@${data.username}` : data.playerName;
        announcement = `🏸 <b>Spot Covered!</b>\n${handle} has taken <b>${replacedPlayer}</b>'s spot!\n⚠️ <i>Please settle payment with the host.</i>`;
      } else {
        const handle = data.username ? `@${data.username}` : data.playerName;
        announcement = `⏳ <b>Waitlist Update:</b>\n${handle} joined the waiting list queue.`;
      }

      await bot.telegram.sendMessage(
        GROUP_ID,
        announcement,
        { message_thread_id: TOPIC_ID, parse_mode: 'HTML' }
      );
    }
  } catch (err) {
    console.error('Error processing web_app_data:', err);
  }
});

bot.launch();
console.log('✅ Bot is running and connected to Test Lab (Topic #3)!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
