import path from 'path';

export const PRE_BUNDLE_DIR = path.join("node_modules", ".mini-vite");
export const EXTERNAL_TYPES = [
    "css",
    "less",
    "sass",
    "scss",
    "styl",
    "stylus",
    "pcss",
    "postcss",
    "vue",
    "svelte",
    "marko",
    "astro",
    "png",
    "jpe?g",
    "gif",
    "svg",
    "ico",
    "webp",
    "avif",
];

export const BARE_IMPORT_RE = /^[\w@][^:]/;
export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;
export const QUERY_RE = /\?.*$/s;
export const HASH_RE = /#.*$/s;
export const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".jsx", "js"];