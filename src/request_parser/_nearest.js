import * as parser from "./_parsing_functions.js";

export async function async_inputDataParser(req, param_list, request_type) {
  var req_obj = 
    (request_type === "POST") ? req.body : 
      ((request_type === "GET") ? req.query : (() => {throw new Error("Request type is wrong!")}));
  // if (request_type === "GET") {
  //   req_obj = req.query;
  // } else if (request_type === "POST") { 
  //   req_obj = req.body;
  // }

  const param_name = Object.keys(req_obj)
  const filtered_element = param_name.filter(val => !param_list.includes(val))
  // if (param_name.some(val => !param_list.includes(val))) {
  if (filtered_element.length != 0) {
    throw {message: `InvalidParameterName :placeholder: Invalid parameter name(s): ${filtered_element}`, };
  }

  if (request_type === "GET") {
    req_obj = parser.addArrayOfArrayParams(req_obj, "coordinates");
    req_obj = parser.addArrayOfArrayParams(req_obj, "bearings");
    req_obj = parser.addArrayOfNumbersOrStringParams(req_obj, "radiuses", request_type);
    req_obj = parser.addBooleanParams(req_obj, "generate_hints");
    req_obj = parser.addArrayOfStringsParams(req_obj, "exclude");
    // req_obj = parser.addBooleanParams(req_obj, "skip_waypoints");
  } else {
    req_obj = parser.addArrayOfNumbersOrStringParams(req_obj, "radiuses", request_type);
  }
  req_obj = parser.addOutoutFormatParams(req_obj, "output_format", request_type);

  return req_obj;
}
