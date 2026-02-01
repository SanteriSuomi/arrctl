import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralSecurity extends Command {
	static description = "Security settings (authentication, certificate validation)"

	static examples = [
		"<%= config.bin %> radarr settings general security --authentication-method forms",
		"<%= config.bin %> radarr settings general security --username admin --password secret",
		"<%= config.bin %> radarr settings general security --certificate-validation disabled",
	]

	static flags = {
		"authentication-method": Flags.string({
			description: "Authentication method",
			options: ["none", "basic", "forms", "external"],
		}),
		"authentication-required": Flags.string({
			description: "When authentication is required",
			options: ["enabled", "disabledForLocalAddresses"],
		}),
		"certificate-validation": Flags.string({
			description: "HTTPS certificate validation",
			options: ["enabled", "disabledForLocalAddresses", "disabled"],
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		password: Flags.string({ description: "Admin password" }),
		username: Flags.string({ description: "Admin username" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralSecurity)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges =
			flags["authentication-method"] !== undefined ||
			flags["authentication-required"] !== undefined ||
			flags.username !== undefined ||
			flags.password !== undefined ||
			flags["certificate-validation"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["authentication-method"] !== undefined) {
			updated.authenticationMethod = flags[
				"authentication-method"
			] as typeof current.authenticationMethod
		}
		if (flags["authentication-required"] !== undefined) {
			updated.authenticationRequired = flags[
				"authentication-required"
			] as typeof current.authenticationRequired
		}
		if (flags.username !== undefined) updated.username = flags.username
		if (flags.password !== undefined) updated.password = flags.password
		if (flags["certificate-validation"] !== undefined) {
			updated.certificateValidation = flags[
				"certificate-validation"
			] as typeof current.certificateValidation
		}

		const result = await client.updateHostConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Security settings updated")
		}
	}
}
