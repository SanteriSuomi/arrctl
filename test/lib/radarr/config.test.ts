import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { RadarrClient } from "../../../src/lib/radarr/client"

describe("RadarrClient Config Methods", () => {
	const mockConfig = { url: "http://localhost:7878", apiKey: "test-api-key" }

	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	const mockFetch = (data: unknown, status = 200) => {
		;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
			ok: status >= 200 && status < 300,
			status,
			statusText: status === 200 ? "OK" : "Error",
			json: () => Promise.resolve(data),
			text: () => Promise.resolve(JSON.stringify(data)),
		})
	}

	describe("getNamingConfig", () => {
		it("should fetch naming config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, renameMovies: true })

			await client.getNamingConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/naming",
				expect.any(Object),
			)
		})
	})

	describe("updateNamingConfig", () => {
		it("should PUT naming config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				renameMovies: false,
				replaceIllegalCharacters: true,
				colonReplacementFormat: "smart" as const,
				standardMovieFormat: "{Movie Title}",
				movieFolderFormat: "{Movie Title} ({Release Year})",
			}
			mockFetch(config)

			await client.updateNamingConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/naming/1",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify(config),
				}),
			)
		})
	})

	describe("getMediaManagementConfig", () => {
		it("should fetch media management config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, deleteEmptyFolders: true })

			await client.getMediaManagementConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/mediamanagement",
				expect.any(Object),
			)
		})
	})

	describe("updateMediaManagementConfig", () => {
		it("should PUT media management config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				autoUnmonitorPreviouslyDownloadedMovies: false,
				recycleBin: "/recycle",
				recycleBinCleanupDays: 7,
				downloadPropersAndRepacks: "preferAndUpgrade" as const,
				createEmptyMovieFolders: false,
				deleteEmptyFolders: true,
				fileDate: "none" as const,
				rescanAfterRefresh: "always" as const,
				autoRenameFolders: false,
				setPermissionsLinux: false,
				chmodFolder: "755",
				chownGroup: "",
				skipFreeSpaceCheckWhenImporting: false,
				minimumFreeSpaceWhenImporting: 100,
				copyUsingHardlinks: true,
				useScriptImport: false,
				scriptImportPath: "",
				importExtraFiles: false,
				extraFileExtensions: "srt",
				enableMediaInfo: true,
			}
			mockFetch(config)

			await client.updateMediaManagementConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/mediamanagement/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})

	describe("getHostConfig", () => {
		it("should fetch host config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, port: 7878 })

			await client.getHostConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/host",
				expect.any(Object),
			)
		})
	})

	describe("updateHostConfig", () => {
		it("should PUT host config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				bindAddress: "*",
				port: 7878,
				sslPort: 9898,
				enableSsl: false,
				urlBase: "",
				instanceName: "Radarr",
				applicationUrl: "",
				authenticationMethod: "forms" as const,
				authenticationRequired: "enabled" as const,
				username: "admin",
				password: "password",
				certificateValidation: "enabled" as const,
				proxyEnabled: false,
				proxyType: "http" as const,
				proxyHostname: "",
				proxyPort: 8080,
				proxyUsername: "",
				proxyPassword: "",
				proxyBypassFilter: "",
				proxyBypassLocalAddresses: true,
				logLevel: "info" as const,
				logSizeLimit: 1,
				analyticsEnabled: true,
				branch: "master",
				updateAutomatically: false,
				updateMechanism: "docker" as const,
				updateScriptPath: "",
				backupFolder: "Backups",
				backupInterval: 7,
				backupRetention: 28,
				launchBrowser: false,
				apiKey: "test",
				sslCertPath: "",
				sslCertPassword: "",
				consoleLogLevel: "info",
			}
			mockFetch(config)

			await client.updateHostConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/host/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})

	describe("getIndexerConfig", () => {
		it("should fetch indexer config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, rssSyncInterval: 30 })

			await client.getIndexerConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/indexer",
				expect.any(Object),
			)
		})
	})

	describe("updateIndexerConfig", () => {
		it("should PUT indexer config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				minimumAge: 0,
				retention: 0,
				maximumSize: 0,
				rssSyncInterval: 60,
				preferIndexerFlags: false,
				availabilityDelay: 0,
				allowHardcodedSubs: false,
				whitelistedHardcodedSubs: "",
			}
			mockFetch(config)

			await client.updateIndexerConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/indexer/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})

	describe("getDownloadClientConfig", () => {
		it("should fetch download client config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, enableCompletedDownloadHandling: true })

			await client.getDownloadClientConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/downloadclient",
				expect.any(Object),
			)
		})
	})

	describe("updateDownloadClientConfig", () => {
		it("should PUT download client config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				enableCompletedDownloadHandling: true,
				checkForFinishedDownloadInterval: 1,
				autoRedownloadFailed: true,
				autoRedownloadFailedFromInteractiveSearch: true,
			}
			mockFetch(config)

			await client.updateDownloadClientConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/downloadclient/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})

	describe("getImportListConfig", () => {
		it("should fetch import list config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, listSyncLevel: "disabled" })

			await client.getImportListConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/importlist",
				expect.any(Object),
			)
		})
	})

	describe("updateImportListConfig", () => {
		it("should PUT import list config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				listSyncLevel: "keepAndUnmonitor" as const,
			}
			mockFetch(config)

			await client.updateImportListConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/importlist/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})

	describe("getUiConfig", () => {
		it("should fetch UI config", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, theme: "auto" })

			await client.getUiConfig()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/ui",
				expect.any(Object),
			)
		})
	})

	describe("updateUiConfig", () => {
		it("should PUT UI config", async () => {
			const client = new RadarrClient(mockConfig)
			const config = {
				id: 1,
				firstDayOfWeek: 0,
				calendarWeekColumnHeader: "ddd M/D",
				movieRuntimeFormat: "hoursMinutes" as const,
				shortDateFormat: "MMM D YYYY",
				longDateFormat: "dddd, MMMM D YYYY",
				timeFormat: "h:mma",
				showRelativeDates: true,
				enableColorImpairedMode: false,
				movieInfoLanguage: 1,
				uiLanguage: 1,
				theme: "dark" as const,
			}
			mockFetch(config)

			await client.updateUiConfig(config)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/config/ui/1",
				expect.objectContaining({ method: "PUT" }),
			)
		})
	})
})
