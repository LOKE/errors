const { Counter } = require("prom-client");

const counter = new Counter({
  name: "errors_total",
  help: "Count of number times an error is thrown",
  labelNames: ["namespace", "type"],
  registers: []
});

exports.counter = counter;
exports.registerMetrics = register => {
  register.registerMetric(counter);
};
