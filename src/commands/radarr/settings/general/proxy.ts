import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralProxy extends BaseSettingsCommand {
	static description = "Proxy settings"

	static examples = [
		"<%= config.bin %> radarr settings general proxy --enabled --type http --hostname proxy.example.com --port 8080",
		"<%= config.bin %> radarr settings general proxy --no-enabled",
		"<%= config.bin %> radarr settings general proxy --bypass-local",
	]

	static flags = {
		"bypass-filter": Flags.string({ description: "Bypass proxy for addresses (comma-separated)" }),
		"bypass-local": Flags.boolean({
			description: "Bypass proxy for local addresses",
			allowNo: true,
		}),
		enabled: Flags.boolean({ description: "Enable proxy", allowNo: true }),
		hostname: Flags.string({ description: "Proxy hostname" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		password: Flags.string({ description: "Proxy password" }),
		port: Flags.integer({ description: "Proxy port" }),
		type: Flags.string({ description: "Proxy type", options: ["http", "socks4", "socks5"] }),
		username: Flags.string({ description: "Proxy username" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralProxy)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges =
			flags.enabled !== undefined ||
			flags.type !== undefined ||
			flags.hostname !== undefined ||
			flags.port !== undefined ||
			flags.username !== undefined ||
			flags.password !== undefined ||
			flags["bypass-filter"] !== undefined ||
			flags["bypass-local"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags.enabled !== undefined) updated.proxyEnabled = flags.enabled
		if (flags.type !== undefined) updated.proxyType = flags.type as typeof current.proxyType
		if (flags.hostname !== undefined) updated.proxyHostname = flags.hostname
		if (flags.port !== undefined) updated.proxyPort = flags.port
		if (flags.username !== undefined) updated.proxyUsername = flags.username
		if (flags.password !== undefined) updated.proxyPassword = flags.password
		if (flags["bypass-filter"] !== undefined) updated.proxyBypassFilter = flags["bypass-filter"]
		if (flags["bypass-local"] !== undefined)
			updated.proxyBypassLocalAddresses = flags["bypass-local"]

		const result = await client.updateHostConfig(updated)

		this.outputResult(result, "✓ Proxy settings updated", flags.json)
	}
}
