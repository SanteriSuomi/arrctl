import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RadarrClient } from "../../../src/lib/radarr/client"

describe("RadarrClient", () => {
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

	describe("searchMovies", () => {
		it("should search by term", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, title: "Test Movie" }])

			await client.searchMovies("test movie")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/lookup?term=test%20movie",
				expect.objectContaining({
					headers: expect.objectContaining({
						"X-Api-Key": "test-api-key",
					}),
				}),
			)
		})
	})

	describe("lookupByTmdb", () => {
		it("should lookup by TMDB ID", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, tmdbId: 155 })

			await client.lookupByTmdb(155)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/lookup/tmdb?tmdbId=155",
				expect.any(Object),
			)
		})
	})

	describe("lookupByImdb", () => {
		it("should lookup by IMDB ID", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, imdbId: "tt0468569" })

			await client.lookupByImdb("tt0468569")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/lookup/imdb?imdbId=tt0468569",
				expect.any(Object),
			)
		})
	})

	describe("getMovies", () => {
		it("should fetch all movies", async () => {
			const client = new RadarrClient(mockConfig)
			const movies = [
				{ id: 1, title: "Movie 1" },
				{ id: 2, title: "Movie 2" },
			]
			mockFetch(movies)

			const result = await client.getMovies()

			expect(fetch).toHaveBeenCalledWith("http://localhost:7878/api/v3/movie", expect.any(Object))
			expect(result).toEqual(movies)
		})
	})

	describe("addMovie", () => {
		it("should POST movie payload", async () => {
			const client = new RadarrClient(mockConfig)
			const payload = {
				title: "Test",
				tmdbId: 123,
				year: 2024,
				qualityProfileId: 1,
				rootFolderPath: "/movies",
				minimumAvailability: "released" as const,
				monitored: true,
				tags: [],
				addOptions: { monitor: "movieOnly" as const, searchForMovie: true },
			}
			mockFetch({ id: 1, ...payload })

			await client.addMovie(payload)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify(payload),
				}),
			)
		})
	})

	describe("deleteMovie", () => {
		it("should DELETE movie with options", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteMovie(123, { deleteFiles: true, addImportExclusion: true })

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/123?deleteFiles=true&addImportExclusion=true",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("getCalendar", () => {
		it("should fetch calendar with date range", async () => {
			const client = new RadarrClient(mockConfig)
			const start = new Date("2024-01-01")
			const end = new Date("2024-01-07")
			mockFetch([])

			await client.getCalendar(start, end)

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/v3/calendar?"),
				expect.any(Object),
			)
		})
	})

	describe("paginated endpoints", () => {
		it("should fetch queue with pagination", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ page: 1, pageSize: 20, totalRecords: 0, records: [] })

			await client.getQueue(1, 20)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/queue?page=1&pageSize=20",
				expect.any(Object),
			)
		})

		it("should fetch history with pagination", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ page: 1, pageSize: 20, totalRecords: 0, records: [] })

			await client.getHistory(2, 50)

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining("page=2&pageSize=50"),
				expect.any(Object),
			)
		})

		it("should fetch blocklist with pagination", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ page: 1, pageSize: 20, totalRecords: 0, records: [] })

			await client.getBlocklist(1, 20)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/blocklist?page=1&pageSize=20",
				expect.any(Object),
			)
		})

		it("should fetch missing with pagination", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ page: 1, pageSize: 20, totalRecords: 0, records: [] })

			await client.getMissing(1, 20)

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining("/wanted/missing"),
				expect.any(Object),
			)
		})

		it("should fetch cutoff unmet with pagination", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ page: 1, pageSize: 20, totalRecords: 0, records: [] })

			await client.getCutoffUnmet(1, 20)

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining("/wanted/cutoff"),
				expect.any(Object),
			)
		})
	})

	describe("error handling", () => {
		it("should throw on non-ok response", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: false,
				status: 404,
				statusText: "Not Found",
				text: () => Promise.resolve("Movie not found"),
			})

			await expect(client.getMovie(999)).rejects.toThrow("Radarr API error: 404 Not Found")
		})
	})

	describe("system endpoints", () => {
		it("should fetch system status", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ version: "4.0.0", appName: "Radarr" })

			const result = await client.getSystemStatus()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/system/status",
				expect.any(Object),
			)
			expect(result.version).toBe("4.0.0")
		})

		it("should fetch disk space", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ path: "/movies", freeSpace: 1000000 }])

			const result = await client.getDiskSpace()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/diskspace",
				expect.any(Object),
			)
			expect(result[0].path).toBe("/movies")
		})

		it("should fetch health checks", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ source: "IndexerCheck", type: "warning", message: "No indexers" }])

			const result = await client.getHealth()

			expect(fetch).toHaveBeenCalledWith("http://localhost:7878/api/v3/health", expect.any(Object))
			expect(result[0].source).toBe("IndexerCheck")
		})

		it("should fetch scheduled tasks", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, taskName: "RssSync", interval: 60 }])

			const result = await client.getTasks()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/system/task",
				expect.any(Object),
			)
			expect(result[0].taskName).toBe("RssSync")
		})

		it("should run a task", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, name: "RssSync", status: "queued" })

			const result = await client.runTask("RssSync")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/command",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "RssSync" }),
				}),
			)
			expect(result.name).toBe("RssSync")
		})
	})

	describe("tags CRUD", () => {
		it("should add a tag", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, label: "4k" })

			const result = await client.addTag("4k")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/tag",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ label: "4k" }),
				}),
			)
			expect(result.label).toBe("4k")
		})

		it("should update a tag", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, label: "hdr" })

			const result = await client.updateTag({ id: 1, label: "hdr" })

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/tag/1",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify({ id: 1, label: "hdr" }),
				}),
			)
			expect(result.label).toBe("hdr")
		})

		it("should delete a tag", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteTag(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/tag/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("rootfolders CRUD", () => {
		it("should add a root folder", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, path: "/movies", accessible: true })

			const result = await client.addRootFolder("/movies")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/rootfolder",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ path: "/movies" }),
				}),
			)
			expect(result.path).toBe("/movies")
		})

		it("should delete a root folder", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteRootFolder(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/rootfolder/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("quality profiles", () => {
		it("should list quality profiles", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "HD-1080p" }])

			const result = await client.getQualityProfilesFull()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/qualityprofile",
				expect.any(Object),
			)
			expect(result[0].name).toBe("HD-1080p")
		})

		it("should get a quality profile", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, name: "HD-1080p" })

			const result = await client.getQualityProfile(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/qualityprofile/1",
				expect.any(Object),
			)
			expect(result.name).toBe("HD-1080p")
		})

		it("should delete a quality profile", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteQualityProfile(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/qualityprofile/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("delay profiles", () => {
		it("should list delay profiles", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, preferredProtocol: "usenet" }])

			const result = await client.getDelayProfiles()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/delayprofile",
				expect.any(Object),
			)
			expect(result[0].preferredProtocol).toBe("usenet")
		})

		it("should delete a delay profile", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteDelayProfile(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/delayprofile/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("quality definitions", () => {
		it("should list quality definitions", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, title: "HDTV-720p", minSize: 2.0, maxSize: 100.0 }])

			const result = await client.getQualityDefinitions()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/qualitydefinition",
				expect.any(Object),
			)
			expect(result[0].title).toBe("HDTV-720p")
		})

		it("should update a quality definition", async () => {
			const client = new RadarrClient(mockConfig)
			const definition = {
				id: 1,
				quality: { id: 1, name: "HDTV", source: "", resolution: 720, modifier: "" },
				title: "HDTV",
				weight: 1,
				minSize: 3.0,
				maxSize: 100.0,
				preferredSize: 50.0,
			}
			mockFetch(definition)

			const result = await client.updateQualityDefinition(definition)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/qualitydefinition/1",
				expect.objectContaining({ method: "PUT" }),
			)
			expect(result.minSize).toBe(3.0)
		})
	})

	describe("custom formats", () => {
		it("should list custom formats", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "Remux" }])

			const result = await client.getCustomFormats()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/customformat",
				expect.any(Object),
			)
			expect(result[0].name).toBe("Remux")
		})

		it("should get a custom format", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, name: "Remux", specifications: [] })

			const result = await client.getCustomFormat(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/customformat/1",
				expect.any(Object),
			)
			expect(result.name).toBe("Remux")
		})

		it("should delete a custom format", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteCustomFormat(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/customformat/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("indexers", () => {
		it("should list indexers", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "NZBgeek", protocol: "usenet" }])

			const result = await client.getIndexers()

			expect(fetch).toHaveBeenCalledWith("http://localhost:7878/api/v3/indexer", expect.any(Object))
			expect(result[0].name).toBe("NZBgeek")
		})

		it("should delete an indexer", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteIndexer(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/indexer/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("download clients", () => {
		it("should list download clients", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "qBittorrent", protocol: "torrent" }])

			const result = await client.getDownloadClients()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/downloadclient",
				expect.any(Object),
			)
			expect(result[0].name).toBe("qBittorrent")
		})

		it("should delete a download client", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteDownloadClient(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/downloadclient/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("import lists", () => {
		it("should list import lists", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "Trakt Popular", enabled: true }])

			const result = await client.getImportLists()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/importlist",
				expect.any(Object),
			)
			expect(result[0].name).toBe("Trakt Popular")
		})

		it("should delete an import list", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteImportList(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/importlist/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("exclusions", () => {
		it("should list exclusions", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, tmdbId: 12345, movieTitle: "Test Movie", movieYear: 2024 }])

			const result = await client.getExclusions()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/exclusions",
				expect.any(Object),
			)
			expect(result[0].movieTitle).toBe("Test Movie")
		})

		it("should add an exclusion", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, tmdbId: 12345, movieTitle: "Test Movie", movieYear: 2024 })

			const result = await client.addExclusion({
				tmdbId: 12345,
				movieTitle: "Test Movie",
				movieYear: 2024,
			})

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/exclusions",
				expect.objectContaining({ method: "POST" }),
			)
			expect(result.tmdbId).toBe(12345)
		})

		it("should delete an exclusion", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteExclusion(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/exclusions/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("notifications", () => {
		it("should list notifications", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1, name: "Discord", onGrab: true }])

			const result = await client.getNotifications()

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/notification",
				expect.any(Object),
			)
			expect(result[0].name).toBe("Discord")
		})

		it("should delete a notification", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.deleteNotification(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/notification/1",
				expect.objectContaining({ method: "DELETE" }),
			)
		})
	})

	describe("movie actions", () => {
		it("should refresh a movie", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, name: "RefreshMovie", status: "queued" })

			const result = await client.refreshMovie(123)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/command",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "RefreshMovie", movieIds: [123] }),
				}),
			)
			expect(result.name).toBe("RefreshMovie")
		})

		it("should search for a movie", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ id: 1, name: "MoviesSearch", status: "queued" })

			const result = await client.searchMovie(123)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/command",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "MoviesSearch", movieIds: [123] }),
				}),
			)
			expect(result.name).toBe("MoviesSearch")
		})

		it("should get rename preview", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ movieId: 1, movieFileId: 10, existingPath: "/old.mkv", newPath: "/new.mkv" }])

			const result = await client.getRenamePreview(1)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/rename?movieId=1",
				expect.any(Object),
			)
			expect(result[0].existingPath).toBe("/old.mkv")
		})

		it("should parse a release name", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch({ title: "Movie.2024.1080p", parsedMovieInfo: { year: 2024 } })

			const result = await client.parseRelease("Movie.2024.1080p")

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/parse?title=Movie.2024.1080p",
				expect.any(Object),
			)
			expect(result.parsedMovieInfo?.year).toBe(2024)
		})
	})

	describe("bulk operations", () => {
		it("should bulk edit movies", async () => {
			const client = new RadarrClient(mockConfig)
			mockFetch([{ id: 1 }, { id: 2 }])

			const result = await client.bulkEditMovies({ movieIds: [1, 2], monitored: true })

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/editor",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify({ movieIds: [1, 2], monitored: true }),
				}),
			)
			expect(result.length).toBe(2)
		})

		it("should bulk delete movies", async () => {
			const client = new RadarrClient(mockConfig)
			;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				status: 204,
				text: () => Promise.resolve(""),
			})

			await client.bulkDeleteMovies([1, 2, 3], true, false)

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:7878/api/v3/movie/editor",
				expect.objectContaining({
					method: "DELETE",
					body: JSON.stringify({
						movieIds: [1, 2, 3],
						deleteFiles: true,
						addImportExclusion: false,
					}),
				}),
			)
		})
	})
})
