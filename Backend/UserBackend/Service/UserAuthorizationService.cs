using Microsoft.AspNetCore.Identity;
using UserBackend.DTO;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Response;
using UserBackend.UserToken;



namespace UserBackend.Service
{
    public class UserAuthorizationService : IUserAuthorizationService
    {
        private readonly IUserRepo _userRepo;
        private readonly TokenProvider _tokenProvider;

        public UserAuthorizationService(IUserRepo userRepo, TokenProvider tokenProvider)
        {
            _userRepo = userRepo;
            _tokenProvider = tokenProvider;
        }


        public async Task<ResponseData<string>> Register(UserRegistrationDTO request)
        {
            try
            {
                if (await _userRepo.EmailExistsAsync(request.Email) ||
                    await _userRepo.UsernameExistsAsync(request.Username))
                {
                    return new ResponseData<string>
                    {
                        Status = ResponseStatus.BAD_REQUEST,
                        Message = "The email or username is already in use"
                    };
                }

                User user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = new PasswordHasher<User>().HashPassword(null!, request.Password)
                };

                if (request.ProfilePicture != null && request.ProfilePicture.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await request.ProfilePicture.CopyToAsync(ms);
                    user.ProfilePicture = ms.ToArray();
                }

                await _userRepo.AddAsync(user);

                string token = _tokenProvider.Create(user);

                return new ResponseData<string>
                {
                    Data = token,
                    Status = ResponseStatus.CREATED,
                    Message = "Registration successful"
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<string>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while processing your request: {ex.Message}"
                };
            }
        }
        public async Task<ResponseData<string>> Login(UserLoginDTO request)
        {
            throw new NotImplementedException();
        }
    }
}
