import { Loader, Plugin } from 'esbuild';
import { BARE_IMPORT_RE } from "../node/constants";
import { init, parse } from 'es-module-lexer';
import path from 'path';
import resolve from "resolve";
import fs from 'fs-extra';
import createDebug from 'debug';

const debug = createDebug('dev');

export function preBundlePlugin(deps: Set<string>): Plugin {
    return {
        name: "esbuild:pre-pre-bundle",
        setup(build) {
            build.onResolve(
                    {
                        filter: BARE_IMPORT_RE,
                    },
                    (resolveInfo) => {
                        const {path: id, importer} = resolveInfo;
                        console.log(resolveInfo)
                        const isEntry = !importer;
                        if (deps.has(id)) {
                            return isEntry
                                ? {
                                    path: id,
                                    namespace: "dep",
                                }
                                : {
                                    path: resolve.sync(id, {basedir: process.cwd()}),
                                }
                        }
                    }
            );

            build.onLoad(
                {
                    filter: /.*/,
                    namespace: "dep",
                },
                async (loadInfo) => {
                    await init;
                    const id = loadInfo.path;
                    const root = process.cwd();
                    const entryPath = resolve.sync(id, { basedir: root });
                    const code = await fs.readFile(entryPath, "utf-8");
                    const [imports, exports] = parse(code);
                    let proxyModule = [];
                    // commonjs 处理
                    if (!imports.length && !exports.length) {
                        const res = require(entryPath);
                        const specifiers = Object.keys(res);
                        proxyModule.push(
                            `export { ${specifiers.join(",")} } from "${entryPath}"`,
                            `export default require("${entryPath}")`
                        )
                    } else {
                        //　esm处理
                        if (exports.includes("default")) {
                            proxyModule.push(`import d from "${entryPath}"; export default d`);
                        }
                        proxyModule.push(`export * from "${entryPath}"`);
                    }
                    debug("代理模式内容: %o", proxyModule.join('\n'));
                    const loader = path.extname(entryPath).slice(1);
                    return {
                        loader: loader as Loader,
                        contents: proxyModule.join("\n"),
                        resolveDir: root,
                    }
                }
            )
        }
    }
}