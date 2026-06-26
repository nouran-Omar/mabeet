// js/pay.js
import ApiService, { API_BASE_URL } from "./api-config.js";

document.addEventListener("DOMContentLoaded", () => {
  //  استرجاع البيانات
  const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));

  if (!bookingData) {
    // لا يوجد حجز معلق، العودة للرئيسية
    window.location.href = "index.html";
    return;
  }

  //  عرض البيانات الأساسية
  document.getElementById("confirm-name").innerText =
    bookingData._displayName || "اسم العقار غير محدد";
  document.getElementById("confirm-in").innerText = bookingData.checkIN;
  document.getElementById("confirm-out").innerText = bookingData.checkOUT;

  // 🟢 عرض الصورة والموقع والنوع (مع إصلاح رابط الصورة)
  if (bookingData._displayImage) {
    document.getElementById("confirm-image").src = ApiService.getImageUrl(
      bookingData._displayImage,
    );
  }

  if (bookingData._displayLocation) {
    document.getElementById("confirm-location").innerText =
      bookingData._displayLocation;
  }
  if (bookingData._displayType) {
    document.getElementById("confirm-type").innerText =
      bookingData._displayType;
  }

  let pricePerNight = parseFloat(bookingData._displayPrice);
  if (isNaN(pricePerNight)) pricePerNight = 0;

  // عرض سعر الليلة
  if (pricePerNight > 0) {
    document.getElementById("confirm-price").innerText = pricePerNight;
  } else {
    document.getElementById("confirm-price").innerText = "غير محدد";
  }

  // حساب عدد الليالي
  const start = new Date(bookingData.checkIN);
  const end = new Date(bookingData.checkOUT);

  let nights = 1;
  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const diffTime = end.getTime() - start.getTime();
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (nights <= 0) nights = 1;

  // حساب الإجمالي
  const finalTotal = pricePerNight * nights;

  document.getElementById("confirm-nights").innerText = nights;
  document.getElementById("confirm-total").innerText = finalTotal.toFixed(2); // رقمين عشريين
});

async function confirmBooking() {
  const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));
  const token = ApiService.getToken();

  if (!token || !bookingData) {
    Swal.fire("خطأ", "بيانات الحجز مفقودة", "error");
    return;
  }

  const apiPayload = {
    checkIN: bookingData.checkIN,
    checkOUT: bookingData.checkOUT,
    userId: bookingData.userId,

    hotelRoomID: bookingData.hotelRoomID || null,
    bedID: bookingData.bedID || null,
    localLodingID: bookingData.localLodingID || null,
  };

  Swal.fire({
    title: "جاري تأكيد الحجز...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`${API_BASE_URL}/Bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiPayload),
    });

    if (response.ok) {
      localStorage.removeItem("pendingBooking");

      Swal.fire({
        icon: "success",
        title: "تم الحجز بنجاح! 🎉",
        text: "يمكنك رؤية تفاصيل الحجز في ملفك الشخصي.",
        confirmButtonText: "الذهاب لملفي الشخصي",
      }).then(() => {
        window.location.href = "profile.html";
      });
    } else {
      const result = await response.json();
      console.error("Booking Error:", result);
      Swal.fire({
        icon: "error",
        title: "فشل الحجز",
        text: result.message || "تأكد من أن الوحدة متاحة في هذه التواريخ.",
      });
    }
  } catch (error) {
    console.error("Network Error:", error);
    Swal.fire({
      icon: "error",
      title: "خطأ اتصال",
      text: "تأكد من تشغيل السيرفر.",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("confirmBtn");
  if (btn) btn.addEventListener("click", confirmBooking);
});
