import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { DownloadClientResource } from "../../../../lib/radarr/types"

export default class RadarrDownloadclientsEdit extends Command {
	static description = "Edit a download client"

	static examples = [
		"<%= config.bin %> radarr settings downloadclients edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings downloadclients edit 1 --json-file client.json",
	]

	static args = {
		id: Args.integer({
			description: "Download client ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Download client name" }),
		"json-file": Flags.string({
			description: "Path to JSON file for full replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrDownloadclientsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let downloadClient: DownloadClientResource

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			downloadClient = JSON.parse(content) as DownloadClientResource
			downloadClient.id = args.id
		} else {
			downloadClient = await client.getDownloadClient(args.id)
			if (flags.name) downloadClient.name = flags.name
		}

		const updated = await client.updateDownloadClient(downloadClient)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`Updated download client "${updated.name}" (ID: ${updated.id})`)
	}
}
