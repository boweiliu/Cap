# CORS Proxy & Tunnel Setup

## Public URLs

| Tunnel URL | localhost | Service |
|---|---|---|
| `tunnel-proxy-8005.bowei.selfhost.imbue.com` | `:3000` | cap-web (Next.js, Docker) |
| `tunnel-proxy-8007.bowei.selfhost.imbue.com` | `:8003` | cors-proxy → `:9000` (minio) |

## Localhost Ports

| Port | Process | Purpose |
|---|---|---|
| 3000 | Docker (cap-web) | Next.js web app |
| 8003 | Node.js (cors-proxy) | CORS + Host header fix for minio |
| 9000 | Docker (minio) | S3-compatible object storage |
| 9001 | Docker (minio) | Minio admin console |

## Why the CORS proxy exists

Two problems when exposing minio through a tunnel:

1. **CORS**: Browser blocks cross-origin requests from `tunnel-proxy-8005` (web app) to `tunnel-proxy-8007` (minio) without proper CORS headers.
2. **S3 signature verification**: The tunnel rewrites the `Host` header (e.g. to `127.0.0.1:9020`). S3 signed URLs include the host in the signature, so the rewritten host causes `SignatureDoesNotMatch` errors.

The cors-proxy fixes both by injecting CORS response headers and overriding the `Host` header sent to minio to match what cap-web used when signing the URL.

## Docker Compose config

In `docker-compose.yml`, these env vars must match the tunnel URLs:

- `WEB_URL` / `NEXTAUTH_URL` → `https://tunnel-proxy-8005.bowei.selfhost.imbue.com`
- `S3_PUBLIC_ENDPOINT` → `https://tunnel-proxy-8007.bowei.selfhost.imbue.com`
- `MINIO_SERVER_URL` → `https://tunnel-proxy-8007.bowei.selfhost.imbue.com`

## Starting the cors-proxy

```bash
./cors-proxy/start.sh
```

Or manually:

```bash
cd cors-proxy
PORT=8003 TARGET=http://localhost:9000 HOST_OVERRIDE=tunnel-proxy-8007.bowei.selfhost.imbue.com node server.js
```
