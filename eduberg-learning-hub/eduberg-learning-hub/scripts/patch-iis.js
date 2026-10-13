import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, ".output");

// 1. Patch web.config
const webConfigPath = path.join(outputDir, "web.config");
if (fs.existsSync(webConfigPath)) {
  let content = fs.readFileSync(webConfigPath, "utf8");
  content = content.replace(
    /<iisnode[\s\S]*?\/>/,
    `<iisnode
        nodeProcessCommandLine="node.exe --preserve-symlinks --preserve-symlinks-main"
        watchedFiles="index.js"
        node_env="production"
        debuggingEnabled="false"
        loggingEnabled="true"
        devErrorsEnabled="true"
      />`
  );
  fs.writeFileSync(webConfigPath, content, "utf8");
  console.log("Patched web.config");
}

// 2. Patch index.js
const indexJsPath = path.join(outputDir, "index.js");
if (fs.existsSync(indexJsPath)) {
  fs.writeFileSync(indexJsPath, "import('./server/index.mjs');\n", "utf8");
  console.log("Patched index.js");
}

// 3. Patch server/index.mjs
const serverIndexMjsPath = path.join(outputDir, "server", "index.mjs");
if (fs.existsSync(serverIndexMjsPath)) {
  let content = fs.readFileSync(serverIndexMjsPath, "utf8");
  content = content.replace(
    /var _parsedPort = Number\.parseInt\(process\.env\.NITRO_PORT \?\? process\.env\.PORT \?\? ""\);\s*var port = Number\.isNaN\(_parsedPort\) \? 3e3 : _parsedPort;/,
    `var isPipe = process.env.PORT && (process.env.PORT.startsWith("\\\\") || process.env.PORT.startsWith("/"));
var _parsedPort = !isPipe ? Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "") : NaN;
var port = Number.isNaN(_parsedPort) ? (!isPipe ? 3e3 : void 0) : _parsedPort;`
  );
  content = content.replace(
    /serve\(\{([\s\S]*?)port,/,
    "serve({$1port,\n\tpath: isPipe ? process.env.PORT : void 0,"
  );
  fs.writeFileSync(serverIndexMjsPath, content, "utf8");
  console.log("Patched server/index.mjs");
}

// 4. Patch srvx in _libs
const libsDir = path.join(outputDir, "server", "_libs");
if (fs.existsSync(libsDir)) {
  const files = fs.readdirSync(libsDir);
  const srvxFiles = files.filter((f) => f.includes("srvx"));
  for (const srvxFile of srvxFiles) {
    const srvxPath = path.join(libsDir, srvxFile);
    let content = fs.readFileSync(srvxPath, "utf8");
    content = content.replace(
      /function resolvePortAndHost\(opts\) \{/,
      `function resolvePortAndHost(opts) {
	if (opts.path) return { path: opts.path };
	const _p = opts.port ?? globalThis.process?.env.PORT;
	if (typeof _p === "string" && (_p.startsWith("\\\\") || _p.startsWith("/"))) return { path: _p };`
    );
    content = content.replace(
      /const \{ port, hostname: host \} = resolvePortAndHost\(this\.options\);[\s\S]*?this\.serveOptions = \{[\s\S]*?port,[\s\S]*?host,/,
      `const portOrPath = resolvePortAndHost(this.options);
		this.serveOptions = {
			...portOrPath,`
    );
    content = content.replace(
      /function fmtURL\(host, port, secure\) \{[\s\S]*?if \(!host \|\| !port\) return;/,
      `function fmtURL(host, port, secure) {
	if (!host || !port) return "http://pipe";`
    );
    fs.writeFileSync(srvxPath, content, "utf8");
    console.log("Patched srvx library:", srvxFile);
  }
}

// 5. Copy .env to .output/.env
const envSrc = path.join(rootDir, ".env");
const envDest = path.join(outputDir, ".env");
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("Copied .env to .output/.env");
}
