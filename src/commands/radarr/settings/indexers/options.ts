import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsIndexersOptions extends Command {
	static description = "Global indexer options"

	static examples = [
		"<%= config.bin %> radarr settings indexers options --rss-sync-interval 60",
		"<%= config.bin %> radarr settings indexers options --minimum-age 30 --retention 365",
		"<%= config.bin %> radarr settings indexers options --prefer-indexer-flags",
	]

	static flags = {
		"allow-hardcoded-subs": Flags.boolean({
			description: "Allow hardcoded subtitles to be downloaded",
			allowNo: true,
		}),
		"availability-delay": Flags.integer({ description: "Availability delay in days" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		"maximum-size": Flags.integer({ description: "Maximum release size in MB (0 for unlimited)" }),
		"minimum-age": Flags.integer({ description: "Minimum age in minutes (Usenet only)" }),
		"prefer-indexer-flags": Flags.boolean({
			description: "Prioritize releases with indexer flags",
			allowNo: true,
		}),
		retention: Flags.integer({ description: "Retention in days (Usenet only, 0 for unlimited)" }),
		"rss-sync-interval": Flags.integer({
			description: "RSS sync interval in minutes (0 to disable)",
		}),
		"whitelisted-hardcoded-subs": Flags.string({
			description: "Whitelisted hardcoded subtitle tags",
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsIndexersOptions)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getIndexerConfig()

		const hasChanges =
			flags["minimum-age"] !== undefined ||
			flags.retention !== undefined ||
			flags["maximum-size"] !== undefined ||
			flags["rss-sync-interval"] !== undefined ||
			flags["prefer-indexer-flags"] !== undefined ||
			flags["availability-delay"] !== undefined ||
			flags["allow-hardcoded-subs"] !== undefined ||
			flags["whitelisted-hardcoded-subs"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["minimum-age"] !== undefined) updated.minimumAge = flags["minimum-age"]
		if (flags.retention !== undefined) updated.retention = flags.retention
		if (flags["maximum-size"] !== undefined) updated.maximumSize = flags["maximum-size"]
		if (flags["rss-sync-interval"] !== undefined)
			updated.rssSyncInterval = flags["rss-sync-interval"]
		if (flags["prefer-indexer-flags"] !== undefined)
			updated.preferIndexerFlags = flags["prefer-indexer-flags"]
		if (flags["availability-delay"] !== undefined)
			updated.availabilityDelay = flags["availability-delay"]
		if (flags["allow-hardcoded-subs"] !== undefined)
			updated.allowHardcodedSubs = flags["allow-hardcoded-subs"]
		if (flags["whitelisted-hardcoded-subs"] !== undefined) {
			updated.whitelistedHardcodedSubs = flags["whitelisted-hardcoded-subs"]
		}

		const result = await client.updateIndexerConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Indexer options updated")
		}
	}
}
