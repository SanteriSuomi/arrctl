export interface MovieResource {
	id: number
	title: string
	originalTitle?: string
	sortTitle: string
	year: number
	tmdbId: number
	imdbId?: string
	overview?: string
	status: "announced" | "inCinemas" | "released" | "deleted"
	monitored: boolean
	minimumAvailability: "announced" | "inCinemas" | "released"
	hasFile: boolean
	path?: string
	qualityProfileId: number
	rootFolderPath?: string
	added: string
	runtime: number
	sizeOnDisk: number
	ratings?: {
		imdb?: { value: number }
		tmdb?: { value: number }
		rottenTomatoes?: { value: number }
	}
	genres?: string[]
	studio?: string
	tags: number[]
	images?: Array<{ coverType: string; url: string; remoteUrl?: string }>
	inCinemas?: string
	physicalRelease?: string
	digitalRelease?: string
}

export interface RootFolder {
	id: number
	path: string
	accessible: boolean
	freeSpace?: number
}

export interface QualityProfile {
	id: number
	name: string
}

export interface Tag {
	id: number
	label: string
}

export interface AddMovieOptions {
	monitor: "movieOnly" | "movieAndCollection" | "none"
	searchForMovie: boolean
}

export interface AddMoviePayload {
	title: string
	tmdbId: number
	year: number
	qualityProfileId: number
	rootFolderPath: string
	minimumAvailability: "announced" | "inCinemas" | "released"
	monitored: boolean
	tags: number[]
	addOptions: AddMovieOptions
}

export interface DeleteMovieOptions {
	deleteFiles?: boolean
	addImportExclusion?: boolean
}

export interface QueueRecord {
	id: number
	movieId: number
	title: string
	status: string
	trackedDownloadStatus?: string
	trackedDownloadState?: string
	statusMessages?: Array<{ title: string; messages: string[] }>
	errorMessage?: string
	downloadId?: string
	protocol: string
	downloadClient?: string
	indexer?: string
	outputPath?: string
	quality: { quality: { name: string } }
	size: number
	sizeleft: number
	timeleft?: string
	estimatedCompletionTime?: string
	added?: string
}

export interface HistoryRecord {
	id: number
	movieId: number
	sourceTitle: string
	quality: { quality: { name: string } }
	date: string
	eventType:
		| "grabbed"
		| "downloadFolderImported"
		| "downloadFailed"
		| "movieFileDeleted"
		| "movieFileRenamed"
	data: Record<string, string>
}

export interface BlocklistRecord {
	id: number
	movieId: number
	sourceTitle: string
	quality: { quality: { name: string } }
	date: string
	protocol: string
	indexer?: string
	message?: string
}

export interface PaginatedResponse<T> {
	page: number
	pageSize: number
	totalRecords: number
	records: T[]
}
