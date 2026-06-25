

// api-config.js

// 🚀 روابط السيرفر الحقيقي (Production)
const API_BASE_URL = `https://mabeet-backend.runasp.net/api`; 
const SERVER_URL = `https://mabeet-backend.runasp.net`; 

// 💻 لو حابة ترجعي للـ Localhost في أي وقت للتطوير، شيل الكومنت عن السطور دي واقفل اللي فوق:
// const PORT = "7066"; 
// const API_BASE_URL = `https://localhost:${PORT}/api`; 
// const SERVER_URL = `https://localhost:${PORT}`;

export { API_BASE_URL, SERVER_URL };

// ربطهم بالـ window عشان لو فيه ملفات JS قديمة بتقراهم كـ Global variables
window.SERVER_URL = SERVER_URL;
window.API_BASE_URL = API_BASE_URL;

const ApiService = {
    getToken() {
        return localStorage.getItem('userToken');
    },

    getImageUrl(imagePath) {
        if (!imagePath || imagePath === "string" || imagePath.trim() === "") {
            return 'https://placehold.co/600x400?text=No+Image';
        }
        if (imagePath.startsWith('http')) return imagePath;
        
        // فك مسار الصورة وأخذ اسم الملف فقط
        let filename = imagePath.split(/[\\/]/).pop();
        let folder = "uploads/accommodations"; 
        return `${SERVER_URL}/${folder}/${filename}`;
    },

    // 🟢 إضافة معامل requireAuth لمنع الخروج التلقائي في صفحات البحث والصفحة الرئيسية
    async get(endpoint, params = {}, requireAuth = true) {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
                url.searchParams.append(key, params[key]);
            }
        });

        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                // 🟢 لو الصفحة مش محتاجة تسجيل دخول (زي البحث)، مش هنعمل تحويل لصفحة الـ login
                if (response.status === 401 && requireAuth && !endpoint.includes('Availability')) {
                    console.warn("جلسة منتهية، جاري الخروج...");
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Fetch Error (${endpoint}):`, error);
            return null;
        }
    }
};

// عشان تقدري تستخدمي الـ ApiService في أي مكان بالـ import
export default ApiService;
window.ApiService = ApiService;