// Video management functionality

// Load videos when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load all videos
  loadVideos();
  
  // Add download buttons to videos
  addDownloadButtons();
});

// Load all videos
function loadVideos() {
  fetch('/videos')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('videos');
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-message"><h3>Chưa có video nào được tải lên</h3><p>Hãy tải video đầu tiên!</p></div>';
        return;
      }
      
      container.innerHTML = '';
      data.forEach(video => {
        const el = document.createElement('div');
        el.className = 'video-item';
        el.setAttribute('data-filename', video.filename);
        
        // Giải mã tiêu đề video để hiển thị đúng các ký tự đặc biệt
        let videoTitle = video.title || video.originalname;
        try {
          // Thử giải mã tiêu đề nếu nó chứa các ký tự bị mã hóa
          const tempElement = document.createElement('textarea');
          tempElement.innerHTML = videoTitle;
          videoTitle = tempElement.value;
        } catch (e) {
          console.error('Lỗi khi giải mã tiêu đề video:', e);
        }
        
        // Cắt ngắn tiêu đề nếu quá dài
        const truncateTitle = (title, maxLength = 40) => {
          return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
        };
        const displayTitle = truncateTitle(videoTitle);
        
        el.innerHTML = `
          <div class="video-thumbnail" data-id="${video.filename}">
            <video src="/video/${video.filename}" preload="metadata"></video>
            <div class="play-overlay"><span>▶</span></div>
          </div>
          <h3 class="video-title" title="${videoTitle}">${displayTitle}</h3>
        `;
        container.appendChild(el);
        
        // Thêm sự kiện click để chuyển đến trang chi tiết video
        el.querySelector('.video-thumbnail').addEventListener('click', () => {
          window.location.href = `/video-detail.html?id=${video.filename}`;
        });
        
        // Thêm sự kiện click cho tiêu đề video
        el.querySelector('.video-title').addEventListener('click', () => {
          window.location.href = `/video-detail.html?id=${video.filename}`;
        });
      });
      
      // Thêm nút tải xuống cho mỗi video
      addDownloadButtons();
    })
    .catch(error => {
      console.error('Lỗi khi tải danh sách video:', error);
      document.getElementById('videos').innerHTML = '<div class="error-message">Không thể tải danh sách video. Vui lòng thử lại sau.</div>';
    });
}

// Thêm chức năng tải xuống video
function addDownloadButtons() {
  setTimeout(() => {
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
      const videoInfo = item.querySelector('.video-info') || item;
      const videoFilename = item.getAttribute('data-filename');
      
      // Kiểm tra nếu chưa có nút tải xuống
      if (!videoInfo.querySelector('.download-btn')) {
        const downloadBtn = document.createElement('a');
        downloadBtn.href = `/video/${encodeURIComponent(videoFilename)}`;
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Tải xuống';
        downloadBtn.download = videoFilename;
        videoInfo.appendChild(downloadBtn);
      }
    });
  }, 500);
}