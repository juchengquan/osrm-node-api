const params_valid = [
  "coordinates", 

  "bearings", 
  "radiuses", 
  "generate_hints", // default {false}
  // "hints", // not used yet
  "approaches", // not used yet
  "exclude", 
  // "snapping", // not used yet
  // "skip_waypoints", // not used yet

  "output_format",
]

const param_nearest = params_valid.concat([
  "number",
]);

const params_route = params_valid.concat([
  "alternatives", 
  "steps", 
  "annotations", 
  "geometries", 
  "overview", 
  "continue_straight", 
  "waypoints",
]);

const param_table = params_valid.concat([
  "sources", 
  "destinations",
  "annotations", 
  // "fallback_speed", // not used yet
  // "fallback_coordinate", // not used yet
  // "scale_factor", // not used yet
]);

const param_match = params_valid.concat([
  "steps",  
  "geometries", 
  "annotations",
  "overview", 
  "timestamps",
  // "radiuses", 
  "gaps", 
  // "tidy", // TODO cqju
  // "waypoints", // TODO cqju
]);

export const ParamList = {
  route: params_route,
  table: param_table,
  match: param_match,
  nearest: param_nearest,
}
