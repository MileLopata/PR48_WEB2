using Microsoft.AspNetCore.Mvc;
using UserBackend.DTO.UserDTO;
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

            if (response.Status == ResponseStatus.CREATED)
            {
                return Ok(new { token = response.Data, message = response.Message });
            }
            else if (response.Status == ResponseStatus.BAD_REQUEST)
            {
                return BadRequest(new { error = response.Message });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = response.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO request)
        {
            var response = await userAuthentificationService.Login(request);

            if (response.Status == ResponseStatus.OK)
            {
                return Ok(new { token = response.Data, message = response.Message });
            }
            else if (response.Status == ResponseStatus.BAD_REQUEST)
            {
                return BadRequest(new { error = response.Message });
            }
            else if (response.Status == ResponseStatus.NOT_FOUND)
            {
                return NotFound(new { error = response.Message });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = response.Message });
            }
        }
    }
}
