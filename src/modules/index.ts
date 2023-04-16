import { AvatarModule } from "./utils/Avatar.js";
import { MessageStoreModule } from "./MessageStore.js";
import { ServerNotificationsModule } from "./ServerNotifications.js";
import { ColorModule } from "./utils/Color.js";
import { LogoModule } from "./utils/Logo.js";
import { AssignGmiRoleToNewActiveUsersModule } from "./AssignGmiRoleToNewActiveUsers.js";

export const modules: {
  [key: string]: {
    disabled: boolean,
    setup: () => void
  }
} = {};

export const addModule = (name: string, cb: () => void) => {
  modules[name] = {
    disabled: false,
    setup: cb
  };
};

ServerNotificationsModule();
MessageStoreModule();
AvatarModule();
ColorModule();
LogoModule();
AssignGmiRoleToNewActiveUsersModule();
