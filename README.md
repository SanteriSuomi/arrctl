arrctl
=================

Unified *arr Stack CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/arrctl.svg)](https://npmjs.org/package/arrctl)
[![Downloads/week](https://img.shields.io/npm/dw/arrctl.svg)](https://npmjs.org/package/arrctl)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g arrctl
$ arrctl COMMAND
running command...
$ arrctl (--version)
arrctl/0.0.0 win32-x64 node-v25.4.0
$ arrctl --help [COMMAND]
USAGE
  $ arrctl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`arrctl hello PERSON`](#arrctl-hello-person)
* [`arrctl hello world`](#arrctl-hello-world)
* [`arrctl help [COMMAND]`](#arrctl-help-command)
* [`arrctl plugins`](#arrctl-plugins)
* [`arrctl plugins add PLUGIN`](#arrctl-plugins-add-plugin)
* [`arrctl plugins:inspect PLUGIN...`](#arrctl-pluginsinspect-plugin)
* [`arrctl plugins install PLUGIN`](#arrctl-plugins-install-plugin)
* [`arrctl plugins link PATH`](#arrctl-plugins-link-path)
* [`arrctl plugins remove [PLUGIN]`](#arrctl-plugins-remove-plugin)
* [`arrctl plugins reset`](#arrctl-plugins-reset)
* [`arrctl plugins uninstall [PLUGIN]`](#arrctl-plugins-uninstall-plugin)
* [`arrctl plugins unlink [PLUGIN]`](#arrctl-plugins-unlink-plugin)
* [`arrctl plugins update`](#arrctl-plugins-update)

## `arrctl hello PERSON`

Say hello

```
USAGE
  $ arrctl hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ arrctl hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/arrctl/arrctl/blob/v0.0.0/src/commands/hello/index.ts)_

## `arrctl hello world`

Say hello world

```
USAGE
  $ arrctl hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ arrctl hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/arrctl/arrctl/blob/v0.0.0/src/commands/hello/world.ts)_

## `arrctl help [COMMAND]`

Display help for arrctl.

```
USAGE
  $ arrctl help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for arrctl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.37/src/commands/help.ts)_

## `arrctl plugins`

List installed plugins.

```
USAGE
  $ arrctl plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ arrctl plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/index.ts)_

## `arrctl plugins add PLUGIN`

Installs a plugin into arrctl.

```
USAGE
  $ arrctl plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into arrctl.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ARRCTL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ARRCTL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ arrctl plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ arrctl plugins add myplugin

  Install a plugin from a github url.

    $ arrctl plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ arrctl plugins add someuser/someplugin
```

## `arrctl plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ arrctl plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ arrctl plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/inspect.ts)_

## `arrctl plugins install PLUGIN`

Installs a plugin into arrctl.

```
USAGE
  $ arrctl plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into arrctl.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ARRCTL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ARRCTL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ arrctl plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ arrctl plugins install myplugin

  Install a plugin from a github url.

    $ arrctl plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ arrctl plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/install.ts)_

## `arrctl plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ arrctl plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ arrctl plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/link.ts)_

## `arrctl plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ arrctl plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ arrctl plugins unlink
  $ arrctl plugins remove

EXAMPLES
  $ arrctl plugins remove myplugin
```

## `arrctl plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ arrctl plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/reset.ts)_

## `arrctl plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ arrctl plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ arrctl plugins unlink
  $ arrctl plugins remove

EXAMPLES
  $ arrctl plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/uninstall.ts)_

## `arrctl plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ arrctl plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ arrctl plugins unlink
  $ arrctl plugins remove

EXAMPLES
  $ arrctl plugins unlink myplugin
```

## `arrctl plugins update`

Update installed plugins.

```
USAGE
  $ arrctl plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.55/src/commands/plugins/update.ts)_
<!-- commandsstop -->
