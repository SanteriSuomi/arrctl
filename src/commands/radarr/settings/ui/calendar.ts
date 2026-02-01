import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsUiCalendar extends BaseSettingsCommand {
	static description = "Calendar UI settings"

	static examples = [
		"<%= config.bin %> radarr settings ui calendar --first-day-of-week 1",
		"<%= config.bin %> radarr settings ui calendar --week-column-header 'ddd M/D'",
	]

	static flags = {
		"first-day-of-week": Flags.integer({ description: "First day of week (0=Sunday, 1=Monday)" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		"week-column-header": Flags.string({ description: "Week column header format" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsUiCalendar)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getUiConfig()

		const hasChanges =
			flags["first-day-of-week"] !== undefined || flags["week-column-header"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["first-day-of-week"] !== undefined) {
			updated.firstDayOfWeek = flags["first-day-of-week"]
		}
		if (flags["week-column-header"] !== undefined) {
			updated.calendarWeekColumnHeader = flags["week-column-header"]
		}

		const result = await client.updateUiConfig(updated)

		this.outputResult(result, "✓ Calendar settings updated", flags.json)
	}
}
