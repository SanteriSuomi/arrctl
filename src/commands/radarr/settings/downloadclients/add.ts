import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { DownloadClientResource } from "../../../../lib/radarr/types"

export default class RadarrDownloadclientsAdd extends Command {
	static description = "Add a new download client from JSON"

	static examples = [
		"<%= config.bin %> radarr settings downloadclients add --json-file client.json",
		"<%= config.bin %> radarr settings downloadclients show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing download client configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrDownloadclientsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as DownloadClientResource

		const { id: _, ...clientData } = input

		const downloadClient = await client.addDownloadClient(clientData)

		if (flags.json) {
			this.log(JSON.stringify(downloadClient, null, 2))
			return
		}

		this.log(`Created download client "${downloadClient.name}" (ID: ${downloadClient.id})`)
	}
}
