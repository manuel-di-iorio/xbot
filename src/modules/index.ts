import { ServerNotificationsModule } from "./ServerNotifications.js";

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
