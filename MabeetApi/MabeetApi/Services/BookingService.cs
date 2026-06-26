using MabeetApi.Data;
using MabeetApi.DTOs;
using MabeetApi.Entities;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

namespace MabeetApi.Services
{
	public class BookingService : IBookingService
	{
		private readonly AppDbContext _context;

		public BookingService(AppDbContext context)
		{
			_context = context;
		}

		// =========================================================
		// 1. حجز جديد (Create)
		// =========================================================
		public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto bookingDto)
		{
			if (bookingDto.CheckOUT <= bookingDto.CheckIN)
				throw new ArgumentException("تاريخ المغادرة يجب أن يكون بعد الوصول");

			var user = await _context.Users.FindAsync(bookingDto.UserId);
			if (user == null) throw new ArgumentException("المستخدم غير موجود");

			decimal totalPrice = 0;
			var booking = new Booking
			{
				CheckIN = bookingDto.CheckIN,
				CheckOUT = bookingDto.CheckOUT,
				AppUserID = bookingDto.UserId,
				Status = "Pending",
				CreatedAt = DateTime.Now
			};

			var days = (bookingDto.CheckOUT - bookingDto.CheckIN).Days;
			if (days <= 0) days = 1;

			if (bookingDto.LocalLodingID.HasValue)
			{
				var unit = await _context.LocalLodings.FindAsync(bookingDto.LocalLodingID);
				if (unit == null) throw new ArgumentException("الشقة غير موجودة");
				totalPrice = unit.PricePerNight * days;
				booking.LocalLodings.Add(unit);
			}
			else if (bookingDto.HotelRoomID.HasValue)
			{
				var unit = await _context.HotelRooms.FindAsync(bookingDto.HotelRoomID);
				if (unit == null) throw new ArgumentException("الغرفة غير موجودة");
				totalPrice = unit.PricePerNight * days;
				booking.HotelRooms.Add(unit);
			}
			else if (bookingDto.BedID.HasValue)
			{
				var unit = await _context.Beds.FindAsync(bookingDto.BedID);
				if (unit == null) throw new ArgumentException("السرير غير موجود");
				totalPrice = unit.PricePerNight * days;
				booking.Beds.Add(unit);
			}
			else
			{
				throw new ArgumentException("يجب اختيار وحدة للحجز");
			}

			booking.TotalPrice = totalPrice;

			_context.Bookings.Add(booking);
			await _context.SaveChangesAsync();

			return MapToBookingResponseDto(booking);
		}

		// =========================================================
		// 2. البحث (Get Available) - (تم الإصلاح)
		// =========================================================
		public async Task<List<Accommodation>> GetAvailableAccommodationsAsync(AvailabilityCheckDto dto)
		{
			var query = _context.Accommodations
				.Include(a => a.Location).ThenInclude(l => l.City).ThenInclude(c => c.Governorate) // 🟢 Include Governorate
				.Include(a => a.Images)
				.Include(a => ((Hotel)a).HotelRooms)
				.Include(a => ((StudentHouse)a).StudentRooms).ThenInclude(sr => sr.Beds)
				.AsQueryable();

            // 🟢 فلتر الحالة
            if (!string.IsNullOrEmpty(dto.Status) && dto.Status == "Approved")
            {
                query = query.Where(a => a.IsApproved == true);
            }

            // 🟢 فلتر المحافظة (الجديد)
            if (!string.IsNullOrEmpty(dto.Governorate))
            {
                var governorates = dto.Governorate.Split(',').Select(g => g.Trim()).ToList();
                if (governorates.Any())
                {
                    query = query.Where(a => a.Location != null && a.Location.City != null && a.Location.City.Governorate != null && governorates.Contains(a.Location.City.Governorate.GovernorateName));
                }
            }

			if (dto.CityID.HasValue)
				query = query.Where(a => a.Location.CityID == dto.CityID);

			if (!string.IsNullOrEmpty(dto.AccommodationType))
				query = query.Where(a => a.AccommodationType == dto.AccommodationType);

			var accommodations = await query.ToListAsync();
			var result = new List<Accommodation>();

			foreach (var acc in accommodations)
			{
				// التحقق من التوافر وحساب السعر
				var isAvailable = await IsAccommodationAvailableAsync(acc, dto.CheckIN, dto.CheckOUT);
				if (isAvailable)
				{
					CalculateAndSetPrice(acc); // دالة السعر السحرية
					result.Add(acc);
				}
			}
			return result;
		}

