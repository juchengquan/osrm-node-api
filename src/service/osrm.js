import OSRM from "osrm";

export function loadOSRMGraph(options) {
  const opts = {
    algorithm: (process.env.OSRM_ALGORITHM !== undefined) ? process.env.OSRM_ALGORITHM : "CH",

    path: options.osrmDataPath,
    
    shared_memory: (process.env.SHARED_MEMORY === "true"),  
    dataset_name: process.env.DATASET_NAME,

    max_locations_trip: Number(process.env.MAX_LOCATIONS_TRIP) || -1,
    max_locations_viaroute: Number(process.env.MAX_LOCATIONS_VIAROUTE) || -1,
    max_locations_distance_table: Number(process.env.MAX_LOCATIONS_DISTANCE_TABLE) || -1,
    max_locations_map_matching: Number(process.env.MAX_LOCATIONS_MAP_MATCHING) || -1,
    max_results_nearest: Number(process.env.MAX_RESULTS_NEAREST) || -1,
    max_alternatives: Number(process.env.MAX_ALTERNATIVES) || -1,
    max_radius_map_matching: Number(process.env.MAX_RADIUS_MAP_MATCHING) || -1, 

    // max_locations_trip: 0,
    // max_locations_viaroute: 0,
    // max_locations_distance_table: 0,
    // max_locations_map_matching: 0,
    // max_results_nearest: 0,
    // max_alternatives: 1,
  };
  return new OSRM(opts);
}
