#!/bin/sh
cd "$(dirname "$0")"
PORT=8003 TARGET=http://localhost:9000 HOST_OVERRIDE=tunnel-proxy-8007.bowei.selfhost.imbue.com exec node server.js
