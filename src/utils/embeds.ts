import { User, EmbedBuilder, TextChannel } from "discord.js";
import { getAvatarTopColor } from "./getAvatarTopColor.js";
import { NOTIFICATIONS_CHANNEL, GENERAL_CHANNEL } from "../config.js";
import { client } from "../lib/discord/index.js";

export const getEmbed = async (user: User, title: string, description?: string, footer?: string) => {
  const avatarUrl = user.displayAvatarURL({ size: 128, extension: 'png', });
  const avatarColor = await getAvatarTopColor(user);

  const embed = new EmbedBuilder()
    .setColor(avatarColor)
    .setThumbnail(avatarUrl)
    .setTitle(title);

  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });

  return embed;
};

export const notifyEmbed = async (embed: EmbedBuilder) => {
  const logLeavingUsersChannel = client.channels.cache.get(NOTIFICATIONS_CHANNEL) as TextChannel;

  if (logLeavingUsersChannel) {
    await logLeavingUsersChannel.send({
      embeds: [embed]
    });
  }
};

export const broadcastEmbed = async (embed: EmbedBuilder) => {
  const generalChannel = client.channels.cache.get(GENERAL_CHANNEL) as TextChannel;

  if (generalChannel) {
    await generalChannel.send({
      embeds: [embed],
    });
  }

  await notifyEmbed(embed);
};
