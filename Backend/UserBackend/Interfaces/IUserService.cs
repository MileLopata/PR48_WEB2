using UserBackend.DTO.UserDTO;
using UserBackend.Response;

namespace UserBackend.Interfaces
{
    public interface IUserService
    {
        Task<ResponseData<UserResponseDTO>> GetUser(int id);
        Task<ResponseData<byte[]?>> GetProfilePicture(int id);
    }
}
