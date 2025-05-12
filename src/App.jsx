import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
      // Call the Rust function to download the video
      const result = await invoke("download_video", { url, format, quality });

      if (result.success) {
        // Add to history
        setDownloadHistory([
          {
            id: Date.now(),
            url,
            format,
            quality,
            date: new Date().toLocaleString(),
            filePath: result.file_path
          },
          ...downloadHistory
        ]);

        // Clear form
        setUrl("");
      } else {
        setError("Download failed: " + result.message);
      }
    } catch (err) {
      setError("Download failed: " + (err.message || err));
    } finally {
      setIsDownloading(false);
    }
  }

  function removeFromHistory(id) {
    setDownloadHistory(downloadHistory.filter(item => item.id !== id));
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="app-title">TubeSonic</h1>
        </div>
        <div className="app-subtitle">The Ultimate YouTube Downloader</div>
      </header>

      {/* Main Card */}
      <div className="card">
        <h2 className="card-title">Download Video or Audio</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={downloadVideo} className="form">
          <div className="form-group">
            <label htmlFor="url" className="form-label">
              YouTube URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Format
              </label>
              <div className="format-toggle">
                <button
                  type="button"
                  onClick={() => setFormat("video")}
                  className={`format-button ${format === "video" ? "active" : ""}`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("audio")}
                  className={`format-button ${format === "audio" ? "active" : ""}`}
                >
                  Audio
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quality" className="form-label">
                Quality
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="form-select"
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
            className="submit-button"
          >
            {isDownloading ? (
              <div>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </div>
            ) : (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="card history-card">
          <div className="history-header">
            <h2 className="card-title">Download History</h2>
            <button
              onClick={() => setDownloadHistory([])}
              className="clear-button"
            >
              Clear All
            </button>
          </div>

          <div className="history-list">
            {downloadHistory.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-content">
                  <p className="history-url">{item.url}</p>
                  <p className="history-details">
                    {item.format === "video" ? "Video" : "Audio"} • {item.quality} • {item.date}
                  </p>
                  {item.filePath && (
                    <p className="history-path">
                      {item.filePath}
                    </p>
                  )}
                </div>
                <div className="history-actions">
                  {item.filePath && (
                    <button
                      onClick={() => invoke("plugin:opener|open", { path: item.filePath })}
                      className="action-button"
                      title="Open file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="action-button delete-button"
                    title="Remove from history"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Built with 💙 by Shaswat Raj</p>
      </footer>
    </div>
  );
}

export default App;
