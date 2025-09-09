using UserBackend.DTO;
using UserBackend.Response;

namespace UserBackend.Interfaces
{
    public interface IUserAuthentificationService
    {
        Task<ResponseData<string>> Register(UserRegistrationDTO request);
        Task<ResponseData<string>> Login(UserLoginDTO request);
    }
}
