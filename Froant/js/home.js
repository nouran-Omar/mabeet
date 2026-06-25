// components.js
class MabeetComponents {
    static createNavbar() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userName = userData.firstName ? `${userData.firstName} ${userData.lastName}` : 'مستخدم';
        
        return `
            <nav class="navbar navbar-expand-lg fixed-top" id="mainNav">
                <div class="container">
                    <a class="navbar-brand" href="../index.html">
                        <i class="fa-solid fa-bed"></i>
                        <span>Mabeet</span>
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mx-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="../index.html">الرئيسية</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../project/hotels.html">الفنادق</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="apartments.html">الشقق</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../project/student-housing.html">السكن الطلابي</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="../project/map.html">الخريطة</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#footer">اتصل بنا</a>
                            </li>
                        </ul>
                        
                        <div class="d-flex align-items-center ${isLoggedIn ? 'd-none' : ''}" id="authButtons">
                            <button class="btn btn-auth me-2" id="loginBtn">تسجيل دخول</button>
                            <button class="btn btn-outline-auth" id="registerBtn">إنشاء حساب</button>
                        </div>
                        
                        <div class="d-flex align-items-center ${isLoggedIn ? '' : 'd-none'}" id="userMenu">
                            <a href="../project/favorites.html" class="text-dark me-3 favorite-icon"><i class="fas fa-heart"></i></a>
                            <a href="../project/bookings.html" class="text-dark me-3 booking-icon"><i class="fas fa-calendar-check"></i></a>
                            <div class="dropdown user-dropdown">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4a6cf7&color=fff&size=40" 
                                     class="user-avatar rounded-circle" 
                                     id="userAvatar" 
                                     alt="صورة المستخدم" 
                                     data-bs-toggle="dropdown" 
                                     aria-expanded="false">
                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userAvatar">
                                    <li><a class="dropdown-item" href="../project/profile.html"><i class="fas fa-user me-2"></i>الملف الشخصي</a></li>
                                    <li><a class="dropdown-item" href="../project/bookings.html"><i class="fas fa-calendar-check me-2"></i>حجوزاتي</a></li>
                                    <li><a class="dropdown-item" href="../project/favorites.html"><i class="fas fa-heart me-2"></i>المفضلة</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>تسجيل خروج</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    static createFooter() {
        return `
            <footer class="footer" id="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4 mb-md-0">
                            <div class="footer-logo">
                                <i class="fa-solid fa-bed"></i> Mabeet
                            </div>
                            <p class="mb-4">منصة رائدة في مجال حجوزات السكن في مصر، نقدم تجربة حجز سلسة ومريحة مع خيارات متنوعة تناسب جميع الاحتياجات والميزانيات.</p>
                            <div class="social-links">
                                <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                        
                        <div class="col-lg-2 col-md-6 mb-4 mb-md-0">
                            <h3 class="footer-title">روابط سريعة</h3>
                            <ul class="footer-links">
                                <li><a href="../index.html"><i class="fas fa-chevron-left me-2"></i>الرئيسية</a></li>
                                <li><a href="../project/hotels.html"><i class="fas fa-chevron-left me-2"></i>الفنادق</a></li>
                                <li><a href="../project/apartments.html"><i class="fas fa-chevron-left me-2"></i>الشقق</a></li>
                                <li><a href="../project/student-housing.html"><i class="fas fa-chevron-left me-2"></i>السكن الطلابي</a></li>
                                <li><a href="../project/map.html"><i class="fas fa-chevron-left me-2"></i>الخريطة</a></li>
                            </ul>
                        </div>
                        
                        <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
                            <h3 class="footer-title">روابط مساعدة</h3>
                            <ul class="footer-links">
                                <li><a href="../project/faq.html"><i class="fas fa-chevron-left me-2"></i>الأسئلة الشائعة</a></li>
                                <li><a href="../project/privacy.html"><i class="fas fa-chevron-left me-2"></i>سياسة الخصوصية</a></li>
                                <li><a href="../project/terms.html"><i class="fas fa-chevron-left me-2"></i>شروط الاستخدام</a></li>
                                <li><a href="../project/cancellation.html"><i class="fas fa-chevron-left me-2"></i>سياسة الإلغاء</a></li>
                                <li><a href="../project/support.html"><i class="fas fa-chevron-left me-2"></i>الدعم الفني</a></li>
                            </ul>
                        </div>
                        
                        <div class="col-lg-3 col-md-6">
                            <h3 class="footer-title">اتصل بنا</h3>
                            <div class="footer-contact">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>123 شارع التحرير، القاهرة، مصر</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone-alt"></i>
                                    <span>+20 123 456 7890</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>info@mabeet.com</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-clock"></i>
                                    <span>من الأحد إلى الخميس: 9 ص - 5 م</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>© 2025 Mabeet</p>
                    </div>
                </div>
            </footer>
        `;
    }

    static createPageHeader(title, breadcrumbItems = []) {
        const breadcrumbHtml = breadcrumbItems.map(item => 
            `<li class="breadcrumb-item ${item.active ? 'active' : ''}">
                ${item.active ? item.text : `<a href="${item.href}">${item.text}</a>`}
            </li>`
        ).join('');
        
        return `
            <div class="page-header">
                <div class="container">
                    <h1>${title}</h1>
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb justify-content-center">
                            ${breadcrumbHtml}
                        </ol>
                    </nav>
                </div>
            </div>
        `;
    }
}