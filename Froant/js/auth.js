// js/auth.js
class MabeetAuth {
    // 🟢 جعل الكلاس يقرأ مباشرة من window.API_BASE_URL الموحد أونلاين
    static API_BASE_URL = window.API_BASE_URL || 'https://mabeet-backend.runasp.net/api';

    // 🟢 دالة التحقق من صحة الحقول
    static validateRegisterFields(userData) {
        if (!userData.firstName || userData.firstName.trim() === "") return { valid: false, message: "يرجى إدخال الاسم الأول" };
        if (!userData.lastName || userData.lastName.trim() === "") return { valid: false, message: "يرجى إدخال الاسم الأخير" };
        if (!userData.email || !userData.email.includes('@')) return { valid: false, message: "يرجى إدخال بريد إلكتروني صحيح" };
        if (!userData.password || userData.password.length < 6) return { valid: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
        if (userData.password !== userData.confirmPassword) return { valid: false, message: "كلمات المرور غير متطابقة" };
        return { valid: true };
    }

    // 🟢 دالة التسجيل (معدلة لتضرب في السيرفر الأونلاين مباشرة)
    static async register(userData) {
        const dataToSend = {
            FirstName: userData.firstName,
            LastName: userData.lastName,
            Email: userData.email,
            NationalID: userData.nationalID,
            PhoneNumber: userData.phoneNumber,
            Password: userData.password,
            ConfirmPassword: userData.confirmPassword, 
            UserType: userData.userType 
        };

        try {
            // استخدام الرابط الموحد مباشرة لضمان الاتصال
            const response = await fetch(`${this.API_BASE_URL}/Users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            
            if (response.ok) {
                return { success: true, message: "تم التسجيل بنجاح!" };
            } else {
                const err = await response.json().catch(() => ({}));
                let msg = "فشل التسجيل";
                if(err.errors) msg = Object.values(err.errors).flat().join(", ");
                else if(err.message) msg = err.message;
                else if(err.description) msg = err.description;
                return { success: false, message: msg };
            }
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: "خطأ في الاتصال بالسيرفر أونلاين." };
        }
    }
    
    // 🟢 دالة الدخول (معدلة لتضرب في السيرفر الأونلاين مباشرة)
    static async login(email, password) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/Users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, Password: password }) 
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userRole', data.role); 
                localStorage.setItem('isLoggedIn', 'true'); 
                
                const userId = this.getUserIdFromToken(data.token);
                
                localStorage.setItem('userData', JSON.stringify({
                    id: userId, 
                    firstName: data.firstName || 'مستخدم', 
                    lastName: data.lastName || '',
                    email: email,
                    role: data.role,
                    phoneNumber: data.phoneNumber,
                    nationalID: data.nationalID
                }));
                
                return { success: true, userRole: data.role, message: "تم تسجيل الدخول بنجاح" };
            } else {
                return { success: false, message: data.message || 'بيانات الدخول غير صحيحة' };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "خطأ في الاتصال بالسيرفر أونلاين" };
        }
    }

    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    static getCurrentUser() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    static getUserIdFromToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const parsed = JSON.parse(jsonPayload);
           
            return parsed.nameid || parsed.sub || parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        } catch (e) { return null; }
    }

    static logout() {
        localStorage.clear();
        window.location.href = 'index.html'; 
    }
}