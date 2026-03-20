/**
 * ==========================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN TRỊ GIAO DIỆN ĐÔNG Y ĐƯỜNG (PREMIUM JS CORE)
 * PHẦN 1: KHỞI TẠO HỆ THỐNG, QUẢN LÝ NGƯỜI DÙNG & FORM VALIDATION
 * Tổng số dòng dự kiến: 3000 dòng (Chia làm 3 phần)
 * ==========================================================================
 */

"use strict";

// --------------------------------------------------------------------------
// 1. KHAI BÁO BIẾN TOÀN CỤC & HẰNG SỐ HỆ THỐNG
// --------------------------------------------------------------------------
const SYSTEM_CONFIG = {
    version: "1.0.0",
    author: "Nguyen Ngoc Hoang",
    theme: "Dark Mode Premium",
    storageKey: "DongYDuong_UserData",
    loginStatusKey: "daDangNhap",
    userNameKey: "tenNguoiDung",
    cartKey: "DongYDuong_Cart",
    animationSpeed: 300,
    debugMode: true
};

// --------------------------------------------------------------------------
// 2. KHỞI TẠO KHI TRANG WEB TẢI XONG (DOM CONTENT LOADED)
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    console.log("%c--- ĐÔNG Y ĐƯỜNG JS CORE ĐÃ KÍCH HOẠT ---", "color: #7cb342; font-weight: bold; font-size: 1.2rem;");

    // Khởi tạo các module chính
    AuthModule.init();
    UIManagementModule.init();
    AccountModule.init();
    CartModule.init();
    
    // Kiểm tra trạng thái hệ thống
    SystemHealthCheck();
});

// --------------------------------------------------------------------------
// 3. MODULE XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ (AUTH MODULE)
// --------------------------------------------------------------------------
const AuthModule = (function() {

    const init = function() {
        handleRegisterForm();
        handleLoginForm();
        updateHeaderAuthStatus();
    };

    /**
     * Hàm xử lý Form Đăng Ký (Register)
     * Mục tiêu: Lấy tên người dùng, kiểm tra mật khẩu, lưu vào LocalStorage
     */
    const handleRegisterForm = function() {
        const registerForm = document.getElementById("registerForm");
        
        if (!registerForm) return;

        registerForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Chặn load lại trang
            
            console.log("Đang xử lý đăng ký...");

            // Truy xuất các trường dữ liệu một cách chi tiết
            const nameInput = document.getElementById("reg-name");
            const emailInput = registerForm.querySelector('input[type="email"]');
            const passwordInputs = registerForm.querySelectorAll('input[type="password"]');
            
            // Lấy giá trị thực tế
            const fullName = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInputs[0] ? passwordInputs[0].value : "";
            const confirmPassword = passwordInputs[1] ? passwordInputs[1].value : "";

            // --- KIỂM TRA DỮ LIỆU (VALIDATION) ---
            if (fullName.length < 2) {
                showToast("Họ tên quá ngắn, vui lòng nhập đầy đủ.", "error");
                highlightInput(nameInput);
                return;
            }

            if (!validateEmail(email)) {
                showToast("Email không hợp lệ.", "error");
                highlightInput(emailInput);
                return;
            }

            if (password.length < 6) {
                showToast("Mật khẩu phải từ 6 ký tự trở lên.", "error");
                highlightInput(passwordInputs[0]);
                return;
            }

            if (password !== confirmPassword) {
                showToast("Mật khẩu nhập lại không khớp.", "error");
                highlightInput(passwordInputs[1]);
                return;
            }

            // --- LƯU TRỮ DỮ LIỆU XUỐNG BỘ NHỚ ---
            try {
                localStorage.setItem(SYSTEM_CONFIG.userNameKey, fullName);
                localStorage.setItem(SYSTEM_CONFIG.loginStatusKey, "true");
                
                // Lưu thêm object người dùng để mở rộng sau này
                const userObj = {
                    name: fullName,
                    email: email,
                    role: "VIP",
                    joinDate: new Date().toISOString()
                };
                localStorage.setItem(SYSTEM_CONFIG.storageKey, JSON.stringify(userObj));

                showToast("Tạo tài khoản thành công!", "success");

                // Hiệu ứng chuyển trang mượt mà
                setTimeout(() => {
                    window.location.href = "taikhoan.html";
                }, 1000);

            } catch (error) {
                console.error("Lỗi lưu trữ LocalStorage:", error);
                showToast("Lỗi hệ thống, vui lòng thử lại.", "error");
            }
        });
    };

    /**
     * Hàm xử lý Form Đăng Nhập (Login)
     */
    const handleLoginForm = function() {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm) return;

        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // Giả lập kiểm tra đăng nhập
            if (email && password) {
                localStorage.setItem(SYSTEM_CONFIG.loginStatusKey, "true");
                // Nếu chưa có tên trong kho, để mặc định
                if (!localStorage.getItem(SYSTEM_CONFIG.userNameKey)) {
                    localStorage.setItem(SYSTEM_CONFIG.userNameKey, "Khách Hàng Cũ");
                }
                
                showToast("Chào mừng bạn quay trở lại!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            }
        });
    };

    /**
     * Cập nhật trạng thái icon Tài khoản trên Header
     */
    const updateHeaderAuthStatus = function() {
        const iconTaiKhoan = document.querySelector('a[title="Tài khoản"]');
        if (!iconTaiKhoan) return;

        const isLoggedIn = localStorage.getItem(SYSTEM_CONFIG.loginStatusKey) === "true";

        if (isLoggedIn) {
            const savedName = localStorage.getItem(SYSTEM_CONFIG.userNameKey);
            iconTaiKhoan.href = "taikhoan.html";
            iconTaiKhoan.style.color = "#7cb342";
            iconTaiKhoan.innerHTML = `<i class="fas fa-user-check"></i> <span class="header-user-name">${savedName}</span>`;
        } else {
            iconTaiKhoan.href = "dangnhap.html";
        }
    };

    // Hàm hỗ trợ kiểm tra định dạng Email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    return {
        init: init,
        updateStatus: updateHeaderAuthStatus
    };

})();

