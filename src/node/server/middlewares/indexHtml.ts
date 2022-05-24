import { NextHandleFunction } from "connect";
import { ServerContext } from "../index";
import path from "path";
import { pathExists, readFile } from "fs-extra";

export function indexHtmlMiddleware(
    serverContext: ServerContext
): NextHandleFunction {
    return async (req, res, next) => {
        if (req.url === "/") {
            // 读取html文件，默认在根路径下
            const { root } = serverContext;
            const indexHtmlPath = path.join(root, "index.html");
            if (await pathExists(indexHtmlPath)) {
                const rawHtml = await readFile(indexHtmlPath, "utf8");
                let html = rawHtml;
                // 转换插件
                for (const plugin of serverContext.plugins) {
                    if (plugin.transformIndexHtml) {
                        html = await plugin.transformIndexHtml(html);
                    }
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                return res.end(html);
            }
        }
        return next();
    };
}