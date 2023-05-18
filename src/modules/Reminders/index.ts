import { addModule } from "../index.js";
import { setReminder } from "./setReminder.js";
import { listReminders } from "./listReminders.js";
import { delReminder } from "./delReminder.js";

export const RemindersModule = () => addModule("Reminders", () => {
  setReminder();
  listReminders();
  delReminder();
});
