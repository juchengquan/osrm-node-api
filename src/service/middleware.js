// const bodyParser = require("body-parser");
import helmet from "helmet";
import express from "express";
import logfmt from "logfmt";
import { logger } from "./util/logging.js";

const _helmet = helmet()
export {_helmet as helmet};

export const express_json = express.json();

export function responsewithTimeLogging(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', function () {
    const end = process.hrtime.bigint();
    const duration = (parseFloat(end - start) /1000000).toFixed(3);

    // TODO cqju: add x-request-id
    var request_id = req.header("x-request-id")
    if (request_id === undefined) {
      request_id = "undefined::";
    }
    var trace_id = request_id.split(":")[0];
    if (trace_id === "") {
      trace_id = "undefined"
    }

    const data = logfmt.requestLogger.commonFormatter(req, res);
    const service_type = data.path.split("?")[0];
    // TODO
    if (res.statusCode == 200 && res.statusText == "Ok" ) { // && !["TooBig", "NoRoute", "NoTable", "NoSegment", "NoMatch"].includes(res.response_body.code)) {
      if (service_type.includes("health") || service_type.includes("liveness")) {
        logger.info(
          `method=${data.method},status=${data.status},path=${service_type},trace_id=${trace_id},content_length=${data.content_length},elapsed_time=${duration}ms`
        )
      }
      else {
        logger.info(
          `method=${data.method},status=${data.status},path=${service_type},trace_id=${trace_id},content_length=${data.content_length},elapsed_time=${duration}ms,coordinates_size=${res.coordSize}`
        )
      }
    } else {      
      var params;
      if (data.method == "GET") {
        params = data.path.split("?")[1]
      } else {
        params = JSON.stringify(req.body)
      }
      if (res.statusCode == 200) {
        logger.warn(
          `method=${data.method},status=${data.status},path=${service_type},trace_id=${trace_id},content_length=${data.content_length},elapsed_time=${duration}ms,error=${res.statusText},params='${params}'`
        )
      } else {
        logger.error(
          `method=${data.method},status=${data.status},path=${service_type},trace_id=${trace_id},content_length=${data.content_length},elapsed_time=${duration}ms,error=${res.statusText},params='${params}'`
        )
      }
  }
  })
  next()
}


// const responseTime = (callback) => {
//   if (typeof callback === 'function') {
//       return function (req, res, next) {
//           const start = process.hrtime.bigint();
//           res.on('finish', function () {
//               const end = process.hrtime.bigint();
//               const duration = (parseFloat(end - start) /1000000).toFixed(3);
//               callback(req, res, next, duration)
//           })
//           next()
//       }
//   } else {
//       console.error('express-response-time request a callback function')
//   }
// }

// function logResponsewithTime(req, res, next) {
// 	const oldWrite = res.write;
// 	const oldEnd = res.end;

// 	const chunks = [];
// 	res.write = (...restArgs) => {
// 		chunks.push(Buffer.from(restArgs[0]));
// 		oldWrite.apply(res, restArgs);
// 	};

// 	res.end = (...restArgs) => {
// 		if (restArgs[0]) {
// 			chunks.push(Buffer.from(restArgs[0]));
// 		}
// 		const body = JSON.parse(Buffer.concat(chunks).toString('utf8')); 
// 		res.response_body = body

// 		oldEnd.apply(res, restArgs);
// 	};
// 	next();
// }

// const auth_keys = ["cqju"]

// function keyAuthorization(req, res, next) {
// 	const header = req.header("auth_key");
// 	// console.log(`Auth key: ${header}`);
// 	if (!auth_keys.includes(header)) {
// 			return res.status(401).json({ 
// 			code: "NOT_AUTHORIZED", 
// 			message: "The usage is not authorized. Authentication credentials are missing or invalid.",
// 			})
// 	}
// 	next();
// }
