import Conf from "conf"

import { RADARR_DEFAULT_URL, SONARR_DEFAULT_URL } from "./constants"
import type { AppConfig, ArrConfig } from "./types"

const config = new Conf<AppConfig>({
	projectName: "arrctl",
	projectSuffix: "",
})

export function getConfig(app: keyof AppConfig): ArrConfig | undefined {
	return config.get(app)
}

export function setConfig(app: keyof AppConfig, value: ArrConfig): void {
	config.set(app, value)
}

export function requireConfig(app: keyof AppConfig): ArrConfig {
	const cfg = getConfig(app)
	if (!cfg) {
		const example = app === "radarr" ? RADARR_DEFAULT_URL : SONARR_DEFAULT_URL
		console.error(`${app.charAt(0).toUpperCase() + app.slice(1)} is not configured. Run:

  arrctl ${app} config set --url <URL> --api-key <API_KEY>

Example:
  arrctl ${app} config set --url ${example} --api-key abc123`)
		return process.exit(1) as never
	}

	return cfg
}
