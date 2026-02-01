import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRemotepathsList extends Command {
	static description = "List all remote path mappings"

	static examples = [
		"<%= config.bin %> radarr remotepaths list",
		"<%= config.bin %> radarr remotepaths list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrRemotepathsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const mappings = await client.getRemotePathMappings()

		if (flags.json) {
			this.log(JSON.stringify(mappings, null, 2))
			return
		}

		if (mappings.length === 0) {
			this.log("No remote path mappings configured")
			return
		}

		const table = formatTable(mappings, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Host", get: (row) => row.host },
			{ header: "Remote Path", get: (row) => row.remotePath },
			{ header: "Local Path", get: (row) => row.localPath },
		])
		this.log(table)
	}
}
