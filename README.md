# 🎵 YouTube Audio Downloader

Website đơn giản, nhanh gọn để tải audio từ video YouTube. Không cần database!

## ✨ Tính năng

- 🔍 **Tìm kiếm video** - Nhập từ khóa để tìm video YouTube
- 🔗 **Dán link trực tiếp** - Hỗ trợ cả link youtube.com và youtu.be
- ⬇️ **Tải audio MP3** - Download audio chất lượng cao
- 🎨 **UI đẹp, tối giản** - Giao diện hiện đại với TailwindCSS
- ⚡ **Nhanh & Gọn** - Không database, xử lý trực tiếp

## 🛠️ Công nghệ

- **Frontend**: React + Vite + TailwindCSS + Lucide Icons
- **Backend**: Node.js + Express
- **YouTube**: ytdl-core + youtube-search-api

## 📦 Cài đặt

### 1. Cài đặt dependencies cho Backend

```bash
cd server
npm install
```

### 2. Cài đặt dependencies cho Frontend

```bash
cd client
npm install
```

## 🚀 Chạy ứng dụng

### Chạy Backend Server (Terminal 1)

```bash
cd server
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

### Chạy Frontend (Terminal 2)

```bash
cd client
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📖 Cách sử dụng

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. **Tìm kiếm**: Nhập tên bài hát hoặc video bạn muốn tìm
3. **Dán link**: Hoặc dán trực tiếp link YouTube vào ô tìm kiếm
4. **Tải về**: Nhấn nút "Tải Audio" để download file MP3

## 📁 Cấu trúc Project

```
detectAudio/
├── server/              # Backend API
│   ├── index.js         # Express server + API endpoints
│   └── package.json
├── client/              # Frontend React
│   ├── src/
│   │   ├── App.jsx      # Main UI component
│   │   ├── main.jsx     # React entry point
│   │   └── index.css    # TailwindCSS styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### POST `/api/search`
Tìm kiếm video YouTube
```json
{
  "query": "tên bài hát"
}
```

### POST `/api/video-info`
Lấy thông tin video từ URL
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

### GET `/api/download`
Tải audio từ video
```
?url=https://youtube.com/watch?v=...
```

## ⚠️ Lưu ý

- Cần cài Node.js (phiên bản 18+)
- Đảm bảo cả backend và frontend đang chạy
- Backend chạy port 3001, Frontend chạy port 3000
- Cần kết nối internet để tìm kiếm và tải video

## 🎯 Tối ưu hóa

App được thiết kế để:
- ✅ Không cần database
- ✅ Xử lý real-time
- ✅ UI/UX đơn giản, dễ dùng
- ✅ Code gọn gàng, dễ maintain
- ✅ Responsive trên mọi thiết bị

## 📝 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.
