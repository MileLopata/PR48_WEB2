using Microsoft.AspNetCore.Identity;
using UserBackend.DTO.UserDTO;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Response;
using UserBackend.UserToken;

namespace UserBackend.Service
{
    public class UserAuthentificationService : IUserAuthentificationService
    {
        private readonly IUserRepo _userRepo;
        private readonly TokenProvider _tokenProvider;

        public UserAuthentificationService(IUserRepo userRepo, TokenProvider tokenProvider)
        {
            _userRepo = userRepo;
            _tokenProvider = tokenProvider;
        }

        public async Task<ResponseData<string>> Register(UserRegistrationDTO request)
        {
            try
            {
                bool emailExists = await _userRepo.EmailExistsAsync(request.Email);
                bool usernameExists = await _userRepo.UsernameExistsAsync(request.Username);

                if (emailExists || usernameExists)
                    return new ResponseData<string>
                    {
                        Status = ResponseStatus.BAD_REQUEST,
                        Message = "The email or username is already in use"
                    };

                var user = new User
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
                var token = _tokenProvider.Create(user);

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
            try
            {
                var existingUser = await _userRepo.GetByEmailOrUsernameAsync(request.EmailOrUsername);

                if (existingUser == null)
                    return new ResponseData<string>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "User not found"
                    };

                var hasher = new PasswordHasher<User>();
                var verificationResult = hasher.VerifyHashedPassword(existingUser, existingUser.PasswordHash, request.Password);

                if (verificationResult == PasswordVerificationResult.Failed)
                    return new ResponseData<string>
                    {
                        Status = ResponseStatus.UNAUTHORIZED,
                        Message = "Invalid password"
                    };

                var token = _tokenProvider.Create(existingUser);

                return new ResponseData<string>
                {
                    Data = token,
                    Status = ResponseStatus.OK,
                    Message = "Login successful"
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
    }
}
