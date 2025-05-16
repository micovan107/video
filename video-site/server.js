const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));

// Đảm bảo đường dẫn video được phục vụ đúng cách
// Thêm route riêng để xử lý các tên file có mã hóa URL
app.get('/video/:filename', (req, res) => {
  try {
    // Giải mã URL để xử lý các ký tự đặc biệt trong tên file
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    console.log(`Đang cố gắng phục vụ video: ${filename}`);
    console.log(`Đường dẫn đầy đủ: ${filePath}`);
    
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.log(`File video không tồn tại: ${filePath}`);
      
      // Thử tìm file trong thư mục uploads bằng cách liệt kê tất cả các file
      const uploadsPath = path.join(__dirname, '..', 'uploads');
      const files = fs.readdirSync(uploadsPath);
      console.log(`Các file có trong thư mục uploads:`, files);
      
      // Tìm file có tên gần giống
      const similarFile = files.find(file => {
        // So sánh không phân biệt hoa thường và bỏ qua dấu
        return file.toLowerCase().includes(filename.toLowerCase()) || 
               filename.toLowerCase().includes(file.toLowerCase());
      });
      
      if (similarFile) {
        console.log(`Tìm thấy file tương tự: ${similarFile}`);
        return res.sendFile(path.join(uploadsPath, similarFile));
      }
      
      return res.status(404).send('Video không tìm thấy');
    }
    
    // Phục vụ file video
    res.sendFile(filePath);
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu video:', error);
    res.status(500).send('Lỗi khi xử lý yêu cầu video');
  }
});

// Vẫn giữ route tĩnh cho các trường hợp đơn giản
app.use('/video', express.static(path.join(__dirname, '..', 'uploads')));
app.use(bodyParser.json());

// Thêm log để kiểm tra đường dẫn uploads
console.log('Đường dẫn uploads:', path.join(__dirname, '..', 'uploads'));

// Video database (in-memory for simplicity)
let videosDb = [];

// Load existing videos on startup
function loadExistingVideos() {
  try {
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath);
    }
    
    const files = fs.readdirSync(uploadsPath);
    console.log('Danh sách file trong thư mục uploads:', files);
    
    videosDb = files.map(filename => {
      // Lưu tên file chính xác như trong hệ thống file
      const originalname = filename.split('-').slice(1).join('-');
      return {
        filename,
        originalname,
        title: originalname, // Thêm tiêu đề mặc định
        userId: null, // No user ID for existing videos
        uploadDate: new Date().toISOString(),
        filePath: path.join(uploadsPath, filename) // Lưu đường dẫn đầy đủ
      };
    });
    
    console.log(`Đã tải ${videosDb.length} video hiện có`);
    // Log thông tin chi tiết về video đầu tiên để debug
    if (videosDb.length > 0) {
      console.log('Chi tiết video đầu tiên:', videosDb[0]);
    }
  } catch (err) {
    console.error('Lỗi khi tải video hiện có:', err);
  }
}

// Initialize video database
loadExistingVideos();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Middleware giả lập xác thực - cho phép tất cả người dùng truy cập
function authenticateUser(req, res, next) {
  // Gán một ID ngẫu nhiên cho mỗi yêu cầu để theo dõi
  req.userId = 'anonymous-' + Math.random().toString(36).substring(2, 15);
  
  // Gán tên người dùng mặc định
  req.uploaderName = 'Người dùng ẩn danh';
  
  // Cho phép tất cả các yêu cầu đi qua
  next();
}

// Routes
app.get('/videos', (req, res) => {
  const { userId } = req.query;
  
  let filteredVideos = [...videosDb];
  if (userId) {
    filteredVideos = filteredVideos.filter(video => video.userId === userId);
  }
  
  res.json(filteredVideos.reverse());
});

