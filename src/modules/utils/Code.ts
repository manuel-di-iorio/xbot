import { Events } from "discord.js";
import jsBeautifyPkg from 'js-beautify';
import { addModule } from "../index.js";
import { addEvent } from "../../lib/discord/events/index.js";
import { logger } from "../../logger.js";

const { js: beautify } = jsBeautifyPkg;

const formatOpts: js_beautify.JSBeautifyOptions = {
  indent_size: 2,
  space_in_empty_paren: true,
  brace_style: 'collapse'
};

export const CodeModule = () => addModule("Code", () => {
  addEvent(Events.MessageCreate, async (msg) => {
    const { content } = msg;
    if (!content.startsWith("/code")) return;
    const code = content.replace('/code', '').trim();

    if (!code) {
      await msg.reply("Scrivi il codice da formattare. Esempio: `/code show_message('ciao')`");
      return;
    }

    const { guild } = msg;

    try {
      const result = beautify(code, formatOpts);

      const promises: Array<() => Promise<unknown>> = [() => msg.channel.send(`\`\`\`gml
// Scritto da ${guild ? guild.members.cache.get(msg.author.id)?.displayName : msg.author.username} con /code
${result}
\`\`\`
`)];

      if (guild) {
        promises.push(() => msg.delete());
      }

      await Promise.all(promises.map(fn => fn()));
    } catch (err) {
      logger.error(err);
      await msg.reply(`È avvenuto un errore nella formattazione del codice: ${(err as Error).message}`);
    }
  });
});
