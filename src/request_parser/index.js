import { async_inputDataParser as routeParser} from "./_route.js";
import { async_inputDataParser as tableParser} from "./_table.js";
import { async_inputDataParser as matchParser} from "./_match.js";
import { async_inputDataParser as nearestParser} from "./_nearest.js";

import { ParamList } from "./constants.js";

const _parsers = {
    route: routeParser,
    table: tableParser,
    match: matchParser,
    nearest: nearestParser,
}

export async function asyncRequestParser(req, request_type, service_type) {
    return _parsers[service_type](req, ParamList[service_type], request_type)
}
