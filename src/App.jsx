import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [quality, setQuality] = useState("highest");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [error, setError] = useState("");

  async function downloadVideo(e) {
    e.preventDefault();

    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError("");
    setIsDownloading(true);

    try {
      // This would be replaced with actual Tauri invoke call
      // await invoke("download_video", { url, format, quality });

      // Simulate download for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to history
      setDownloadHistory([
        {
          id: Date.now(),
          url,
          format,
          quality,
          date: new Date().toLocaleString()
        },
        ...downloadHistory
      ]);

      // Clear form
      setUrl("");
    } catch (err) {
      setError("Download failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  }

  function removeFromHistory(id) {
    setDownloadHistory(downloadHistory.filter(item => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/70 text-foreground flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">TubeSonic</h1>
        </div>
        <div className="text-sm opacity-70">The Ultimate YouTube Downloader</div>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-6">Download Video or Audio</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={downloadVideo} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              YouTube URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Format
              </label>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormat("video")}
                  className={`flex-1 py-2 px-4 ${format === "video" ? "bg-primary text-white" : "bg-white/5"}`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("audio")}
                  className={`flex-1 py-2 px-4 ${format === "audio" ? "bg-primary text-white" : "bg-white/5"}`}
                >
                  Audio
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="quality" className="block text-sm font-medium mb-2">
                Quality
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="highest">Highest</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isDownloading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isDownloading
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isDownloading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <div className="w-full max-w-4xl mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Download History</h2>
            <button
              onClick={() => setDownloadHistory([])}
              className="text-sm text-primary hover:text-primary/80 transition"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            {downloadHistory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.url}</p>
                  <p className="text-xs opacity-70">
                    {item.format === "video" ? "Video" : "Audio"} • {item.quality} • {item.date}
                  </p>
                </div>
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-500 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-8 text-center text-sm opacity-70">
        <p>Built with 💙 by Shaswat Raj</p>
      </footer>
    </div>
  );
}

export default App;
