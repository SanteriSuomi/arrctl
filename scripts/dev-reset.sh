#!/bin/bash
# Reset dev media/downloads (preserves Radarr config + qBittorrent integration)
docker compose down
rm -rf dev/media dev/downloads
mkdir -p dev/media/movies dev/downloads
docker compose up -d
echo "Media/downloads reset. Radarr config and qBittorrent integration preserved."
echo "Radarr: http://localhost:8502, qBittorrent: http://localhost:8506"
