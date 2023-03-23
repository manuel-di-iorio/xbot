import { EmbedBuilder, Events, TextChannel, User } from "discord.js";
import { GENERAL_CHANNEL, NOTIFICATIONS_CHANNEL } from "../config.js";
import { addEvent } from "../lib/discord/events/index.js";
import { client } from "../lib/discord/index.js";
import { getAvatarTopColor } from "../utils/getAvatarTopColor.js";
import { addModule } from "./index.js";

const broadcast = async (embed: EmbedBuilder) => {
  const generalChannel = client.channels.cache.get(GENERAL_CHANNEL) as TextChannel;
  if (generalChannel) {
    await generalChannel.send({
      embeds: [embed]
    });
  }

  const logLeavingUsersChannel = client.channels.cache.get(NOTIFICATIONS_CHANNEL) as TextChannel;
  if (logLeavingUsersChannel) {
    await logLeavingUsersChannel.send({
      embeds: [embed]
    });
  }
};

const getEmbed = async (user: User, title: string, description?: string) => {
  const avatarUrl = user.displayAvatarURL({ size: 64, extension: 'png', });
  const avatarColor = await getAvatarTopColor(user);

  const embed = new EmbedBuilder()
    .setColor(avatarColor)
    .setThumbnail(avatarUrl)
    .setTitle(title);

  if (description) {
    embed.setDescription(description);
  }

  return embed;
};

export const ServerNotificationsModule = () => addModule("ServerNotifications", () => {
  // Join
  addEvent(Events.GuildMemberAdd, async (member) => {
    const embed = await getEmbed(member.user, `Benvenutə ${member.displayName} su GMI!`);
    await broadcast(embed);
  });

  // Leave
  addEvent(Events.GuildMemberRemove, async (member) => {
    const rolesNames = member.roles.cache
      .filter(role => role.name !== "@everyone")
      .map(role => role.name)
      .join(",");

    const description = rolesNames ? `Ruoli: ${rolesNames}` : undefined;
    const embed = await getEmbed(member.user, `${member.displayName} ha lasciato il server`, description);
    await broadcast(embed);
  });

  // Member update
  addEvent(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.displayName === newMember.displayName && oldMember.user.username === newMember.user.username) return;

    const embed = await getEmbed(
      newMember.user,
      `${oldMember.displayName} ora si chiama ${newMember.displayName}`,
      `Username: @${newMember.user.username}`
    );
    await broadcast(embed);
  });

  // Ban
  addEvent(Events.GuildBanAdd, async ({ user }) => {
    const embed = await getEmbed(user, `${user.username} è stato bannatə dal server`);
    await broadcast(embed);
  });

  // Unban
  addEvent(Events.GuildBanRemove, async ({ user }) => {
    const embed = await getEmbed(user, `Il ban di ${user.username} è stato revocato`);
    await broadcast(embed);
  });
});
