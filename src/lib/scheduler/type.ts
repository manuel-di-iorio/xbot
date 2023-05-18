export type QueueTask = {
  name: string;
  cron: string;
  exec: () => Promise<void>
}
