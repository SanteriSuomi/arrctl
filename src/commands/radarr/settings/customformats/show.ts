import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrCustomformatsShow extends Command {
	static description = "Show custom format details"

	static examples = ["<%= config.bin %> radarr customformats show 1"]

	static args = {
		id: Args.integer({
			description: "Custom format ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrCustomformatsShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const format = await client.getCustomFormat(args.id)

		if (flags.json) {
			this.log(JSON.stringify(format, null, 2))
			return
		}

		this.log(`Custom Format: ${format.name}`)
		this.log("─".repeat(40))
		this.log(`ID:         ${format.id}`)
		this.log(`In Rename:  ${format.includeCustomFormatWhenRenaming ? "Yes" : "No"}`)

		if (format.specifications.length > 0) {
			this.log("\nSpecifications:")
			for (const spec of format.specifications) {
				const flags = []
				if (spec.negate) flags.push("negate")
				if (spec.required) flags.push("required")
				const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : ""
				this.log(`  • ${spec.name}: ${spec.implementationName}${flagStr}`)
			}
		}
	}
}
