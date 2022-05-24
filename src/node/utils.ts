import { JS_TYPES_RE, QUERY_RE, HASH_RE } from "./constants";
import path from "path";

export const isJSRequest = (id: string): boolean => {
    id = cleanUrl(id);
    if (JS_TYPES_RE.test(id)) {
        return true;
    }
    if (!path.extname(id) && !id.endsWith("/")) {
        return true;
    }
    return false;
}

export const isCSSRequest = (id: string): boolean => {
    id = cleanUrl(id);
    return id.endsWith(".css");
}

export const cleanUrl = (url: string): string => url.replace(HASH_RE, "").replace(QUERY_RE, "");
