using Microsoft.AspNetCore.Mvc;
using UserBackend.DTO;
using UserBackend.Interfaces;
using UserBackend.Response;

namespace UserBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthentificationController(IUserAuthentificationService userAuthentificationService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] UserRegistrationDTO request)
        {
            var response = await userAuthentificationService.Register(request);

            return response.Status switch
            {
                ResponseStatus.CREATED => Ok(new { token = response.Data, message = response.Message }),
                ResponseStatus.BAD_REQUEST => BadRequest(new { error = response.Message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError, new { error = response.Message })
            };
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO request)
        {
            var response = await userAuthentificationService.Login(request);
            return response.Status switch
            {
                ResponseStatus.OK => Ok(new { token = response.Data, message = response.Message }),
                ResponseStatus.BAD_REQUEST => BadRequest(new { error = response.Message }),
                ResponseStatus.NOT_FOUND => NotFound(new { error = response.Message }),
                _ => StatusCode(StatusCodes.Status500InternalServerError, new { error = response.Message })
            };
        }
    }
}
