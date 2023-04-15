import { AvatarModule } from "./Avatar.js";
import { MessageStoreModule } from "./MessageStore.js";
import { ServerNotificationsModule } from "./ServerNotifications.js";
import { ColorModule } from "./utils/Color.js";

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
