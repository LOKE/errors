import { Counter, Registry } from "prom-client";

export const counter = new Counter({
  name: "errors_total",
  help: "Count of number times an error is thrown",
  labelNames: ["namespace", "type"],
  registers: [],
});

export const registerMetrics = (register: Registry) => {
  register.registerMetric(counter);
};
