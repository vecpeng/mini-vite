import { Plugin } from 'esbuild';
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from '../node/constants';

export function scanPlugin(deps: Set<string>): Plugin {
    return {
        name: "esbuild:scan-deps",
        setup(build) {
            // 忽略的文件类型
            build.onResolve(
                {
                    filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`)
                },
                (resolveInfo) => {
                    const { path: id } = resolveInfo
                    return {
                        path: id,
                        external: true,
                    }
                }
            );
            // 记录依赖
            build.onResolve(
                {
                    // 以数字字母或者@开头，且第二个符号不能为：（Windows盘符如D:)
                    filter: BARE_IMPORT_RE,
                },
                (resolveInfo) => {
                    const { path: id } = resolveInfo;
                    console.log("preBundle", id)
                    deps.add(id);
                    return {
                        path: id,
                        external: true,
                    }
                }
            )
        }
    }
}