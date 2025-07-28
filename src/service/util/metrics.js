import { Histogram, Counter } from 'prom-client';

export const counter_num_elements = new Histogram(
  {
    name: "counter_no_coordinates",
    help: "Counter: number of coordinates in each API call",
    buckets: [0, 1, 2, 5, 10, 50, 100],
    labelNames: ["service_type"],
  }
);

export const histogram_service = new Histogram(
  {
    name: "Histogram",
    help: "Histogram: Latency of API calls",
    buckets: [0.005, 0.010, 0.05, 0.1, 0.5, 1, 5, 10],
    labelNames: ["service_type"],
  }
);

export const counter_num_errors = new Counter(
  {
    name: "counter_error", 
    help: "Counter: error",
    labelNames: ["error_type", "service_type"],
  }
);

// Total number of requests
export const counter_total = new Counter({
  name: 'counter_total',
  help: 'Total number of requests',
});
