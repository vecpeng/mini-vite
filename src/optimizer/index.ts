import path from 'path';
import { build } from "esbuild";
import { scanPlugin } from "./scanPlguin";
import {green} from "picocolors";
import { preBundlePlugin } from './preBundlePlugin'
import {PRE_BUNDLE_DIR} from "../node/constants";

export async function optimize(root: string) {
    /*1.确定入口，这里为了方便直接使用main.tsx作为入口,实际上vite会
    ** 在index.html文件中自动查找入口文件，也可以手动指定入口文件 
    */
    const entry = path.resolve(root, "src/main.tsx");

    // 2. 从入口处扫描依赖,使用自定义的esbuild插件找到需要预构建的依赖
    const deps = new Set<string>();
    await build({
        entryPoints: [entry],
        bundle: true,
        write: false,
        plugins: [scanPlugin((deps))],
    });

    // 打印需要预构建的依赖
    console.log(
        `${green("需要预构建的依赖")}:\n${[...deps]
            .map(green)
            .map((item) => `  ${item}`)
            .join("\n")}`
    );

    // 3. 开始预构建依赖
    await build({
        entryPoints: [...deps],
        write: true,
        bundle: true,
        format: "esm",
        splitting: true,
        outdir: path.resolve(root, PRE_BUNDLE_DIR),
        plugins: [preBundlePlugin(deps)],
    });
}