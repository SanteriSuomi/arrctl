import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrConnectShow extends Command {
	static description = "Show notification connection details"

	static examples = ["<%= config.bin %> radarr connect show 1"]

	static args = {
		id: Args.integer({
			description: "Notification ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrConnectShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const notification = await client.getNotification(args.id)

		if (flags.json) {
			this.log(JSON.stringify(notification, null, 2))
			return
		}

		this.log(`Notification: ${notification.name}`)
		this.log("─".repeat(40))
		this.log(`ID:   ${notification.id}`)
		this.log(`Type: ${notification.implementationName}`)

		this.log("\nTriggers:")
		if (notification.onGrab) this.log("  ✓ On Grab")
		if (notification.onDownload) this.log("  ✓ On Download")
		if (notification.onUpgrade) this.log("  ✓ On Upgrade")
		if (notification.onRename) this.log("  ✓ On Rename")
		if (notification.onMovieAdded) this.log("  ✓ On Movie Added")
		if (notification.onMovieDelete) this.log("  ✓ On Movie Delete")
		if (notification.onHealthIssue) this.log("  ✓ On Health Issue")
		if (notification.onApplicationUpdate) this.log("  ✓ On Application Update")

		if (notification.tags.length > 0) {
			this.log(`\nTags: ${notification.tags.join(", ")}`)
		}

		const visibleFields = notification.fields.filter(
			(f) => f.hidden !== "hidden" && f.value !== null,
		)
		if (visibleFields.length > 0) {
			this.log("\nConfiguration:")
			for (const field of visibleFields) {
				const value = field.privacy === "password" ? "********" : String(field.value ?? "")
				this.log(`  ${field.label}: ${value}`)
			}
		}
	}
}
