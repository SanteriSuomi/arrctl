import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrSystemBackupRestore extends Command {
	static description = "Restore a backup"

	static examples = ["<%= config.bin %> radarr system backup restore 1"]

	static args = {
		id: Args.integer({
			description: "Backup ID to restore",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrSystemBackupRestore)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.restoreBackup(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ restored: true, id: args.id }, null, 2))
			return
		}

		this.log(`✓ Restore triggered for backup ID: ${args.id}`)
		this.log("  Radarr will restart to complete the restore.")
	}
}
