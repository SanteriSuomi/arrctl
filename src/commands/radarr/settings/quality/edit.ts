import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrQualityDefinitionsEdit extends Command {
	static description = "Edit a quality definition's size limits"

	static examples = [
		"<%= config.bin %> radarr quality-definitions edit 1 --min 2.0 --max 100.0",
		"<%= config.bin %> radarr quality-definitions edit 3 --preferred 50.0",
	]

	static args = {
		id: Args.integer({
			description: "Quality definition ID",
			required: true,
		}),
	}

	static flags = {
		min: Flags.string({ description: "Minimum size in MB per minute" }),
		max: Flags.string({ description: "Maximum size in MB per minute (0 for unlimited)" }),
		preferred: Flags.string({ description: "Preferred size in MB per minute" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrQualityDefinitionsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const definitions = await client.getQualityDefinitions()
		const definition = definitions.find((d) => d.id === args.id)

		if (!definition) {
			this.error(`Quality definition ${args.id} not found`)
		}

		if (flags.min !== undefined) definition.minSize = Number.parseFloat(flags.min)
		if (flags.max !== undefined) definition.maxSize = Number.parseFloat(flags.max)
		if (flags.preferred !== undefined) definition.preferredSize = Number.parseFloat(flags.preferred)

		const updated = await client.updateQualityDefinition(definition)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`✓ Updated quality definition: ${updated.quality.name}`)
		this.log(`  Min: ${updated.minSize.toFixed(1)} MB/min`)
		this.log(`  Max: ${!updated.maxSize ? "unlimited" : `${updated.maxSize.toFixed(1)} MB/min`}`)
		this.log(`  Preferred: ${(updated.preferredSize ?? 0).toFixed(1)} MB/min`)
	}
}