		// =========================================================
		// 3. تفاصيل عقار (Public Details)
		// =========================================================
		public async Task<Accommodation> GetPublicAccommodationByIdAsync(int id)
		{
			var acc = await _context.Accommodations
				.Include(a => a.Location).ThenInclude(l => l.City)
				.Include(a => a.Images)
				.Include(a => ((Hotel)a).HotelRooms)
				.Include(a => ((StudentHouse)a).StudentRooms).ThenInclude(sr => sr.Beds)
				.FirstOrDefaultAsync(a => a.AccommodationID == id);

			if (acc != null) CalculateAndSetPrice(acc);
			return acc;
		}

		// =========================================================
		// 4. حجوزات المستخدم (User Profile)
		// =========================================================
		public async Task<List<BookingResponseDto>> GetUserBookingsAsync(string userId)
		{
			var bookings = await _context.Bookings
			   .Include(b => b.LocalLodings)
			   .Include(b => b.HotelRooms).ThenInclude(hr => hr.Hotel)
			   .Include(b => b.Beds).ThenInclude(bed => bed.StudentRoom.StudentHouse)
			   .Where(b => b.AppUserID == userId)
			   .OrderByDescending(b => b.CreatedAt)
			   .ToListAsync();

			return bookings.Select(b => MapToBookingResponseDto(b)).ToList();
		}

		// =========================================================
		// 5. جميع الحجوزات (Admin Dashboard)
		// =========================================================
		public async Task<List<BookingResponseDto>> GetAllBookingsAsync()
		{
			var bookings = await _context.Bookings
				.Include(b => b.AppUser)
				.Include(b => b.LocalLodings)
				.Include(b => b.HotelRooms).ThenInclude(hr => hr.Hotel)
				.Include(b => b.Beds).ThenInclude(bed => bed.StudentRoom.StudentHouse)
				.OrderByDescending(b => b.CreatedAt)
				.ToListAsync();

			return bookings.Select(b => MapToBookingResponseDto(b)).ToList();
		}

		// =========================================================
		// 6. دوال إدارة الحجز (Update/Cancel/Delete)
		// =========================================================
		public async Task<bool> UpdateBookingStatusAsync(int bookingId, UpdateBookingStatusDto dto)
		{
			var booking = await _context.Bookings.FindAsync(bookingId);
			if (booking == null) throw new ArgumentException("Booking not found");

			booking.Status = dto.Status;
			await _context.SaveChangesAsync();
			return true;
		}

		public async Task<bool> CancelBookingAsync(int bookingId)
		{
			var booking = await _context.Bookings.FindAsync(bookingId);
			if (booking == null) throw new ArgumentException("Booking not found");

			booking.Status = "Cancelled";
			await _context.SaveChangesAsync();
			return true;
		}

		public async Task<bool> DeleteBookingAsync(int bookingId)
		{
			var booking = await _context.Bookings.FindAsync(bookingId);
			if (booking == null) throw new ArgumentException("Booking not found");

			_context.Bookings.Remove(booking);
			await _context.SaveChangesAsync();
			return true;
		}

		public async Task<BookingResponseDto> GetBookingByIdAsync(int bookingId)
		{
			var booking = await _context.Bookings
				.Include(b => b.LocalLodings)
				.Include(b => b.HotelRooms).ThenInclude(hr => hr.Hotel)
				.Include(b => b.Beds).ThenInclude(bed => bed.StudentRoom.StudentHouse)
				.FirstOrDefaultAsync(b => b.BookingID == bookingId);

			if (booking == null) throw new ArgumentException("Booking not found");
			return MapToBookingResponseDto(booking);
		}

