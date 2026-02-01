import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrSystemUpdates extends Command {
	static description = "Check for updates or install an update"

	static examples = [
		"<%= config.bin %> radarr system updates",
		"<%= config.bin %> radarr system updates --install",
	]

	static flags = {
		install: Flags.boolean({ description: "Install available update" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrSystemUpdates)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		if (flags.install) {
			const command = await client.installUpdate()
			if (flags.json) {
				this.log(JSON.stringify(command, null, 2))
				return
			}
			this.log(`✓ Update installation triggered (Command ID: ${command.id})`)
			this.log("  Radarr will restart after the update is installed.")
			return
		}

		const updates = await client.getUpdates()

		if (flags.json) {
			this.log(JSON.stringify(updates, null, 2))
			return
		}

		if (updates.length === 0) {
			this.log("No updates available")
			return
		}

		for (const update of updates) {
			const status = update.installed ? "(installed)" : update.installable ? "(available)" : ""
			this.log(`Version ${update.version} ${status}`)
			this.log(`  Branch: ${update.branch}`)
			this.log(`  Released: ${new Date(update.releaseDate).toLocaleDateString()}`)

			if (update.changes && update.changes.length > 0) {
				this.log("  Changes:")
				for (const change of update.changes.slice(0, 3)) {
					this.log(`    - ${change.changes.split("\n")[0]}`)
				}
			}
			this.log("")
		}

		const installable = updates.find((u) => u.installable && !u.installed)
		if (installable) {
			this.log(`Run with --install to install version ${installable.version}`)
		}
	}
}
