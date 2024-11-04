const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    desc: "Show the available commands.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command }) => {
    try {
        const menuMessage = `
        *Available Commands:*

        1. .alive - Check if the bot is online.
        2. .help - Show help information.
        3. .menu - Show this menu.
        4. ... (add more commands as needed)

        ${config.ALIVE_MSG}
        `;
        return await conn.sendMessage(from, { text: menuMessage }, { quoted: mek });
    } catch (e) {
        console.log(e);
        conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: mek });
    }
});
