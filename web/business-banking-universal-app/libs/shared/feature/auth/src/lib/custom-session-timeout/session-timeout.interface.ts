import { ActivityMonitorConfig } from '@backbase/identity-auth';

declare interface CountdownCallbacks {
  start: () => void;
  reset: () => void;
  end: () => void;
  tick: (remaining: number) => void;
}

export type Countdown = CountdownCallbacks & ActivityMonitorConfig;

export enum SessionTimeoutTimeFormat {
  Full,
  Minutes,
  Seconds,
}
