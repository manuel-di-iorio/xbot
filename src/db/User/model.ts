import { GuildMember, RoleResolvable, Snowflake } from "discord.js";
import { redis } from "../../lib/redis/index.js";
import { logger } from "../../logger.js";

const getUserPath = (id: Snowflake) => `u:${id}:info`;

const rolesField = 'roles';
const kickTimeField = 'kick-time';

export const UserModel = {
  // Roles
  setRoles: async (id: Snowflake, roles: RoleResolvable[]) => redis.hset(getUserPath(id), rolesField, roles.join(",")),

  unsetRoles: async (id: Snowflake) => redis.hdel(getUserPath(id), rolesField),

  getRoles: async (id: Snowflake) => {
    const roles = await redis.hget(getUserPath(id), rolesField);
    if (roles) {
      return roles.split(',') as RoleResolvable[];
    }
  },

  storeMemberRoles: async (member: GuildMember) => {
    const { id } = member;
    const filteredUserRoles = member.roles.cache.filter(role => role.name !== "@everyone");

    if (filteredUserRoles.size) {
      UserModel.setRoles(id, filteredUserRoles.map(role => role.id) as RoleResolvable[])
        .catch((err: Error) => logger.error(err));
    } else {
      UserModel.unsetRoles(id).catch((err: Error) => logger.error(err));
    }
  },

  // KickTime
  setKickTime: (id: Snowflake, time: string) => redis.hset(getUserPath(id), kickTimeField, time),

  unsetKickTime: (id: Snowflake) => redis.hdel(getUserPath(id), kickTimeField),

  getKickTime: async (id: Snowflake) => {
    const userRedisTime = await redis.hget(getUserPath(id), kickTimeField);
    if (!userRedisTime) return;
    const kickTime = JSON.parse(userRedisTime);
    return process.hrtime(kickTime);
  }
};
