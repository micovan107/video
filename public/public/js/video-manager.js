// Video management functionality

// Check authentication state when page loads
document.addEventListener('DOMContentLoaded', () => {
  const user = firebaseAuth.checkAuthState();
  if (user) {
    // Update UI with user info
    updateUserUI(user);
    // Load videos
    loadVideos();
  }
});

// Update UI with user information
function updateUserUI(user) {
  const header = document.querySelector('header');
  
  // Create user profile element if it doesn't exist
  if (!document.querySelector('.user-profile')) {
    const userProfile = document.createElement('div');
    userProfile.className = 'user-profile';
    userProfile.innerHTML = `
      <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="${user.displayName}">
      <div>
        <span>${user.displayName}</span>
        <a href="#" id="sign-out-btn" style="font-size: 0.8rem; padding: 5px 10px;">Đăng xuất</a>
      </div>
    `;
    header.appendChild(userProfile);
    
    // Add sign out event listener
    document.getElementById('sign-out-btn').addEventListener('click', (e) => {
      e.preventDefault();
      firebaseAuth.signOut();
    });
  }
  
  // Add filter buttons for all/my videos if on main page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const container = document.querySelector('.container');
    const videosDiv = document.getElementById('videos');
    
    if (!document.querySelector('.my-videos-toggle')) {
      const filterDiv = document.createElement('div');
      filterDiv.className = 'my-videos-toggle';
      filterDiv.innerHTML = `
        <button id="all-videos-btn" class="active">Tất cả video</button>
        <button id="my-videos-btn">Video của tôi</button>
      `;
      container.insertBefore(filterDiv, videosDiv);
      
      // Add event listeners to filter buttons
      document.getElementById('all-videos-btn').addEventListener('click', () => {
        document.getElementById('all-videos-btn').classList.add('active');
        document.getElementById('my-videos-btn').classList.remove('active');
        loadVideos();
      });
      
      document.getElementById('my-videos-btn').addEventListener('click', () => {
        document.getElementById('my-videos-btn').classList.add('active');
        document.getElementById('all-videos-btn').classList.remove('active');
        loadVideos(user.uid);
      });
    }
  }
}

// Load videos with optional user filter
function loadVideos(userId = null) {
  const url = userId ? `/videos?userId=${userId}` : '/videos';
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('videos');
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-message"><h3>Chưa có video nào được tải lên</h3><p>Hãy tải video đầu tiên của bạn!</p></div>';
        return;
      }
      
      container.innerHTML = '';
      data.forEach(video => {
        const el = document.createElement('div');
        el.className = 'video-item';
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
        
        // Lấy thông tin người dùng hiện tại từ firebaseAuth thay vì trực tiếp từ localStorage
        const currentUser = firebaseAuth.getCurrentUser();
        
        el.innerHTML = `
          <div class="video-thumbnail" data-id="${video.filename}">
            <video src="/video/${video.filename}" preload="metadata"></video>
            <div class="play-overlay"><span>▶</span></div>
          </div>
          <h3 class="video-title" title="${videoTitle}">${displayTitle}</h3>
          ${(video.userId && currentUser && video.userId === currentUser.uid) ? `
          <div class="video-actions">
            <button class="delete-btn" data-id="${video.filename}">Xóa video</button>
          </div>` : ''}
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
      
      // Add event listeners to delete buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Bạn có chắc chắn muốn xóa video này?')) {
            deleteVideo(btn.dataset.id);
          }
        });
      });
    })
    .catch(error => {
      console.error('Lỗi khi tải danh sách video:', error);
      document.getElementById('videos').innerHTML = '<div class="error-message">Không thể tải danh sách video. Vui lòng thử lại sau.</div>';
    });
}

// Delete a video
function deleteVideo(filename) {
  // Sử dụng firebaseAuth.getCurrentUser() thay vì truy cập trực tiếp localStorage
  const user = firebaseAuth.getCurrentUser();
  
  if (!user) {
    console.error('Không thể xóa video: Người dùng chưa đăng nhập');
    alert('Bạn cần đăng nhập để xóa video.');
    return;
  }
  
  fetch(`/video/${filename}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.uid}`
    }
  })
  .then(res => {
    if (res.ok) {
      // Reload videos after successful deletion
      const isMyVideosActive = document.getElementById('my-videos-btn')?.classList.contains('active');
      // Sử dụng user từ firebaseAuth.getCurrentUser() đã được khai báo ở trên
      loadVideos(isMyVideosActive ? user.uid : null);
    } else {
      throw new Error('Không thể xóa video');
    }
  })
  .catch(error => {
    console.error('Lỗi khi xóa video:', error);
    alert('Không thể xóa video. Vui lòng thử lại sau.');
  });
}