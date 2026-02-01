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

// Config types

export interface NamingConfig {
	id: number
	renameMovies: boolean
	replaceIllegalCharacters: boolean
	colonReplacementFormat: "delete" | "dash" | "spaceDash" | "spaceDashSpace" | "smart"
	standardMovieFormat: string
	movieFolderFormat: string
}

export interface MediaManagementConfig {
	id: number
	autoUnmonitorPreviouslyDownloadedMovies: boolean
	recycleBin: string
	recycleBinCleanupDays: number
	downloadPropersAndRepacks: "preferAndUpgrade" | "doNotUpgrade" | "doNotPrefer"
	createEmptyMovieFolders: boolean
	deleteEmptyFolders: boolean
	fileDate: "none" | "cinemas" | "release"
	rescanAfterRefresh: "always" | "afterManual" | "never"
	autoRenameFolders: boolean
	setPermissionsLinux: boolean
	chmodFolder: string
	chownGroup: string
	skipFreeSpaceCheckWhenImporting: boolean
	minimumFreeSpaceWhenImporting: number
	copyUsingHardlinks: boolean
	useScriptImport: boolean
	scriptImportPath: string
	importExtraFiles: boolean
	extraFileExtensions: string
	enableMediaInfo: boolean
}

export interface HostConfig {
	id: number
	bindAddress: string
	port: number
	sslPort: number
	enableSsl: boolean
	urlBase: string
	instanceName: string
	applicationUrl: string
	authenticationMethod: "none" | "basic" | "forms" | "external"
	authenticationRequired: "enabled" | "disabledForLocalAddresses"
	username: string
	password: string
	certificateValidation: "enabled" | "disabledForLocalAddresses" | "disabled"
	proxyEnabled: boolean
	proxyType: "http" | "socks4" | "socks5"
	proxyHostname: string
	proxyPort: number
	proxyUsername: string
	proxyPassword: string
	proxyBypassFilter: string
	proxyBypassLocalAddresses: boolean
	logLevel: "info" | "debug" | "trace"
	logSizeLimit: number
	analyticsEnabled: boolean
	branch: string
	updateAutomatically: boolean
	updateMechanism: "builtIn" | "script" | "external" | "apt" | "docker"
	updateScriptPath: string
	backupFolder: string
	backupInterval: number
	backupRetention: number
	launchBrowser: boolean
	apiKey: string
	sslCertPath: string
	sslCertPassword: string
	consoleLogLevel: string
}

export interface IndexerConfig {
	id: number
	minimumAge: number
	retention: number
	maximumSize: number
	rssSyncInterval: number
	preferIndexerFlags: boolean
	availabilityDelay: number
	allowHardcodedSubs: boolean
	whitelistedHardcodedSubs: string
}

export interface DownloadClientConfig {
	id: number
	enableCompletedDownloadHandling: boolean
	checkForFinishedDownloadInterval: number
	autoRedownloadFailed: boolean
	autoRedownloadFailedFromInteractiveSearch: boolean
}

export interface ImportListConfig {
	id: number
	listSyncLevel: "disabled" | "logOnly" | "keepAndUnmonitor" | "removeAndKeep" | "removeAndDelete"
}

export interface UiConfig {
	id: number
	firstDayOfWeek: number
	calendarWeekColumnHeader: string
	movieRuntimeFormat: "hoursMinutes" | "minutes"
	shortDateFormat: string
	longDateFormat: string
	timeFormat: string
	showRelativeDates: boolean
	enableColorImpairedMode: boolean
	movieInfoLanguage: number
	uiLanguage: number
	theme: "auto" | "dark" | "light"
}
