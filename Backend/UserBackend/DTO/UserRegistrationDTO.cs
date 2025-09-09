using System.ComponentModel.DataAnnotations;

namespace UserBackend.DTO
{
    public class UserRegistrationDTO
    {
        [Required]
        [EmailAddress]
        [MaxLength(40)]
        public required string Email { get; init; }

        [Required]
        [MaxLength(30)]
        public required string Username { get; init; }

        [Required]
        public required string Password { get; init; }

        public IFormFile? ProfilePicture { get; init; }
    }
}
