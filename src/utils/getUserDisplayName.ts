import { Interaction, Snowflake } from 'discord.js';

/**
 * Get the user display name
 */
export const getUserDisplayName = (interaction: Interaction, user: Snowflake = interaction.user.id) => (
  interaction.guild ? interaction.guild.members.cache.get(user)?.displayName : interaction.user.username
);
