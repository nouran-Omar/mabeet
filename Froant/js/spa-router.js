
// auth.js
class MabeetAuth {
    static userTypes = {
        STUDENT: 'student',
        REGULAR: 'regular',
        HOTEL_OWNER: 'hotel_owner',
        BROKER: 'broker'
    };

    static register(userData) {
        if (!this.validateUserData(userData)) {
            return false;
        }

        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', userData.email);

        return true;
    }

    static login(email, password) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (userData.email === email && userData.password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            return true;
        }

        return false;
    }

    static logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
    }

    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    static getCurrentUser() {
        if (this.isLoggedIn()) {
            return JSON.parse(localStorage.getItem('userData') || '{}');
        }
        return null;
    }

    static getUserType() {
        const user = this.getCurrentUser();
        return user ? user.userType : null;
    }

    static validateUserData(userData) {
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'userType'];

        for (let field of requiredFields) {
            if (!userData[field]) {
                return false;
            }
        }

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return false;
        }

        if (userData.password.length < 6) {
            return false;
        }

        return true;
    }

    static isHotelOwner() {
        return this.getUserType() === this.userTypes.HOTEL_OWNER;
    }
}


// components.js
class MabeetComponents {
    static createNavbar() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userName = userData.firstName ? `${userData.firstName} ${userData.lastName}` : 'مستخدم';

