# arrctl

CLI for managing your *arr media stack from the terminal.

## About

arrctl provides full control over Radarr (and soon Sonarr, Prowlarr) without opening a browser. Commands mirror the WebUI structure, so if you know the web interface, you know the CLI.

## Features

- **Complete API coverage** — movies, profiles, download clients, indexers, notifications, and more
- **Familiar structure** — commands mirror WebUI navigation (`settings`, `activity`, `wanted`)
- **JSON output** — pipe to jq, scripts, or other tools with `--json`
- **Bulk operations** — edit or delete multiple movies at once

## Installation

```bash
npm install -g arrctl
```

### Requirements

- Node.js >= 18

## Usage

```bash
# Configure connection
arrctl radarr config set --url http://localhost:7878 --api-key YOUR_API_KEY

# Browse your library
arrctl radarr movies list
arrctl radarr movies list --json | jq '.[] | select(.hasFile == false)'

# Add movies
arrctl radarr movies add "The Matrix" --quality-profile 1 --root-folder /movies
arrctl radarr movies search 123  # trigger search by ID

# Check activity
arrctl radarr activity queue list
arrctl radarr activity queue grab 456  # force grab
arrctl radarr wanted missing

# Manage settings
arrctl radarr settings profiles quality list
arrctl radarr settings downloadclients list
arrctl radarr settings tags add "4k-only"
```

## Command Reference

Commands follow Radarr WebUI structure:

| Topic | Commands |
|-------|----------|
| movies | list, add, delete, search, refresh, rename, bulk |
| calendar | list |
| activity | queue, history, blocklist |
| wanted | missing, cutoff |
| settings | profiles, quality, customformats, downloadclients, indexers, importlists, connect, metadata, tags, general, mediamanagement, ui |
| system | status, tasks, logs, backup |
| api | rootfolders, remotepaths, exclusions, parse |

Run `arrctl radarr --help` for the full list.

## Configuration

Config is stored in:
- Linux/macOS: `~/.config/arrctl/`
- Windows: `%APPDATA%/arrctl/`

## Contributing

### Development Setup

```bash
git clone https://github.com/SanteriSuomi/arrctl.git
cd arrctl
pnpm install
pnpm run build
./bin/run.js radarr --help
```

### Running Tests

```bash
pnpm run test      # unit tests
pnpm run lint      # linting
pnpm run format    # auto-fix formatting
```

### Dev Environment

A Docker-based Radarr + qBittorrent stack is included for testing:

```bash
pnpm dev:up    # start containers
pnpm dev:down  # stop containers
```

## License

MIT
