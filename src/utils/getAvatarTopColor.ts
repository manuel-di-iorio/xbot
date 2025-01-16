import { ColorResolvable, User } from "discord.js";
import ColorThief from 'colorthief';
import { logger } from "../logger.js";

export const getAvatarTopColor = async (user: User): Promise<ColorResolvable> => {
  try {
    const userAvatarUrl = user.displayAvatarURL({ size: 64, extension: "png" });
    const color = await ColorThief.getColor(userAvatarUrl);
    return ('#' + (0x1000000 + (color[2] | (color[1] << 8) | (color[0] << 16))).toString(16).slice(1)) as ColorResolvable;
  } catch (err) {
    logger.error(err, `[Utils > GetAvatarTopColor]`);
    return "#9B59B6";
  }
};
