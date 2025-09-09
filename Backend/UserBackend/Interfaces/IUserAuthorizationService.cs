using UserBackend.DTO;
using UserBackend.Response;

namespace UserBackend.Interfaces
{
    public interface IUserAuthorizationService
    {
        Task<ResponseData<string>> Register(UserRegistrationDTO request);
        Task<ResponseData<string>> Login(UserLoginDTO request);
    }
}
