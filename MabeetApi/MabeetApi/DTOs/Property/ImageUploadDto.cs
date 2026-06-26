using System.ComponentModel.DataAnnotations;

namespace MabeetApi.DTOs.Property
{
    public class ImageUploadDto
    {
        [Required(ErrorMessage = "Accommodation ID is required")]
        public int AccommodationID { get; set; }

        public string? AltText { get; set; }
        public bool IsMain { get; set; } = false;

        // This will be handled by the controller, not sent in JSON
        public IFormFile? ImageFile { get; set; }
        public int? RelatedHotelRoomID { get; set; }
    }
}
