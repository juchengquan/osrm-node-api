import * as parser from "./_parsing_functions.js";

export async function async_inputDataParser(req, param_list, request_type) {
  var req_obj = 
    (request_type === "POST") ? req.body : 
      ((request_type === "GET") ? req.query : (() => {throw new Error("Request type is wrong!")}));

  const param_name = Object.keys(req_obj);
  const filtered_element = param_name.filter(val => !param_list.includes(val));
  // if (param_name.some(val => !param_list.includes(val))) {
  if (filtered_element.length != 0) {
    throw {message: `InvalidParameterName :placeholder: Invalid parameter name(s): ${filtered_element}`, };
  };
  if (request_type === "GET") {
    req_obj = parser.addArrayOfArrayParams(req_obj, "coordinates");
    req_obj = parser.addArrayOfArrayParams(req_obj, "bearings");
    req_obj = parser.addArrayOfNumbersOrStringParams(req_obj, "radiuses", request_type);
    req_obj = parser.addBooleanParams(req_obj, "generate_hints");
    req_obj = parser.addArrayOfStringsParams(req_obj, "exclude");
    // req_obj = parser.addBooleanParams(req_obj, "skip_waypoints");

    req_obj = parser.addBooleanParams(req_obj, "steps");
    // geometries -> string
    req_obj = parser.addArrayOfStringsParams(req_obj, "annotations");
    // overview -> string
    req_obj = parser.addArrayOfNumbersParams(req_obj, "timestamps");
    // gaps -> string
    // req_obj = parser.addBooleanParams(req_obj, "tidy");
    // req_obj = parser.addArrayOfNumbersParams(req_obj, "waypoints");
  } else { // POST
    req_obj = parser.addArrayOfNumbersOrStringParams(req_obj, "radiuses", request_type);
  };
  req_obj["tidy"] = true;
  req_obj["snapping"] = "any";

  req_obj = parser.addOutoutFormatParams(req_obj, "output_format", request_type);
  // req_obj["output_format"] = req_obj["output_format"] || "json";
  // if (req_obj["output_format"] !== "json" && req_obj["output_format"] !== "flatbuffers") {
  //   throw {message: "InvalidValue :placeholder: Invalid output format: json or flatbuffers", } 
  // }
  return req_obj
}
