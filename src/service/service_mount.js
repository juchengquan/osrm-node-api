import Promise from 'promise';
import {
  histogram_service,
  counter_num_elements,
  counter_num_errors,
  counter_total,
} from "./util/metrics.js";
import { asyncRequestParser } from "../request_parser/index.js";

function asyncOSRMCall(osrm, payload, service_type) {
  return new Promise(function (resolve, reject) {
    try {
      const output_format = payload["output_format"];
      osrm[service_type](payload, { format: "json_buffer", output_format: output_format }, (err, response) => {
        if (err) { // response error
          reject({message: err.message});
        } else {
          // JSON:
          // response = response.toString("utf-8");
          resolve([response, output_format]);
        }
      });
    } catch (err) { // cpp error
      reject({message: err.message});
    }
  });
}

/**
 * Processes and categorizes errors from OSRM operations.
 * Handles C++ errors, Node.js parameter errors, and binding errors.
 * Updates error metrics and returns standardized error responses.
 * 
 * @param {Object} error - The error object to process
 * @param {string} error.message - Error message, may contain ":placeholder:" separator
 * @param {number} [error.http_code] - Optional HTTP status code
 * @returns {Promise<Object>} Standardized error response object
 * @returns {string} returns.error_status - Error type/status
 * @returns {string} returns.message - Error message
 * @returns {number} returns.http_code - HTTP status code (200, 400, or 500)
 */
async function asyncErrorHandling(error, service_type) {
  if (error.http_code == undefined) {
    error.http_code = 500
  }
  if (["TooBig", "NoRoute", "NoTable", "NoSegment", "NoMatch"].some(val => error.message.includes(val))
      ) { // cpp error, but only for JSON output
    const string_splited = error.message.split(" :placeholder: ");
    counter_num_errors.inc({
      error_type: string_splited[0],
      service_type: service_type,
    })

    return {
      error_status: string_splited[0],
      message: string_splited[1],
      http_code: 400, 
    } 
  } else { // nodejs error
    if (["InvalidParameterName", "InvalidValue"].some(val => error.message.includes(val))) { 
      const string_splited = error.message.split(" :placeholder: ");
      counter_num_errors.inc({
        error_type: string_splited[0],
        service_type: service_type,
      })

      return {
        error_status: string_splited[0],
        message: string_splited[1],
        http_code: 400, 
      } 
    } else {
      if (error.message.includes(" :placeholder: ")) {
        const string_splited = error.message.split(" :placeholder: ");
        counter_num_errors.inc({
          error_type: "NodeJSError",
          service_type: service_type,
        })

        return {
          error_status: string_splited[0],
          message: string_splited[1],
          http_code: 500, 
        }
      } else {
        counter_num_errors.inc({
          error_type: "NodeJSBindingError",
          service_type: service_type,
        })

        return {
          error_status: "NodeJSBindingError",
          message: error['message'],
          http_code: 500,
        }
      } 
    }    
  }
}

export function mountService(request_type, req, res, service_type) {
  /**
   * @class
   * @argument req: request body
   * @argument request_type: {"GET", "POST"}
   * @argument res: response 
   * @argument service_type: route, table, match, nearest
   */

  const timer_end = histogram_service.startTimer({
    service_type: service_type,
  });
  counter_total.inc();

  asyncRequestParser(req, request_type, service_type)
    .then(payload => {
      asyncOSRMCall(req.app.get("osrm"), payload, service_type).then(function ([data, output_format]) {

        if (output_format == "flatbuffers") {
          res.setHeader("Content-Type", "application/x-flatbuffers;schema=osrm.engine.api.fbresult");
        }
        else if (output_format == "json") {
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
        } else {
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
        }
        timer_end();

        // TODO: cqju - statusText and coordSize into logging
        res.statusText = "Ok";
        const coords_size = payload["coordinates"].length;
        if (service_type == "table") {
          var num_sources;
          if (payload["sources"] !== undefined && payload["sources"] !== "") {
            num_sources = payload["sources"].length;
          } else {
            num_sources = coords_size;
          }
          
          var num_destinations;
          if (payload["destinations"] !== undefined && payload["destinations"] !== "") {
            num_destinations = payload["destinations"].length;
          } else {
            num_destinations = coords_size;
          }
          res.coordSize = "[" + num_sources + ";" + num_destinations + "]";
          counter_num_elements.observe(
            {service_type: service_type},
            num_sources * num_destinations
          );
        } else {
          res.coordSize = coords_size;
          counter_num_elements.observe(
            {service_type: service_type},
            coords_size
          );
        }

        // return res.json(data); 
        // return res.type("json").send(data);
        return res.send(data);
      }).catch(error => { // nodejs binding error
        asyncErrorHandling(error, service_type).then(function (err) {
          res.statusText = err.error_status
          return res.status(err.http_code).json({
            code: err.error_status,
            message: err.message,
          })
        })
      })
    }).catch(error => { // default error
      asyncErrorHandling(error, service_type).then(function (err) {
        res.statusText = err.error_status
        return res.status(err.http_code).json({
          code: err.error_status,
          message: err.message,
        })
      })
    });
}
