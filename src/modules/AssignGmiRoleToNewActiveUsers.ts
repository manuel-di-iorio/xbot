import { Events, RoleResolvable, Snowflake } from "discord.js";
import { logger } from "../logger.js";
import { addEvent } from "../lib/discord/events/index.js";
import { addModule } from "./index.js";
import { UserModel } from "../db/User.js";
import { GMI_MEMBER_ROLE } from "../config.js";
import { broadcastEmbed, getEmbed } from "../utils/embeds.js";

export const AssignGmiRoleToNewActiveUsersModule = () => addModule("AssignGmiRoleToNewActiveUsers", () => {
  addEvent(Events.MessageCreate, async (msg) => {
    const { author, guild } = msg;
    if (!guild) return;
    const { id: userId } = author;

    // Skip the check if the user already has the GMI role
    const guildMember = guild.members.cache.get(userId);
    if (!guildMember) return;
    if (guildMember.roles.cache.has(GMI_MEMBER_ROLE as Snowflake)) return;

    try {
      const msgCount = parseInt((await UserModel.getMsgCount(userId)) || "0");

      const timeDiff = Date.now() - (guildMember.joinedTimestamp || 0);
      if (timeDiff > 6048e5 /* One week */ && msgCount > 100) {
        // Update the user role
        await guildMember.roles.add(GMI_MEMBER_ROLE);
        const filteredUserRoles = guildMember.roles.cache.filter(role => role.name !== "@everyone");
        await UserModel.setRoles(userId, filteredUserRoles.map(role => role.id) as RoleResolvable[]);

        const embed = await getEmbed(
          guildMember.user,
          `${guildMember.displayName} è attivo da almeno una settimana e ha raggiunto 100 messaggi, guadagnando così il ruolo GMI!`
        );
        await broadcastEmbed(embed);
      }
    } catch (err) {
      logger.error(err);
    }
  });
});
