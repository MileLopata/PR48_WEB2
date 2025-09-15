using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserBackend.DTO;
using UserBackend.Interfaces;
using UserBackend.Response;

namespace UserBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            if (id <= 0)
                return BadRequest(new { error = "Invalid user ID." });

            var result = await _userService.GetUser(id);

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(new { error = result.Message });

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(new { error = result.Message });

            return StatusCode(StatusCodes.Status500InternalServerError, new { error = result.Message });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int parsedUserId))
                return Unauthorized("User ID in token not found or invalid.");

            var result = await _userService.GetUser(parsedUserId);

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(new { error = result.Message });

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(new { error = result.Message });

            return StatusCode(StatusCodes.Status500InternalServerError, new { error = result.Message });
        }

        [HttpGet("me/profile-picture")]
        public async Task<IActionResult> GetProfilePicture()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int parsedUserId))
                return Unauthorized("User ID in token not found or invalid.");

            var result = await _userService.GetProfilePicture(parsedUserId);

            if (result.Status != ResponseStatus.OK || result.Data == null)
                return NotFound();

            return File(result.Data, GetMimeType(result.Data));
        }

        string GetMimeType(byte[] bytes)
        {
            if (bytes.Length < 4) return "application/octet-stream";
            if (bytes[0] == 0xFF && bytes[1] == 0xD8) return "image/jpeg";
            if (bytes[0] == 0x89 && bytes[1] == 0x50) return "image/png";
            if (bytes[0] == 0x47 && bytes[1] == 0x49) return "image/gif";
            if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes.Length > 11 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
                return "image/webp";
            return "application/octet-stream";
        }
    }
}
