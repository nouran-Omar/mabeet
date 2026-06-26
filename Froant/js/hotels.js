// js/hotels.js
import ApiService from "./api-config.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 [Hotels] الصفحة بدأت التحميل...");
  loadHotels();
});

async function loadHotels(filters = {}) {
  const container = document.getElementById("hotels-container");
  const spinner = document.getElementById("loading-spinner");

  if (spinner) spinner.style.display = "block";
  if (container) container.innerHTML = "";

  try {
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
      "سوهاج,القاهرة,الجيزة,الإسكندرية,المنوفية,الإسماعيلية";
    const cityFilterValue = cityFilterElement ? cityFilterElement.value : "";
    const governorateFilter = cityFilterValue || targetGovernorates;

    let selectedCityNameForClientFilter = "";
    if (cityFilterElement && cityFilterValue) {
      const selectedOption =
        cityFilterElement.options[cityFilterElement.selectedIndex];
      selectedCityNameForClientFilter = selectedOption
        ? selectedOption.textContent
        : "";
    }

    const params = {
      CheckIN: CheckIN,
      CheckOUT: CheckOUT,
      AccommodationType: "Hotel",
      Governorate: governorateFilter,
      Status: "Approved",
      ...filters,
    };
    delete params.cityFilter;
    delete params.CityID;
    delete params.CityName;
    if (filters.CheckIN) params.CheckIN = filters.CheckIN;
    if (filters.CheckOUT) params.CheckOUT = filters.CheckOUT;
    if (filters.Governorate) params.Governorate = filters.Governorate;

    console.log(
      "🔄 [API Request] جاري طلب الفنادق المعتمدة والمفلترة...",
      params,
    );

    const accommodations = await ApiService.get(
      "/Availability/accommodations",
      params,
      false,
    );

    console.log("📦 [API Response] الداتا الخام للفنادق:", accommodations);

    if (!accommodations) {
      if (spinner) spinner.style.display = "none";
      if (container) {
        container.innerHTML =
          '<div class="col-12 text-center"><div class="alert alert-danger">حدث خطأ في جلب البيانات. قد تكون هناك مشكلة في الاتصال بالخادم.</div></div>';
      }
      return;
    }

    // ========================================
    // 🌟 دالة مساعدة لاستخراج المحافظة والمدينة بدقة
    // ========================================
    const mapCityData = (acc) => {
      const loc = acc.location || acc.Location || {};

      const governorateName =
        loc.city?.governorateName ||
        loc.GovernorateName ||
        loc.region ||
        acc.region ||
        "غير محدد";

      const cityName =
        loc.city?.cityName ||
        loc.CityName ||
        acc.cityName ||
        acc.City ||
        governorateName;

      return { governorateName, cityName };
    };

    // ========================================
    // ملء فلتر المدن
    // ========================================
    if (cityFilterElement) {
      const citiesMap = {};
      accommodations.forEach((acc) => {
        const data = mapCityData(acc);
        if (data.cityName && !citiesMap[data.cityName]) {
          citiesMap[data.cityName] = data.cityName;
        }
      });

      cityFilterElement.innerHTML =
        '<option value="">جميع المدن المتاحة</option>';
      Object.keys(citiesMap)
        .sort()
        .forEach((city) => {
          const option = document.createElement("option");
          option.value = city;
          option.textContent = citiesMap[city];
          if (city === selectedCityNameForClientFilter) option.selected = true;
          cityFilterElement.appendChild(option);
        });
    }

    if (!accommodations || accommodations.length === 0) {
      if (spinner) spinner.style.display = "none";
      container.innerHTML =
        '<div class="col-12 text-center"><div class="alert alert-info">لا توجد فنادق متاحة حالياً أو مطابقة للفلتر.</div></div>';
      return;
    }

    // ========================================
    // فلترة حسب المدينة على جانب العميل
    // ========================================
    let filteredAccommodations = accommodations;
    if (
      selectedCityNameForClientFilter &&
      selectedCityNameForClientFilter !== "جميع المدن المتاحة"
    ) {
      filteredAccommodations = accommodations.filter((acc) => {
        const data = mapCityData(acc);
        return data.cityName === selectedCityNameForClientFilter;
      });
    }

    const hotels = filteredAccommodations.filter((acc) => {
      const type = (
        acc.accommodationType ||
        acc.AccommodationType ||
        ""
      ).toLowerCase();
      return type.includes("hotel");
    });

    if (spinner) spinner.style.display = "none";
    if (hotels.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><div class="alert alert-info">لا توجد فنادق مطابقة للفلتر المحدد.</div></div>';
      return;
    }

    container.innerHTML = "";
    hotels.forEach((hotel) => {
      const id = hotel.accommodationID || hotel.AccommodationID;
      const name = hotel.accommodationName || hotel.AccommodationName;
      let finalPrice = hotel.pricePerNight || hotel.PricePerNight || 0;
      const rooms = hotel.hotelRooms || hotel.HotelRooms || [];

      if (finalPrice === 0 && rooms.length > 0) {
        const prices = rooms
          .map((r) => r.pricePerNight || r.PricePerNight)
          .filter((p) => p > 0);
        if (prices.length > 0) finalPrice = Math.min(...prices);
      }

      const imgObj =
        hotel.images && hotel.images.length > 0 ? hotel.images[0] : null;
      const imgUrl = ApiService.getImageUrl(
        hotel.mainImageUrl ||
          hotel.MainImageUrl ||
          (imgObj ? imgObj.imageUrl || imgObj.ImageUrl : null),
      );

      const priceDisplay =
        finalPrice > 0
          ? `<span class="fw-bold fs-5">${finalPrice}</span> <small>ج.م / ليلة</small>`
          : '<span class="text-muted small">السعر حسب الغرفة</span>';

      const finalCityName = mapCityData(hotel).cityName;
      const detailsLink = `property-details.html?id=${id}&checkIn=${params.CheckIN}&checkOut=${params.CheckOUT}`;

      container.innerHTML += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-0 property-card">
                        <div class="position-relative">
                            <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;" 
                                 alt="${name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                            <span class="badge bg-primary position-absolute top-0 end-0 m-3">فندق</span>
                        </div>
                        <div class="card-body p-3">
                            <h5 class="card-title fw-bold text-dark mb-0 text-truncate">${name}</h5>
                            <p class="text-muted small mb-2">
                                <i class="fas fa-map-marker-alt text-primary me-1"></i> ${finalCityName}
                            </p>
                            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                                <span class="text-primary">${priceDisplay}</span>
                                <a href="${detailsLink}" class="btn btn-outline-primary btn-sm rounded-pill px-4">التفاصيل</a>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
  } catch (e) {
    console.error("❌ Error loading hotels:", e);
    if (spinner) spinner.style.display = "none";
    container.innerHTML =
      '<div class="alert alert-danger">حدث خطأ في الاتصال.</div>';
  }
}

window.applyUnifiedFilter = function () {
  loadHotels({});
};
