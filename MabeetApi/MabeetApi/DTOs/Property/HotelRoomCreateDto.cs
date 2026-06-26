using MabeetApi.Entities;
using System.ComponentModel.DataAnnotations;

namespace MabeetApi.DTOs.Property
{
    public class HotelRoomCreateDto
    {
        [Required(ErrorMessage = "Room number is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Room number must be greater than 0")]
        public int RoomNumber { get; set; }

        [Required(ErrorMessage = "Room type is required")]
        public RoomType Type { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? RoomDescription { get; set; }

        [Required(ErrorMessage = "Price per night is required")]
        [Range(0.0, 15000.0, ErrorMessage = "Price must be between 0 and 15000")]
        public decimal PricePerNight { get; set; }
        public ICollection<int> ImageIDs { get; set; } = new List<int>();
        public bool IsAvailable { get; set; } = true;
    }
}
