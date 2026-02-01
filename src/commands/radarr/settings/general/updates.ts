import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralUpdates extends Command {
	static description = "Update settings"

	static examples = [
		"<%= config.bin %> radarr settings general updates --branch develop",
		"<%= config.bin %> radarr settings general updates --automatic",
		"<%= config.bin %> radarr settings general updates --mechanism docker",
	]

	static flags = {
		automatic: Flags.boolean({
			description: "Automatically download and install updates",
			allowNo: true,
		}),
		branch: Flags.string({ description: "Update branch (e.g., master, develop)" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		mechanism: Flags.string({
			description: "Update mechanism",
			options: ["builtIn", "script", "external", "apt", "docker"],
		}),
		"script-path": Flags.string({ description: "Custom update script path" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralUpdates)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges =
			flags.branch !== undefined ||
			flags.automatic !== undefined ||
			flags.mechanism !== undefined ||
			flags["script-path"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags.branch !== undefined) updated.branch = flags.branch
		if (flags.automatic !== undefined) updated.updateAutomatically = flags.automatic
		if (flags.mechanism !== undefined) {
			updated.updateMechanism = flags.mechanism as typeof current.updateMechanism
		}
		if (flags["script-path"] !== undefined) updated.updateScriptPath = flags["script-path"]

		const result = await client.updateHostConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Update settings updated")
		}
	}
}
