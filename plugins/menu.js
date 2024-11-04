const config = require('../config')
const { cmd } = require('../command')

cmd({
    pattern: "menu",
    desc: "Show the available commands.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, quoted }) => {
    try {
        const menuText = `
*🛠️ Available Commands:*

1. .alive - Check if the bot is online.
2. .help - Show help information.
3. .about - Information about the bot.
4. ... (add more commands as needed)
        
*🤖 Enjoy using the bot!*
        `;
        return await conn.sendMessage(from, { text: menuText }, { quoted: mek });
    } catch (e) {
        console.log(e);
        return conn.sendMessage(from, { text: "An error occurred while fetching the menu." }, { quoted: mek });
    }
});
