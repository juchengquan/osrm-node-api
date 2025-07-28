import * as http from "http";
import express from "express";
import logfmt from "logfmt";

import * as serviceMiddleware from "./middleware.js";
import { loadOSRMGraph } from "./osrm.js";
import { mountService } from "./service_mount.js";
import { ServiceList } from "./constants.js";

// http.globalAgent.maxSockets = process.env.MAX_SOCKETS;
http.globalAgent.keepAlive = process.env.KEEPALIVE;


function configureOSRM(app, options) {
  const osrm = loadOSRMGraph(options);
  app.set("osrm", osrm);
}

function configureMiddlewares(app) {
  app.use(serviceMiddleware.helmet);
  app.use(serviceMiddleware.express_json);
  // app.use(express.urlencoded({ extended: false }));
  // app.use(serviceMiddleware.logResponsewithTime);
  // TODO cqju: remove authorization temporarily
  // app.use(serviceMiddleware.keyAuthorization);
  app.use(serviceMiddleware.responsewithTimeLogging);
}

function configureRouters(app) {
  const router = express.Router();

  router.get("/:service_type",async (req, res) => {
    if (ServiceList.includes(req.params.service_type)) {
      mountService("GET", req, res, req.params.service_type)
    } else{
      res.statusText = "Error";
      res.status(400).send({ status: `Service \`${req.params.service_type}\` unavailable.`});
    }
  });

  router.post("/:service_type",async (req, res) => {
    if (ServiceList.includes(req.params.service_type)) {
      mountService("POST", req, res, req.params.service_type)
    } else{
      res.statusText = "Error";
      res.status(400).send({ status: `Service \`${req.params.service_type}\` unavailable.`});
    }
  });

  router.all("/", async (req, res) => {
    res.statusText = "Ok";
    res.status(200).send({status: "Ok"});
  });

  app.use("/", router);
}

function createServer(options) {
  const opts = options || {};
  const app = express();

  configureOSRM(app, opts);
  configureMiddlewares(app);
  configureRouters(app);

  return http.createServer(app);
}

export function runAppInstance() {
  const server = createServer({ osrmDataPath: process.env.OSRM_GRAPH });
  
  server.listen(process.env.SERVICE_PORT, () => {
    logfmt.log({
      "start": "Running server",
      "address": server.address().address,
      "port": server.address().port,
      "osrm-dataset": process.env.OSRM_GRAPH
    });
  });
}
