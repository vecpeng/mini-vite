import resolve from "resolve";
import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import path from "path";
import { pathExists } from "fs-extra";
import { cleanUrl } from "../utils";
import { DEFAULT_EXTENSIONS } from "../constants";

export function resolvePlugin(): Plugin {
    let serverContext: ServerContext;
    // @ts-ignore
    return {
        name: "m-vite:resolve",
        configureServer(s) {
            serverContext = s;
        },
        async resolveId(id: string, importer?: string) {
            console.log("debug resolveId: ", id);
            if (path.isAbsolute(id)) {
                if (await pathExists(id)) {
                    return { id };
                }
                id = path.join(serverContext.root, id);
                if (await  pathExists(id)) {
                    return { id };
                }
            } else if (id.startsWith(".")) {
                if (!importer) {
                    throw new Error("`importer` should not be undefined");
                }
                const hasExtension = path.extname(id).length > 1;
                let resolveId: string;
                if (hasExtension) {
                    resolveId = resolve.sync(id, {
                        basedir: path.dirname(importer),
                    })
                    if (await pathExists(resolveId)) {
                        return { id: resolveId };
                    }
                } else {
                    for (const extname of DEFAULT_EXTENSIONS) {
                        try {
                            const withExtension = `${id}${extname}`;
                            resolveId = resolve.sync(withExtension, {
                                basedir: path.dirname(importer),
                            });
                            if (await pathExists(resolveId)) {
                                return { id: resolveId };
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
                return null;
            }
        }
    }
}