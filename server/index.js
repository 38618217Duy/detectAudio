import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { GetListByKeyword } from 'youtube-search-api';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Validate YouTube URL
const isValidYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/;
  return pattern.test(url);
};

// Extract video ID from URL
const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Search YouTube videos API
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Please enter a search keyword' });
    }

    const result = await GetListByKeyword(query, false, 10);
    
    const videos = result.items
      .filter(item => item.type === 'video')
      .map(item => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
        duration: item.length?.simpleText || 'N/A',
        channel: item.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id}`
      }));

    res.json({ videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error searching videos' });
  }
});

// Get video info from URL API (using yt-dlp)
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const { stdout } = await execAsync(`yt-dlp --dump-json --no-warnings "${url}"`);
    const info = JSON.parse(stdout);
    
    const videoDetails = {
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`,
      duration: info.duration_string || 'N/A',
      channel: info.channel || info.uploader,
      url: url
    };

    res.json({ video: videoDetails });
  } catch (error) {
    console.error('Video info error:', error);
    res.status(500).json({ error: 'Cannot get video info. Make sure yt-dlp is installed.' });
  }
});

// Download audio API (using yt-dlp)
app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info for filename
    const { stdout: infoJson } = await execAsync(`yt-dlp --dump-json --no-warnings "${url}"`);
    const info = JSON.parse(infoJson);
    const safeTitle = info.title.replace(/[^\w\s-]/g, '').substring(0, 100);
    
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // Stream audio directly via yt-dlp
    const ytdlp = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-o', '-',
      '--no-warnings',
      url
    ]);

    ytdlp.stdout.pipe(res);

    ytdlp.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString());
    });

    ytdlp.on('error', (error) => {
      console.error('yt-dlp error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading audio' });
      }
    });

    req.on('close', () => {
      ytdlp.kill();
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error downloading audio. Make sure yt-dlp is installed.' });
    }
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await execAsync('yt-dlp --version');
    res.json({ status: 'OK', message: 'Server is running, yt-dlp is available' });
  } catch {
    res.json({ status: 'WARNING', message: 'Server is running, but yt-dlp is NOT installed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📌 Note: yt-dlp is required for downloading audio`);
  console.log(`   Windows: winget install yt-dlp`);
  console.log(`   Or: pip install yt-dlp`);
});
