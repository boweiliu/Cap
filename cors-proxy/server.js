const http = require("http");
const httpProxy = require("http-proxy");

const TARGET = process.env.TARGET || "http://localhost:3000";
const PORT = process.env.PORT || 3001;
const HOST_OVERRIDE = process.env.HOST_OVERRIDE || null;

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: false });

proxy.on("proxyReq", (proxyReq, req) => {
  console.log("Incoming Host:", req.headers.host, "| Setting Host:", HOST_OVERRIDE || req.headers.host);
  if (HOST_OVERRIDE) {
    proxyReq.setHeader("Host", HOST_OVERRIDE);
  }
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  if (!res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway");
  }
});

proxy.on("proxyRes", (proxyRes, req) => {
  const headers = corsHeaders(req);
  for (const [k, v] of Object.entries(headers)) {
    proxyRes.headers[k] = v;
  }
});

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  proxy.web(req, res);
});

function corsHeaders(req) {
  return {
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": req.headers["access-control-request-headers"] || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

server.listen(PORT, () => {
  console.log(`CORS proxy listening on :${PORT} -> ${TARGET} (Host: ${HOST_OVERRIDE || "passthrough"})`);
});
