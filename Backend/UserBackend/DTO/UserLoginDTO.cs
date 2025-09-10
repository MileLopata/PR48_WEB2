using System.ComponentModel.DataAnnotations;
using UserBackend.Model;

namespace UserBackend.DTO
{
    public class UserLoginDTO
    {
        [MaxLength(40)]
        public required string EmailOrUsername { get; init; }

        public required string Password { get; init; }
        
        }
}
