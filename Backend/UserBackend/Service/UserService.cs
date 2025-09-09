using UserBackend.DTO;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Response;
using UserBackend.UserToken;

namespace UserBackend.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepo _userRepo;

        public UserService(IUserRepo userRepo)
        {
            _userRepo = userRepo;
        }
        public async Task<ResponseData<byte[]?>> GetProfilePicture(int id)
        {
            User? user = await _userRepo.GetByIdAsync(id);
            if (user is null)
                return new ResponseData<byte[]?>
                {
                    Status = ResponseStatus.NOT_FOUND,
                    Message = "User not found"
                };

            return new ResponseData<byte[]?>
            {
                Data = user.ProfilePicture,
                Status = ResponseStatus.OK,
                Message = "Profile picture acquired successfully"
            };
        }

        public async Task<ResponseData<UserResponseDTO>> GetUser(int id)
        {
            try
            {
                User? user = await _userRepo.GetByIdAsync(id);

                if (user == null)
                {
                    return new ResponseData<UserResponseDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "User not found"
                    };
                }

                UserResponseDTO response = new UserResponseDTO(
                    user.Username,
                    user.Email
                );

                return new ResponseData<UserResponseDTO>
                {
                    Data = response,
                    Status = ResponseStatus.OK,
                    Message = "User retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<UserResponseDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred: {ex.Message}"
                };
            }
        }
    }
}
