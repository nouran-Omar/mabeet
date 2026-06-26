// js/student-housing.js
import ApiService from "./api-config.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 [StudentHousing] الصفحة بدأت التحميل...");
  loadStudentHousing();
});

async function loadStudentHousing(filters = {}) {
  const container = document.getElementById("student-container");
  const spinner = document.getElementById("loading-spinner");

  if (spinner) spinner.style.display = "block";
  if (container) container.innerHTML = "";

  try {
    // ⭐️ قراءة قيم الفلاتر من واجهة المستخدم
    const checkInElement = document.getElementById("checkIn");
    const checkOutElement = document.getElementById("checkOut");
    const cityFilterElement = document.getElementById("cityFilter");

    const checkInValue = checkInElement
      ? checkInElement.value
      : new Date().toISOString().split("T")[0];
    const checkOutValue = checkOutElement
      ? checkOutElement.value
      : new Date(new Date().setDate(new Date().getDate() + 1))
          .toISOString()
          .split("T")[0];
    const CheckIN = checkInValue
      ? new Date(checkInValue).toISOString()
      : new Date().toISOString();
    const CheckOUT = checkOutValue
      ? new Date(checkOutValue).toISOString()
      : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString();

    const targetGovernorates =
      "سوهاج";
    const cityFilterValue = cityFilterElement ? cityFilterElement.value : "";
    const governorateFilter = cityFilterValue || targetGovernorates;

    // 🆕 جلب اسم المدينة الذي اختاره المستخدم من الـ Dropdown لفلترة النتائج محلياً
    let selectedCityNameForClientFilter = "";
    if (cityFilterElement && cityFilterValue) {
      const selectedOption =
        cityFilterElement.options[cityFilterElement.selectedIndex];
      selectedCityNameForClientFilter = selectedOption
        ? selectedOption.textContent
        : "";
    }

    // 1. تحديد بارامترات الطلب
    const params = {
      CheckIN: CheckIN,
      CheckOUT: CheckOUT,
      AccommodationType: "StudentHouse",
      Governorate: governorateFilter,
      Status: "Approved",
      ...filters,
    };
    // تنظيف البارامترات المتعارضة
    delete params.cityFilter;
    delete params.CityID;
    delete params.CityName;
    if (filters.CheckIN) params.CheckIN = filters.CheckIN;
    if (filters.CheckOUT) params.CheckOUT = filters.CheckOUT;
    if (filters.Governorate) params.Governorate = filters.Governorate;

    console.log(
      "🔄 [API Request] جاري طلب السكن الطلابي المعتمد والمفلتر...",
      params,
    );

    // جلب البيانات من API
    const accommodations = await ApiService.get(
      "/Availability/accommodations",
      params,
      false,
    );

    console.log("📦 [API Response] الداتا الخام:", accommodations);

    if (!accommodations) {
      if (spinner) spinner.style.display = "none";
      if (container) {
        container.innerHTML =
          '<div class="col-12 text-center"><div class="alert alert-danger">حدث خطأ في جلب البيانات. قد تكون هناك مشكلة في الاتصال بالخادم.</div></div>';
      }
      return;
    }

    // =================================================================
    // 🌟 دالة مساعدة لاستخراج بيانات المدينة بدقة
    // =================================================================
    const mapCityData = (acc) => {
      const loc = acc.location || acc.Location || {};
      const governorateName =
        acc.region || acc.Region || loc.region || loc.Region;
      let cityName = acc.cityName || acc.CityName;

      // التعامل مع حقل city الذي قد يكون مصفوفة
      if (!cityName && loc.city) {
        let cityData = loc.city;
        if (Array.isArray(cityData) && cityData.length > 0) {
          cityData = cityData[0];
        }
        if (cityData) {
          cityName = cityData.cityName || cityData.CityName;
        }
      }
      return {
        governorateName,
        cityName: cityName || governorateName,
      };
    };

    // =================================================================
    // 1. ملء فلتر المدن من بيانات العقارات المسترجعة
    // =================================================================
    if (cityFilterElement) {
      const uniqueGovernorates = new Set();
      const citiesMap = {};

      accommodations.forEach((acc) => {
        const data = mapCityData(acc);
        if (
          data.governorateName &&
          !uniqueGovernorates.has(data.governorateName)
        ) {
          uniqueGovernorates.add(data.governorateName);
          citiesMap[data.governorateName] = data.cityName;
        }
      });

      cityFilterElement.innerHTML =
        '<option value="">جميع المدن المتاحة</option>';

      Object.keys(citiesMap)
        .sort()
        .forEach((governorate) => {
          const option = document.createElement("option");
          option.value = governorate;
          option.textContent = citiesMap[governorate];

          if (governorate === cityFilterValue) {
            option.selected = true;
          }
          cityFilterElement.appendChild(option);
        });
      console.log(
        `✅ [City Filter] تم تحديث الفلتر ليعرض ${Object.keys(citiesMap).length} مدينة من بيانات السكن الطلابي المتاح.`,
      );
    }

    // =================================================================

    if (!accommodations || accommodations.length === 0) {
      if (spinner) spinner.style.display = "none";
      container.innerHTML =
        '<div class="col-12 text-center"><div class="alert alert-info">لا يوجد سكن طلابي متاح حالياً أو مطابق للفلتر.</div></div>';
      return;
    }

    // 🚨 الخطوة الثانية: تطبيق فلترة إضافية على جانب العميل بناءً على اسم المدينة الظاهر
    let filteredAccommodations = accommodations;

    if (
      selectedCityNameForClientFilter &&
      selectedCityNameForClientFilter !== "جميع المدن المتاحة"
    ) {
      filteredAccommodations = accommodations.filter((acc) => {
        const data = mapCityData(acc);
        return data.cityName === selectedCityNameForClientFilter;
      });
      console.log(
        `✅ [Client Filter] تم تصفية النتائج إلى ${filteredAccommodations.length} نتيجة بناءً على المدينة: ${selectedCityNameForClientFilter}`,
      );
    }

    // تطبيق فلترة النوع على النتائج المفلترة النهائية
    const housing = filteredAccommodations.filter((acc) => {
      const type = (
        acc.accommodationType ||
        acc.AccommodationType ||
        ""
      ).toLowerCase();
      return type.includes("student");
    });

    if (spinner) spinner.style.display = "none";

    if (housing.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><div class="alert alert-info">لا يوجد سكن طلابي مطابق للفلتر المحدد.</div></div>';
      return;
    }

    container.innerHTML = "";
    housing.forEach((house, index) => {
      const id = house.accommodationID || house.AccommodationID;
      const name = house.accommodationName || house.AccommodationName;
      let price = house.pricePerNight || house.PricePerNight || 0;

      let bedCount = 0;
      const rooms = house.studentRooms || house.StudentRooms || [];
      if (rooms.length > 0) {
        rooms.forEach((r) => {
          if (r.beds) bedCount += r.beds.length;
          else if (r.Beds) bedCount += r.Beds.length;
        });
      } else {
        bedCount = house.totalGuests || house.TotalGuests || 0;
      }

      if (price === 0 && rooms.length > 0) {
        rooms.forEach((r) => {
          const beds = r.beds || r.Beds || [];
          beds.forEach((b) => {
            const p = b.pricePerNight || b.PricePerNight || 0;
            if (p > 0 && (price === 0 || p < price)) price = p;
          });
        });
      }

      const imgObj =
        house.images && house.images.length > 0 ? house.images[0] : null;
      const imgUrl = ApiService.getImageUrl(
        house.mainImageUrl ||
          house.MainImageUrl ||
          (imgObj ? imgObj.imageUrl || imgObj.ImageUrl : null),
      );

      const data = mapCityData(house); // استخدام الدالة المستحدثة
      const finalCityName = data.cityName; // اسم المدينة النهائي للعرض

      const priceDisplay =
        price > 0
          ? `<span class="fw-bold fs-5">${price}</span> <small>ج.م / سرير</small>`
          : '<span class="text-muted small">تواصل للسعر</span>';

      const detailsLink = `property-details.html?id=${id}&checkIn=${params.CheckIN}&checkOut=${params.CheckOUT}`;

      container.innerHTML += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-0 property-card">
                        <div class="position-relative">
                            <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;" 
                                 alt="${name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                            <span class="badge position-absolute top-0 end-0 m-3" style="background-color: #6f42c1;">سكن طلابي</span>
                        </div>
                        <div class="card-body p-3">
                            <h5 class="card-title fw-bold text-dark mb-0 text-truncate">${name}</h5>
                            
                            <p class="text-muted small mb-2">
                                <i class="fas fa-map-marker-alt text-primary me-1"></i> ${finalCityName}
                            </p>

                            <p class="text-muted small mb-3">
                                <i class="fas fa-users text-secondary me-1"></i> ${bedCount > 0 ? bedCount + " سرير متاح" : "متاح للحجز"}
                            </p>
                            
                            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                                <span style="color: #6f42c1;">${priceDisplay}</span>
                                <a href="${detailsLink}" class="btn btn-outline-primary btn-sm rounded-pill px-4" 
                                   style="border-color: #6f42c1; color: #6f42c1;">حجز سرير</a>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
  } catch (e) {
    console.error(e);
    if (spinner) spinner.style.display = "none";
    container.innerHTML =
      '<div class="alert alert-danger">حدث خطأ في الاتصال.</div>';
  }
}
window.applyUnifiedFilter = function () {
  loadStudentHousing({});
};
