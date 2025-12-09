import { useState } from 'react';
import { Search, Download, Music, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState('');

  // Check if input is a YouTube URL
  const isYouTubeUrl = (str) => {
    return str.includes('youtube.com') || str.includes('youtu.be');
  };

  // Handle search or get info from URL
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setError('');
    setVideos([]);

    try {
      if (isYouTubeUrl(inputValue)) {
        // If URL, get video info
        const response = await fetch(`${API_URL}/video-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputValue }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setVideos([data.video]);
        } else {
          setError(data.error || 'Cannot get video info');
        }
      } else {
        // If keyword, search
        const response = await fetch(`${API_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: inputValue }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setVideos(data.videos);
          if (data.videos.length === 0) {
            setError('No videos found');
          }
        } else {
          setError(data.error || 'Search error');
        }
      }
    } catch (err) {
      setError('Cannot connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle audio download
  const handleDownload = async (video) => {
    setDownloading(prev => ({ ...prev, [video.id]: true }));
    
    try {
      const url = `${API_URL}/download?url=${encodeURIComponent(video.url)}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${video.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      setError('Error downloading audio');
      console.error(err);
    } finally {
      // Wait 2 seconds before clearing downloading state
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, [video.id]: false }));
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">YouTube Audio Downloader</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste YouTube link or enter search keyword..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Video Results */}
        {videos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Results ({videos.length} videos)
            </h2>
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex gap-4"
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                />
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                  <p className="text-xs text-gray-500">{video.duration}</p>
                </div>

                {/* Download Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleDownload(video)}
                    disabled={downloading[video.id]}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {downloading[video.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && !error && (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Enter YouTube link or search for videos to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