        return `
            <nav class="navbar navbar-expand-lg fixed-top" id="mainNav">
                <div class="container">
                    <a class="navbar-brand" href="#home">
                        <i class="fa-solid fa-bed"></i>
                        <span>Mabeet</span>
                    </a>

                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mx-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="#home">الرئيسية</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#hotels">الفنادق</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#contact">تواصل معنا</a>
                            </li>
                        </ul>
                        
                        <div class="auth-buttons ${isLoggedIn ? 'd-none' : ''}" id="authButtons">
                            <a href="#login" class="btn btn-primary" id="loginBtn">تسجيل الدخول</a>
                            <a href="#register" class="btn btn-primary-outline" id="registerBtn">إنشاء حساب</a>
                        </div>
                        
                        <div class="user-menu dropdown ${isLoggedIn ? 'd-flex' : 'd-none'}" id="userMenu">
                            <a href="#" class="d-flex align-items-center dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <img id="userAvatar" src="" alt="User Avatar" class="rounded-circle me-2" width="40" height="40">
                                <span class="d-none d-lg-inline-block">${userName}</span>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="#profile">ملفي الشخصي</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="logoutBtn">تسجيل الخروج</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    static createFooter() {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                            <div class="footer-logo">
                                <i class="fa-solid fa-bed"></i>
                                <span>Mabeet</span>
                            </div>
                            <p class="mt-3">
                                منصة رائدة لحجز أماكن الإقامة الطلابية والفندقية.
                            </p>
                            <div class="social-links mt-3">
                                <a href="#"><i class="fab fa-facebook-f"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div class="col-lg-2 col-md-6 mb-4 mb-lg-0">
                            <h5 class="footer-title">روابط سريعة</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#home">الرئيسية</a></li>
                                <li><a href="#hotels">الفنادق</a></li>
                                <li><a href="#about">من نحن</a></li>
                                <li><a href="#contact">تواصل معنا</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                            <h5 class="footer-title">صفحات الموقع</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#login">تسجيل الدخول</a></li>
                                <li><a href="#register">إنشاء حساب</a></li>
                                <li><a href="#profile">الملف الشخصي</a></li>
                                <li><a href="#terms">الشروط والأحكام</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6">
                            <h5 class="footer-title">تواصل معنا</h5>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>القاهرة، مصر</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
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
                        <p>© 2023 Mabeet. جميع الحقوق محفوظة. صمم بواسطة فريق Mabeet</p>
                    </div>
                </div>
            </footer>
        `;
    }

    static createPageHeader(title, breadcrumbItems = []) {
        const breadcrumbHtml = breadcrumbItems.map(item =>
            `<li class="breadcrumb-item ${item.active ? 'active' : ''}">
                ${item.active ? item.text : `<a href="#${item.href}">${item.text}</a>`}
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


// shared.js (معدلة)
const contentMap = {
    'home': `
        <section id="hero" class="d-flex align-items-center justify-content-center">
            <div class="container text-center text-white">
                <h1>أهلاً بك في الصفحة الرئيسية</h1>
                <p class="lead">هذا هو محتوى الصفحة الرئيسية الذي تم تحميله ديناميكيًا.</p>
                <a href="#hotels" class="btn btn-primary btn-lg mt-3">استكشف الفنادق</a>
            </div>
        </section>
    `,
    'hotels': `
        <div class="container section-padding">
            <h1>صفحة الفنادق</h1>
            <p>هذا هو محتوى صفحة الفنادق.</p>
            <p>تتمكن هنا من عرض قائمة بالفنادق المتاحة للحجز.</p>
        </div>
    `,
    'contact': `
        <div class="container section-padding">
            <h1>صفحة تواصل معنا</h1>
            <p>هذا هو محتوى صفحة تواصل معنا.</p>
            <p>يمكنك وضع نموذج اتصال هنا.</p>
        </div>
    `,
    'login': `
        <div class="container section-padding">
            <h1>تسجيل الدخول</h1>
            <p>هذا هو محتوى صفحة تسجيل الدخول.</p>
            <p>يمكنك وضع نموذج تسجيل الدخول هنا.</p>
        </div>
    `,
    'register': `
        <div class="container section-padding">
            <h1>إنشاء حساب</h1>
            <p>هذا هو محتوى صفحة إنشاء حساب.</p>
            <p>يمكنك وضع نموذج إنشاء حساب هنا.</p>
        </div>
    `,
    'profile': `
        <div class="container section-padding">
            <h1>ملفي الشخصي</h1>
            <p>هذا هو محتوى صفحة الملف الشخصي.</p>
            <p>يمكن للمستخدمين عرض معلوماتهم وتحديثها هنا.</p>
        </div>
    `,
};


function renderComponents() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = MabeetComponents.createNavbar();
    }
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = MabeetComponents.createFooter();
    }
}

function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userEmail = localStorage.getItem('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    const userNameElement = document.querySelector('#userMenu span');

    if (authButtons && userMenu) {
        if (isLoggedIn) {
            authButtons.classList.add('d-none');
            userMenu.classList.remove('d-none');
            userMenu.classList.add('d-flex');
            if (userAvatar && userEmail) {
                userAvatar.src = `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=4a6cf7&color=fff`;
            }
            if (userNameElement) {
                userNameElement.textContent = userData.firstName ? `${userData.firstName} ${userData.lastName}` : 'مستخدم';
            }
        } else {
            authButtons.classList.remove('d-none');
            userMenu.classList.add('d-none');
            userMenu.classList.remove('d-flex');
        }
    }
}

function handleLogout() {
    MabeetAuth.logout();
    updateAuthUI();
    loadContent('home'); // العودة للصفحة الرئيسية بعد تسجيل الخروج
}

// دالة تحميل المحتوى بناءً على الرابط
function loadContent(pageName) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = contentMap[pageName] || '<h1>الصفحة غير موجودة</h1>';
    }
    // تحديث حالة الروابط النشطة في النافبار
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${pageName}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// إضافة مستمعين للروابط
document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.navbar-nav .nav-link, .btn[href^="#"]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        const pageName = href.substring(1);
        loadContent(pageName);
        window.history.pushState({}, '', href); // لتغيير الرابط في المتصفح
    } else if (e.target && e.target.id === 'logoutBtn') {
        e.preventDefault();
        handleLogout();
    }
});


window.addEventListener('load', () => {
    renderComponents();
    updateAuthUI();
    const initialPage = window.location.hash.substring(1) || 'home';
    loadContent(initialPage);


    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        });
    }
});