# arrctl

Unified CLI for managing your *arr media stack (Radarr, Sonarr, Prowlarr).

## Installation

```bash
npm install -g arrctl
```

## Quick Start

```bash
# Configure your Radarr instance
arrctl radarr config set --url http://localhost:7878 --api-key YOUR_API_KEY

# List movies
arrctl radarr movies list

# Add a movie
arrctl radarr movies add "The Matrix" --quality-profile 1 --root-folder /movies
```

## Commands

Commands mirror Radarr WebUI navigation:

| Topic | Commands |
|-------|----------|
| movies | list, add, delete, search, refresh, rename, bulk edit/delete |
| calendar | list |
| activity | queue (list, grab, remove), history, blocklist (list, remove) |
| wanted | missing, cutoff |
| settings | profiles, quality, customformats, downloadclients, indexers, importlists, connect, metadata, tags, general, mediamanagement, ui |
| system | status, tasks, logs, backup |
| api | rootfolders, remotepaths, exclusions, parse |

Use `arrctl radarr --help` for full command list.

## Configuration

Config stored in `~/.config/arrctl/` (Linux/macOS) or `%APPDATA%/arrctl/` (Windows).

## Development

```bash
pnpm install
pnpm run build
./bin/run.js radarr movies list
```

## License

MIT