// Route để lấy thông tin chi tiết của một video
app.get('/videos/:filename', (req, res) => {
  // Lấy filename từ params và giải mã URL
  let { filename } = req.params;
  try {
    // Giải mã URL để xử lý các ký tự đặc biệt
    filename = decodeURIComponent(filename);
    console.log(`Tìm kiếm video với filename đã giải mã: ${filename}`);
  } catch (error) {
    console.error('Lỗi khi giải mã URL:', error);
    // Nếu có lỗi khi giải mã, vẫn sử dụng filename gốc
  }
  
  // Thêm header cho user-name nếu có
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userId = authHeader.split(' ')[1];
    // Lấy thông tin người dùng từ localStorage hoặc từ hệ thống xác thực
    // Trong trường hợp thực tế, bạn sẽ lấy thông tin này từ cơ sở dữ liệu
    req.headers['user-name'] = req.headers['user-name'] || 'Người dùng';
  }
  
  // Tìm video chính xác theo tên file
  let video = videosDb.find(v => v.filename === filename);
  
  // Nếu không tìm thấy, thử tìm video có tên gần giống
  if (!video) {
    console.log(`Không tìm thấy video chính xác với tên: ${filename}, đang thử tìm tương tự...`);
    
    video = videosDb.find(v => {
      // So sánh không phân biệt hoa thường
      return v.filename.toLowerCase().includes(filename.toLowerCase()) || 
             filename.toLowerCase().includes(v.filename.toLowerCase());
    });
    
    if (video) {
      console.log(`Đã tìm thấy video tương tự: ${video.filename}`);
    }
  }
  
  if (!video) {
    console.log(`Video không tìm thấy: ${filename}`);
    
    // Liệt kê tất cả các video hiện có để debug
    console.log('Danh sách video hiện có:', videosDb.map(v => v.filename));
    
    return res.status(404).json({ 
      error: 'Video không tồn tại',
      message: 'Video có thể đã bị xóa hoặc chưa từng tồn tại trong hệ thống',
      code: 'VIDEO_NOT_FOUND',
      requestedFile: filename
    });
  }
  
  res.json(video);
});

app.post('/upload', authenticateUser, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }
  
  // Add video to database with user ID, uploader name and title
  // Đảm bảo tiêu đề được mã hóa đúng cách
  let videoTitle = req.body.title || req.file.originalname;
  
  // Xử lý tiêu đề để đảm bảo hiển thị đúng các ký tự đặc biệt
  try {
    // Nếu tiêu đề đã bị mã hóa sai, thử giải mã và mã hóa lại đúng cách
    if (/Ã|Ä|á»|áº|Æ|â|Ã¡|Ã¢|Ã£|Ã¤|Ã¥/.test(videoTitle)) {
      // Sử dụng Buffer để xử lý mã hóa trong Node.js
      videoTitle = Buffer.from(videoTitle, 'binary').toString('utf8');
    }
  } catch (e) {
    console.error('Lỗi khi xử lý tiêu đề video:', e);
    // Giữ nguyên tiêu đề nếu có lỗi
  }
  
  const videoEntry = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    title: videoTitle, // Sử dụng tiêu đề đã được xử lý
    userId: req.userId,
    uploaderName: req.uploaderName || req.body.uploaderName || null, // Ưu tiên sử dụng tên người dùng từ request
    uploadDate: new Date().toISOString()
  };
  
  videosDb.push(videoEntry);
  res.redirect('/');
});

app.delete('/video/:filename', authenticateUser, (req, res) => {
  // Lấy filename từ params và giải mã URL
  let { filename } = req.params;
  try {
    // Giải mã URL để xử lý các ký tự đặc biệt
    filename = decodeURIComponent(filename);
    console.log(`Xóa video với filename đã giải mã: ${filename}`);
  } catch (error) {
    console.error('Lỗi khi giải mã URL:', error);
    // Nếu có lỗi khi giải mã, vẫn sử dụng filename gốc
  }
  
  const videoIndex = videosDb.findIndex(v => v.filename === filename);
  
  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  // Không kiểm tra quyền sở hữu video - bất kỳ ai cũng có thể xóa
  // Remove from database
  const video = videosDb.splice(videoIndex, 1)[0];
  
  // Delete file
  fs.unlink(path.join(__dirname, '..', 'uploads', filename), (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Could not delete file' });
    }
    res.json({ success: true });
  });
});


app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