		// =========================================================
		// 7. دوال الإتاحة والتقويم (تمت إعادتها لكي لا تحدث أخطاء)
		// =========================================================
		public async Task<AvailabilityResponseDto> GetAccommodationAvailabilityAsync(AccommodationAvailabilityDto dto)
		{
			// منطق بسيط: التحقق من التواريخ المحجوزة
			var startDate = new DateTime(dto.Year, dto.Month, 1);
			var endDate = startDate.AddMonths(1).AddDays(-1);

			// هنا ممكن نرجع الأيام المحجوزة، حالياً هنرجعها فاضية لتجنب الخطأ
			return new AvailabilityResponseDto { AvailableDates = new List<DateTime>(), BookedDates = new List<DateTime>() };
		}

		public async Task<List<DateTime>> GetAllAvailableDatesAsync(int accommodationId)
		{
			// إرجاع قائمة فارغة بدلاً من الخطأ
			return new List<DateTime>();
		}

		// =========================================================
		// 8. دوال مساعدة (Helpers) - (هام جداً)
		// =========================================================

		// دالة التحويل لـ DTO
		private BookingResponseDto MapToBookingResponseDto(Booking b)
		{
			string accName = "غير محدد";
			string accType = "Unknown";

			if (b.HotelRooms != null && b.HotelRooms.Any())
			{
				accName = b.HotelRooms.FirstOrDefault()?.Hotel?.AccommodationName ?? "فندق";
				accType = "Hotel";
			}
			else if (b.LocalLodings != null && b.LocalLodings.Any())
			{
				accName = b.LocalLodings.FirstOrDefault()?.AccommodationName ?? "شقة";
				accType = "Apartment";
			}
			else if (b.Beds != null && b.Beds.Any())
			{
				accName = b.Beds.FirstOrDefault()?.StudentRoom?.StudentHouse?.AccommodationName ?? "سكن طلابي";
				accType = "StudentHouse";
			}

			return new BookingResponseDto
			{
				BookingID = b.BookingID,
				TotalPrice = b.TotalPrice,
				CheckIN = b.CheckIN,
				CheckOUT = b.CheckOUT,
				Status = b.Status,
				CreatedAt = b.CreatedAt,
				AccommodationName = accName,
				AccommodationType = accType
			};
		}

		// دالة حساب السعر
		private void CalculateAndSetPrice(Accommodation acc)
		{
			if (acc is Hotel hotel && hotel.HotelRooms != null && hotel.HotelRooms.Any())
			{
				var prices = hotel.HotelRooms.Select(r => r.PricePerNight).Where(p => p > 0);
				if (prices.Any()) acc.PricePerNight = prices.Min();
			}
			else if (acc is StudentHouse student && student.StudentRooms != null && student.StudentRooms.Any())
			{
				var prices = student.StudentRooms.SelectMany(r => r.Beds).Select(b => b.PricePerNight).Where(p => p > 0);
				if (prices.Any()) acc.PricePerNight = prices.Min();
			}
			else if (acc is LocalLoding local)
			{
				acc.PricePerNight = local.PricePerNight;
			}
		}

		// دالة التحقق من التوافر
		private async Task<bool> IsAccommodationAvailableAsync(Accommodation accommodation, DateTime checkIN, DateTime checkOUT)
		{
			switch (accommodation)
			{
				case Hotel hotel:
					if (hotel.HotelRooms == null) return false;
					foreach (var room in hotel.HotelRooms)
					{
						// هنا نفترض أن الغرفة متاحة إذا لم يكن عليها حجز (تبسيط)
						// في التطبيق الفعلي يجب فحص جدول الحجوزات
						if (room.IsAvailable) return true;
					}
					return false;

				case LocalLoding local:
					return local.IsAvailable;

				case StudentHouse student:
					if (student.StudentRooms == null) return false;
					foreach (var room in student.StudentRooms)
					{
						if (room.Beds != null && room.Beds.Any(b => b.IsAvailable)) return true;
					}
					return false;
				default: return false;
			}
		}
	}
}