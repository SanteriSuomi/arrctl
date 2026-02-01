import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatSize, formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRootfoldersList extends Command {
	static description = "List all root folders"

	static examples = [
		"<%= config.bin %> radarr rootfolders list",
		"<%= config.bin %> radarr rootfolders list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrRootfoldersList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const folders = await client.getRootFolders()

		if (flags.json) {
			this.log(JSON.stringify(folders, null, 2))
			return
		}

		if (folders.length === 0) {
			this.log("No root folders configured")
			return
		}

		const table = formatTable(folders, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Path", get: (row) => row.path },
			{ header: "Free Space", get: (row) => (row.freeSpace ? formatSize(row.freeSpace) : "-") },
			{ header: "Accessible", get: (row) => (row.accessible ? "✓" : "✗") },
		])
		this.log(table)
	}
}
