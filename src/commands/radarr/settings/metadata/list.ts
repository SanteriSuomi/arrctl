import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrMetadataList extends Command {
	static description = "List all metadata providers"

	static examples = [
		"<%= config.bin %> radarr metadata list",
		"<%= config.bin %> radarr metadata list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrMetadataList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const providers = await client.getMetadataProviders()

		if (flags.json) {
			this.log(JSON.stringify(providers, null, 2))
			return
		}

		if (providers.length === 0) {
			this.log("No metadata providers configured")
			return
		}

		const table = formatTable(providers, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.implementationName },
			{ header: "Enabled", get: (row) => (row.enable ? "✓" : "✗") },
		])
		this.log(table)
	}
}
