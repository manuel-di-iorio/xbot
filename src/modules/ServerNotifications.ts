import { EmbedBuilder, Events, GuildMember } from "discord.js";
import pretty from 'pretty-time';
import { UserModel } from "../db/User.js";
import { addEvent } from "../lib/discord/events/index.js";
import { logger } from "../logger.js";
import { addModule } from "./index.js";
import { broadcastEmbed, getEmbed, notifyEmbed } from "../utils/embeds.js";

export const ServerNotificationsModule = () => addModule("ServerNotifications", () => {
  // Join
  addEvent(Events.GuildMemberAdd, async (member) => {
    const { id, user } = member;

    const [userRoles, userKickTime] = await Promise.all([
      UserModel.getRoles(id),
      UserModel.getKickTime(id)
    ]);

    /** Get the kick time duration */
    let kickDuration: string | null = null;
    if (userKickTime) {
      const kickedUserEndTimeSecs = (userKickTime[0] + userKickTime[1] / Math.pow(10, 9));

      if (kickedUserEndTimeSecs < 10) {
        kickDuration = pretty(userKickTime, 'micro');
      } else if (kickedUserEndTimeSecs < 60) {
        kickDuration = pretty(userKickTime, 'ms');
      } else if (kickedUserEndTimeSecs < 3600) {
        kickDuration = pretty(userKickTime, 's');
      } else if (kickedUserEndTimeSecs < 86400) {
        kickDuration = pretty(userKickTime, 'm');
      } else {
        kickDuration = pretty(userKickTime, 'd');
      }
    }

    // Remove the stored kick time
    UserModel.unsetKickTime(id)
      .catch((err: Error) => logger.error(err));

    let embed: EmbedBuilder;
    if (!userRoles) {
      // If new user, welcome it for the first time
      embed = await getEmbed(user, `Benvenuto/a ${member.displayName} su GMI`);
    } else {
      // Otherwise, welcome it back on the server
      const kickTimeDescription = kickDuration ? `Sei stato/a via ${kickDuration}` : undefined;
      embed = await getEmbed(user, `Bentornato/a ${member.displayName} su GMI`, kickTimeDescription);

      // Add the roles to the user
      member.roles.add(userRoles)
        .catch((err: Error) => logger.error(err));
    }

    await broadcastEmbed(embed);
  });

  // Leave
  addEvent(Events.GuildMemberRemove, async (member) => {
    const rolesNames = member.roles.cache
      .filter(role => role.name !== "@everyone")
      .map(role => role.name)
      .join(", ");

    // Store the kick time
    UserModel.setKickTime(member.id, JSON.stringify(process.hrtime()))
      .catch((err: Error) => logger.error(err));

    // Store the user roles
    UserModel.storeMemberRoles(member as GuildMember);

    const description = rolesNames ? `Ruoli: ${rolesNames}` : undefined;
    const embed = await getEmbed(member.user, `${member.displayName} ha lasciato il server`, description);
    await broadcastEmbed(embed);
  });

  // Member update
  addEvent(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      UserModel.storeMemberRoles(newMember);
    }

    if (oldMember.displayName !== newMember.displayName) {
      const embed = await getEmbed(
        newMember.user,
        `${oldMember.displayName} ora si chiama ${newMember.displayName}`,
        `Username: @${newMember.user.username}`
      );

      await notifyEmbed(embed);
    }
  });

  // Ban
  addEvent(Events.GuildBanAdd, async ({ user }) => {
    const embed = await getEmbed(user, `${user.username} è stato bannato/a dal server`);
    await broadcastEmbed(embed);
  });

  // Unban
  addEvent(Events.GuildBanRemove, async ({ user }) => {
    const embed = await getEmbed(user, `Il ban di ${user.username} è stato revocato`);
    await broadcastEmbed(embed);
  });
});
