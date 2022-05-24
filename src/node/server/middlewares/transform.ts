import { NextHandleFunction } from "connect";
import {
    isJSRequest,
    cleanUrl,
    isCSSRequest
} from "../../utils";
import { ServerContext } from "../index";
import createDebug from "debug";

const debug = createDebug("dev");

export async function transformRequest(
    url: string,
    serverContext: ServerContext,
) {
    const { pluginContainer } = serverContext;
    url = cleanUrl(url);

    const resolvedResult = await pluginContainer.resolveId(url);

    let transformResult;
    if (resolvedResult?.id) {
        let code = await pluginContainer.load(resolvedResult.id);
        if (typeof  code === "object" && code != null) {
            code = code.code;
        }
        if (code) {
            transformResult = await pluginContainer.transform(
                code as string,
                resolvedResult?.id
            );
        }
    }
    return transformResult;
}

export function transformMiddleware(
    serverContext: ServerContext
): NextHandleFunction {
    return async (req, res, next) => {
        if (req.method !== "GET" && !req.url) {
            return next();
        }
        const url = req.url ?? "";
        debug("transformMiddleware: %s", url);

        // 处理js和css请求
        if (isJSRequest(url) || isCSSRequest(url)) {
            let result = await transformRequest(url!, serverContext);
            if (!result) {
                return next();
            }
            if (result && typeof result !== "string") {
                // @ts-ignore
                result = result?.code;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/javascript");
            return res.end(result);
        }

        next();
    }
}