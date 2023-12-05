export function convertToSeconds(timeString: string): number {
  const parts = timeString.split(":").map((part) => parseInt(part, 10))
  if (parts.length !== 3) {
    throw new Error("Invalid time format")
  }

  const [hours, minutes, seconds] = parts
  return hours * 3600 + minutes * 60 + seconds
}

export function extractYouTubeVideoID(url) {
  try {
    const parsedUrl = new URL(url)
    const queryParams = parsedUrl.searchParams
    const videoId = queryParams.get("v")

    if (videoId) {
      return videoId
    } else {
      // Handle cases where URL does not have a 'v' parameter
      // This might happen in shortened URLs like 'https://youtu.be/VIDEO_ID'
      const pathname = parsedUrl.pathname
      const segments = pathname.split("/").filter(Boolean) // Remove empty segments
      return segments.length > 0 ? segments[0] : null
    }
  } catch (error) {
    console.error("Invalid URL")
    return null
  }
}