// --------------------------------------------------------------------------
// 4. MODULE QUẢN LÝ TRANG TÀI KHOẢN (ACCOUNT MODULE)
// --------------------------------------------------------------------------
const AccountModule = (function() {

    const init = function() {
        displayUserInfo();
        handleLogout();
        setupTiltEffect();
    };

    const displayUserInfo = function() {
        const nameDisplay = document.getElementById("ten-hien-thi");
        if (!nameDisplay) return;

        const userName = localStorage.getItem(SYSTEM_CONFIG.userNameKey);
        if (userName) {
            nameDisplay.innerHTML = `Xin chào, <span class="highlight-name">${userName}</span>!`;
        }
    };

    const handleLogout = function() {
        const btnLogout = document.getElementById("btn-logout");
        if (!btnLogout) return;

        btnLogout.addEventListener("click", function() {
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                localStorage.removeItem(SYSTEM_CONFIG.loginStatusKey);
                localStorage.removeItem(SYSTEM_CONFIG.userNameKey);
                window.location.href = "index.html";
            }
        });
    };

    /**
     * Hiệu ứng nghiêng 3D cực kỳ chi tiết cho Account Card
     */
    const setupTiltEffect = function() {
        const card = document.querySelector('.account-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = "all 0.5s ease";
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = "none";
        });
    };

    return { init };

})();

// --------------------------------------------------------------------------
// 5. TIỆN ÍCH HỆ THỐNG (SYSTEM UTILITIES)
// --------------------------------------------------------------------------

// Hiển thị thông báo Toast đẹp mắt
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast-message toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // CSS trực tiếp cho Toast để đảm bảo luôn hiển thị
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: type === 'success' ? '#7cb342' : '#f44336',
        color: '#fff',
        padding: '15px 25px',
        borderRadius: '8px',
        zIndex: '9999',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        animation: 'slideInRight 0.5s ease forwards',
        fontFamily: 'sans-serif'
    });

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Highlight ô nhập liệu khi lỗi
function highlightInput(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = "#f44336";
    inputElement.style.boxShadow = "0 0 10px rgba(244, 67, 54, 0.5)";
    inputElement.focus();
    
    setTimeout(() => {
        inputElement.style.borderColor = "";
        inputElement.style.boxShadow = "";
    }, 2000);
}

function SystemHealthCheck() {
    console.log("Health Check: Hệ thống hoạt động bình thường.");
    if (!window.localStorage) {
        console.warn("Trình duyệt không hỗ trợ LocalStorage!");
    }
}