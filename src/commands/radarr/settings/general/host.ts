import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralHost extends Command {
	static description = "Host settings (bind address, port, SSL, URL base, instance name)"

	static examples = [
		"<%= config.bin %> radarr settings general host --port 7878",
		"<%= config.bin %> radarr settings general host --instance-name 'My Radarr'",
		"<%= config.bin %> radarr settings general host --enable-ssl --ssl-port 9898",
	]

	static flags = {
		"application-url": Flags.string({ description: "External application URL" }),
		"bind-address": Flags.string({ description: "Bind address (* for all interfaces)" }),
		"enable-ssl": Flags.boolean({ description: "Enable SSL", allowNo: true }),
		"instance-name": Flags.string({ description: "Instance name in tab and syslog" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		port: Flags.integer({ description: "HTTP port number" }),
		"ssl-port": Flags.integer({ description: "HTTPS port number" }),
		"url-base": Flags.string({ description: "URL base for reverse proxy" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralHost)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges =
			flags["bind-address"] !== undefined ||
			flags.port !== undefined ||
			flags["ssl-port"] !== undefined ||
			flags["enable-ssl"] !== undefined ||
			flags["url-base"] !== undefined ||
			flags["instance-name"] !== undefined ||
			flags["application-url"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["bind-address"] !== undefined) updated.bindAddress = flags["bind-address"]
		if (flags.port !== undefined) updated.port = flags.port
		if (flags["ssl-port"] !== undefined) updated.sslPort = flags["ssl-port"]
		if (flags["enable-ssl"] !== undefined) updated.enableSsl = flags["enable-ssl"]
		if (flags["url-base"] !== undefined) updated.urlBase = flags["url-base"]
		if (flags["instance-name"] !== undefined) updated.instanceName = flags["instance-name"]
		if (flags["application-url"] !== undefined) updated.applicationUrl = flags["application-url"]

		const result = await client.updateHostConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Host settings updated (restart may be required)")
		}
	}
}
