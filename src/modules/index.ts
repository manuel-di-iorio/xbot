import { AvatarModule } from "./utils/Avatar.js";
import { MessageStoreModule } from "./MessageStore.js";
import { ServerNotificationsModule } from "./ServerNotifications.js";
import { ColorModule } from "./utils/Color.js";
import { LogoModule } from "./utils/Logo.js";
import { AssignGmiRoleToNewActiveUsersModule } from "./AssignGmiRoleToNewActiveUsers.js";
import { TranscribeVoiceMsgModule } from "./TranscribeVoiceMsg.js";
import { WeatherModule } from "./utils/Weather.js";
import { HoroscopeModule } from "./utils/Horoscope.js";
import { CtxMenuThreadModule } from "./CtxMenuThread.js";
// import { CompeVotesNotifsModule } from "./CompeVotesNotifs.js";
// import { RemindersModule } from "./Reminders/index.js";

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
TranscribeVoiceMsgModule();
WeatherModule();
HoroscopeModule();
CtxMenuThreadModule();
// CompeVotesNotifsModule();
//RemindersModule();
