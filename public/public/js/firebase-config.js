// Firebase configuration
// Cần thay thế thông tin cấu hình này bằng thông tin từ dự án Firebase của bạn
// Xem hướng dẫn trong README.md để biết cách lấy thông tin này
const firebaseConfig = {
  apiKey: "AIzaSyBgITWCnQO7pW2-VOAgpKFsK6GN8H037HM",
  authDomain: "masoi-92684.firebaseapp.com",
  projectId: "masoi-92684",
  storageBucket: "masoi-92684.firebasestorage.app",
  messagingSenderId: "1030518945375",
  appId: "1:1030518945375:web:a531a0233c0dcbde120dea",
  measurementId: "G-QNS4GVQ178"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Function to sign in with Google
function signInWithGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }));
      window.location.href = '/';
    })
    .catch((error) => {
      console.error('Lỗi đăng nhập:', error);
      document.getElementById('login-error').textContent = 'Đăng nhập thất bại. Vui lòng thử lại.';
    });
}

// Function to sign out
function signOut() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    })
    .catch((error) => {
      console.error('Lỗi đăng xuất:', error);
    });
}

// Function to check if user is logged in
function checkAuthState() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

// Export functions for use in other files
window.firebaseAuth = {
  signInWithGoogle,
  signOut,
  checkAuthState,
  // Thêm hàm lấy thông tin người dùng hiện tại
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem('user'));
  }
};