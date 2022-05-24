import { init, parse } from "es-module-lexer";
import {
    BARE_IMPORT_RE,
    DEFAULT_EXTENSIONS,
    PRE_BUNDLE_DIR,
} from "../constants";
import {
    cleanUrl,
    isJSRequest,
} from "../utils";
import MagicString from "magic-string";
import path from "path";
import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import { pathExists } from "fs-extra";
import resolve from "resolve";

export function importAnalysisPlugin(): Plugin {
    let serverContext: ServerContext;
    return {
        name: "mini-vite:import-analysis",
        configureServer(s) {
            serverContext = s;
        },
        async transform(code: string, id: string) {
            if (!isJSRequest(id)) {
                return null;
            }
            await init;
            const [imports] = parse(code);
            const ms = new MagicString(code);
            const resolve = async (id: string, importer?: string) => {
                const resolved = await serverContext.pluginContainer.resolveId(
                    id,
                    importer
                );
                return resolved?.id;
            };
            for (const importInfo of imports) {
                const { s: modStart, e: modEnd, n: modSource } = importInfo;
                if (!modSource) continue;
                if (BARE_IMPORT_RE.test(modSource)) {
                    const bundlePath = path.join(
                        serverContext.root,
                        PRE_BUNDLE_DIR,
                        `${modSource}.js`
                    );
                    ms.overwrite(modStart, modEnd, bundlePath);
                } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
                    const resolved = await resolve(modSource, id);
                    if (resolved) {
                        ms.overwrite(modStart, modEnd, resolved);
                    }
                }
            }

            return {
                code: ms.toString(),
                map: ms.generateMap(),
            };
        }
    }
}