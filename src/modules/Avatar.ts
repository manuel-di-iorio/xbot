import { SlashCommandBuilder } from "discord.js";
import { addCmd } from "../lib/discord/registerCmds.js";
import { addModule } from "./index.js";

export const AvatarModule = () => addModule("Avatar", () => {
  const data = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Mostra l'avatar dell'utente")
    .addUserOption((option) => option.setName("user").setDescription("Utente di cui mostrare l'avatar"));

  addCmd({
    data,

    exec: async (interaction) => {
      const user = !interaction.options.data.length ? interaction.user : interaction.options.data[0].user;

      if (!user) {
        await interaction.reply({ ephemeral: true, content: "Utente non trovato" });
        return;
      }

      const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
      await interaction.reply(avatarUrl);
    }
  });
});
