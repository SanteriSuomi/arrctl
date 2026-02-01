import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RadarrClient } from "../../../src/lib/radarr/client.js"

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
})
