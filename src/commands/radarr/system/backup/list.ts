import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatSize, formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrSystemBackupList extends Command {
	static description = "List all backups"

	static examples = [
		"<%= config.bin %> radarr system backup list",
		"<%= config.bin %> radarr system backup list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrSystemBackupList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const backups = await client.getBackups()

		if (flags.json) {
			this.log(JSON.stringify(backups, null, 2))
			return
		}

		if (backups.length === 0) {
			this.log("No backups found")
			return
		}

		const table = formatTable(backups, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.type },
			{ header: "Size", get: (row) => formatSize(row.size) },
			{ header: "Time", get: (row) => new Date(row.time).toLocaleString() },
		])
		this.log(table)
	}
}
