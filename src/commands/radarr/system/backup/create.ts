import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrSystemBackupCreate extends Command {
	static description = "Create a new backup"

	static examples = ["<%= config.bin %> radarr system backup create"]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrSystemBackupCreate)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const result = await client.createBackup()

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
			return
		}

		this.log(`✓ Backup command triggered (Command ID: ${result.id})`)
		this.log("  The backup will be created in the background.")
	}
}
