export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: "12K+", label: "Battles Fought" },
  { value: "4.8K", label: "Active Players" },
  { value: "98%", label: "Uptime SLA" },
  { value: "< 80ms", label: "WS Latency" },
];
