/**
 * Parses a parameter containing arrays of arrays from GET request.
 * Converts semicolon-separated groups of comma-separated numbers into nested arrays.
 * Example: "1,2;3,4" becomes [[1,2],[3,4]]
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter to parse
 * @param {string} request_type - HTTP request type (only "GET" supported)
 * @returns {Object} Modified request object
 * @throws {Object} Error if request_type is "POST"
 */
function addArrayOfArrayParams(req_obj, param_name, request_type="GET") {
  // Map the GET parameters inplace.
  if (request_type === "POST") {
    throw {message: `InvalidParameterName :placeholder: Request type is wrong: ${request_type}`}
  }
  const param = req_obj[param_name];
  if (param !== undefined && param !== "") {
    req_obj[param_name] = param.split(";").map(x => x.split(",").map(Number));
  }
  return req_obj
}

/**
 * Parses a parameter containing semicolon-separated numbers into an array.
 * Validates that all values are valid numbers.
 * Example: "1;2;3" becomes [1,2,3]
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter to parse
 * @param {string} request_type - HTTP request type (only "GET" supported)
 * @returns {Object} Modified request object
 * @throws {Object} Error if request_type is "POST" or values are invalid
 */
function addArrayOfNumbersParams(req_obj, param_name, request_type="GET") {
  if (request_type === "POST") {
    throw {message: `InvalidParameterName :placeholder: Request type is wrong: ${request_type}`}
  }
  const param = req_obj[param_name];
  if (param !== undefined && param !== "") {
    const _param = param.split(";").map(Number);
    if (Array.isArray(_param) && _param.some(val => isNaN(val))) {
      console.log(`Error: InvalidValue :placeholder: Invalid value ${param_name}`)
      throw {message: `InvalidValue :placeholder: Invalid value ${param_name}`, } 
    }
    req_obj[param_name] = _param
  } 
  return req_obj
}

/**
 * Parses parameters that can be either arrays of numbers or special string formats.
 * Handles "all:value" format by creating an array filled with the value.
 * For GET requests, delegates to addArrayOfNumbersParams for standard parsing.
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter to parse
 * @param {string} request_type - HTTP request type ("GET" or "POST")
 * @returns {Object} Modified request object
 * @throws {Object} Error if value format is invalid
 */
function addArrayOfNumbersOrStringParams(req_obj, param_name, request_type="GET") {
  const param = req_obj[param_name];
  if (param !== undefined && param !== "") {
    const regex = new RegExp('^all:[0-9]+[.]*[0-9]*$') 
    if (typeof(param) === typeof(String()) && regex.test(param)) {
      // For cases in which radius is set as "all:#VAL"
      req_obj[param_name] = Array(req_obj["coordinates"].length).fill(Number(param.slice(4)));
    } else {
      if (request_type === "GET") {
        req_obj = addArrayOfNumbersParams(req_obj, param_name);
      } else if (request_type === "POST" && Array.isArray(param)) {
        // Nothing
      } else {
        throw {message: `InvalidValue :placeholder: Invalid value ${param_name}`, } ;
      }
    }
  } 
  return req_obj
}

/**
 * Parses semicolon-separated strings into an array.
 * Special handling for single boolean string values ("true"/"false").
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter to parse
 * @param {string} request_type - HTTP request type (only "GET" supported)
 * @returns {Object} Modified request object
 * @throws {Object} Error if request_type is "POST"
 */
function addArrayOfStringsParams(req_obj, param_name, request_type="GET") {
  if (request_type === "POST") {
    throw {message: `InvalidParameterName :placeholder: Request type is wrong: ${request_type}`}
  }
  const param = req_obj[param_name];
  if (param !== undefined && param !== "") {
    const _param = param.split(";").map(String);
    if (["true", "false"].some(val => _param.includes(val)) && _param.length === 1) {
      if (_param.includes("true")) {
        req_obj[param_name] = true
      } else {
        req_obj[param_name] = false
      }
    } else {
      req_obj[param_name] = _param
    }
  } 
  return req_obj
}

/**
 * Parses boolean parameters with special handling for specific parameter names.
 * Converts "true"/"false" strings to boolean values.
 * Special cases: "alternatives" converts to number, "continue_straight" handles "null".
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter to parse
 * @param {string} request_type - HTTP request type (only "GET" supported)
 * @returns {Object} Modified request object
 * @throws {Object} Error if request_type is "POST"
 */
function addBooleanParams(req_obj, param_name, request_type="GET") {
  if (request_type === "POST") {
    throw {message: `InvalidParameterName :placeholder: Request type is wrong: ${request_type}`}
  }
  const param = req_obj[param_name];
  if (param !== undefined && param !== "") {
    if (param === "true") {
      req_obj[param_name] = true
    } else if (param === "false") {
      req_obj[param_name] = false
    } else {
      if (param_name === "alternatives") {
        req_obj[param_name] = Number(param)  // for alternatives 
      } else if (param_name === "continue_straight" && param === "null") {
        req_obj[param_name] = null  // for continue_straight 
      } 
    }
  } 
  return req_obj
}

/**
 * Validates and sets the output format parameter.
 * Defaults to "json" if not specified. Only "json" and "flatbuffers" are valid.
 * 
 * @param {Object} req_obj - The request object to modify
 * @param {string} param_name - Name of the parameter (should be "output_format")
 * @param {string} request_type - HTTP request type (unused in current implementation)
 * @returns {Object} Modified request object
 * @throws {Object} Error if output format is invalid
 */

// TODO
// eslint-disable-next-line no-unused-vars
function addOutoutFormatParams(req_obj, param_name, request_type="GET") {
  if (param_name === "output_format") {
    req_obj["output_format"] = req_obj["output_format"] || "json";
    if (req_obj["output_format"] !== "json" && req_obj["output_format"] !== "flatbuffers") {
      throw {message: "InvalidValue :placeholder: Invalid output format: json or flatbuffers", } 
    }
  } 
  // else {
  //   if (request_type === "POST") {
  //     throw {message: `InvalidParameterName :placeholder: Request type is wrong: ${request_type}`}
  //   }
  //   var param = req_obj[param_name];
  //   if (param !== undefined && typeof(param) !== typeof(String())) {
  //     throw {message: `InvalidValue :placeholder: ${request_type} must be string.`}
  //   }
  // }
  return req_obj
}

/**
 * @fileoverview Parameter parsing utilities for OSRM service requests.
 * Contains functions to parse and validate various parameter types from HTTP requests.
 */

export {
  addArrayOfArrayParams,
  addArrayOfNumbersParams,
  addArrayOfNumbersOrStringParams,
  addArrayOfStringsParams,
  addBooleanParams,

  addOutoutFormatParams,
}