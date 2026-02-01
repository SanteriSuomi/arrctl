import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsUiDates extends BaseSettingsCommand {
	static description = "Date display settings"

	static examples = [
		"<%= config.bin %> radarr settings ui dates --short-date-format 'MMM D YYYY'",
		"<%= config.bin %> radarr settings ui dates --show-relative-dates",
		"<%= config.bin %> radarr settings ui dates --time-format 'h:mma'",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		"long-date-format": Flags.string({ description: "Long date display format" }),
		"short-date-format": Flags.string({ description: "Short date display format" }),
		"show-relative-dates": Flags.boolean({
			description: "Show relative dates (Today, Yesterday, etc)",
			allowNo: true,
		}),
		"time-format": Flags.string({ description: "Time display format" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsUiDates)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getUiConfig()

		const hasChanges =
			flags["short-date-format"] !== undefined ||
			flags["long-date-format"] !== undefined ||
			flags["time-format"] !== undefined ||
			flags["show-relative-dates"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["short-date-format"] !== undefined)
			updated.shortDateFormat = flags["short-date-format"]
		if (flags["long-date-format"] !== undefined) updated.longDateFormat = flags["long-date-format"]
		if (flags["time-format"] !== undefined) updated.timeFormat = flags["time-format"]
		if (flags["show-relative-dates"] !== undefined)
			updated.showRelativeDates = flags["show-relative-dates"]

		const result = await client.updateUiConfig(updated)

		this.outputResult(result, "✓ Date settings updated", flags.json)
	}
}
