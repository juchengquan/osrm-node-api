
import cluster from "cluster";
import express from "express";
import * as client from "prom-client";
import { runAppInstance } from "./service/app.js";

process.env.UV_THREADPOOL_SIZE = process.env.LIBUV_THREADS;

const metricsServer = express();
const aggregatorRegistry = new client.AggregatorRegistry();

// cluster.schedulingPolicy = cluster.SCHED_RR; # it becomes default value
if(cluster.isPrimary){
  const cpuCount = Number(process.env.WORKER_THREADS) > 0 ? Number(process.env.WORKER_THREADS) : 2;
  
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  metricsServer.get('/metrics', async (req, res) => {
		try {
			const metrics = await aggregatorRegistry.clusterMetrics();
			res.set('Content-Type', aggregatorRegistry.contentType);
			res.send(metrics);
		} catch (ex) {
			res.statusCode = 500;
			res.send(ex.message);
    }
  });

  metricsServer.listen(process.env.MONITOR_PORT);
	console.log(
		`Cluster metrics server listening to ${process.env.MONITOR_PORT}, exposed on /metrics`,
  );

} else{
  runAppInstance();
}

cluster.on('fork', function(worker) {
    console.log('Start -> Worker %d', worker.id);
});
