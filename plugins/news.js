const { cmd } = require('../command');
const Hiru = require('hirunews-scrap');
const Esana = require('@sl-code-lords/esana-news');
const axios = require('axios');
const config = require('../config');

let activeGroups = {}, lastNewsTitles = {};

async function getLatestNews() {
  let news = [];
  try {
    const hiru = new Hiru();
    const hiruNews = await hiru.getLatestNews();
    news.push({ title: hiruNews.title, content: hiruNews.description, date: hiruNews.publishedAt });
  } catch (error) {
    console.error("Error fetching Hiru News: " + error.message);
  }
  try {
    const esana = new Esana();
    const esanaNews = await esana.getLatestNews();
    if (esanaNews && esanaNews.title && esanaNews.description && esanaNews.publishedAt) {
      news.push({ title: esanaNews.title, content: esanaNews.description, date: esanaNews.publishedAt });
    } else {
      console.error("Error: Esana News returned invalid data.");
    }
  } catch (error) {
    console.error("Error fetching Esana News: " + error.message);
  }
  return news;
}

async function checkAndPostNews(bot, groupId) {
  const latestNews = await getLatestNews();
  latestNews.forEach(async (newsItem) => {
    if (!lastNewsTitles[groupId]) lastNewsTitles[groupId] = [];
    if (!lastNewsTitles[groupId].includes(newsItem.title)) {
      await bot.sendMessage(groupId, { text: `📰 *${newsItem.title}*\n${newsItem.content}\n${newsItem.date}\n> *©𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙳𝙴𝙽𝚄𝚆𝙰𝙽-𝙼𝙳*` });
      lastNewsTitles[groupId].push(newsItem.title);
      if (lastNewsTitles[groupId].length > 100) lastNewsTitles[groupId].shift();
    }
  });
}

cmd({ pattern: 'startnews', desc: 'Enable Sri Lankan news updates in this group', isGroup: true, react: '📰', filename: __filename }, async (bot, message, options, { from: groupId, isGroup, participants }) => {
  try {
    if (isGroup) {
      const isAdmin = participants.some(p => p.id === message.sender && p.admin);
      const isOwner = message.sender === bot.user.jid;
      if (isAdmin || isOwner) {
        if (!activeGroups[groupId]) {
          activeGroups[groupId] = true;
          await bot.sendMessage(groupId, { text: "📰 24/7 News Activated." });
          if (!activeGroups.interval) {
            activeGroups.interval = setInterval(async () => {
              for (const id in activeGroups) {
                if (activeGroups[id] && id !== 'interval') await checkAndPostNews(bot, id);
              }
            }, 600000);
          }
        } else {
          await bot.sendMessage(groupId, { text: "📰 24/7 News Already Activated." });
        }
      } else {
        await bot.sendMessage(groupId, { text: "🚫 This command can only be used by group admins or the bot owner." });
      }
    } else {
      await bot.sendMessage(groupId, { text: "This command can only be used in groups." });
    }
  } catch (error) {
    console.error("Error in news command: " + error.message);
    await bot.sendMessage(groupId, { text: "Failed to activate the news service." });
  }
});

cmd({ pattern: 'stopnews', desc: 'Disable Sri Lankan news updates in this group', isGroup: true, react: '🛑', filename: __filename }, async (bot, message, options, { from: groupId, isGroup, participants }) => {
  try {
    if (isGroup) {
      const isAdmin = participants.some(p => p.id === message.sender && p.admin);
      const isOwner = message.sender === bot.user.jid;
      if (isAdmin || isOwner) {
        if (activeGroups[groupId]) {
          delete activeGroups[groupId];
          await bot.sendMessage(groupId, { text: "🛑 24/7 News Deactivated." });
          if (Object.keys(activeGroups).length === 1 && activeGroups.interval) {
            clearInterval(activeGroups.interval);
            delete activeGroups.interval;
          }
        } else {
          await bot.sendMessage(groupId, { text: "🛑 24/7 News is not active in this group." });
        }
      } else {
        await bot.sendMessage(groupId, { text: "🚫 This command can only be used by group admins or the bot owner." });
      }
    } else {
      await bot.sendMessage(groupId, { text: "This command can only be used in groups." });
    }
  } catch (error) {
    console.error("Error in news command: " + error.message);
    await bot.sendMessage(groupId, { text: "Failed to deactivate the news service." });
  }
});
