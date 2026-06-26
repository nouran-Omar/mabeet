using System.ComponentModel.DataAnnotations;

namespace MabeetApi.DTOs
{
    public class AvailabilityCheckDto
    {
        [Required]
        public DateTime CheckIN { get; set; }

        [Required]
        public DateTime CheckOUT { get; set; }

        public int? CityID { get; set; }
        public string? AccommodationType { get; set; } // "Hotel", "LocalLoding", "StudentHouse"
        public string? Governorate { get; set; }
        public string? Status { get; set; }
    }
}
