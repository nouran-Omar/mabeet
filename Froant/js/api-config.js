

const PORT = "7066"; // ⚠️ تأكدي إن ده البورت بتاعك
const API_BASE_URL = `https://localhost:${PORT}/api`; 
const SERVER_URL = `https://localhost:${PORT}`;

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
        let filename = imagePath.split(/[\\/]/).pop();
        let folder = "uploads/accommodations"; 
        return `${SERVER_URL}/${folder}/${filename}`;
    },

    // 🟢 (هام) إضافة معامل requireAuth لمنع الخروج في صفحات البحث
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
                // 🟢 التعديل: لو الصفحة مش محتاجة تسجيل دخول (زي البحث)، متعملش خروج
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