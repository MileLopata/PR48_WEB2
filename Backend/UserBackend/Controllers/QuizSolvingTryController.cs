using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserBackend.DTO.QuizSolvingTryDTO;
using UserBackend.Interfaces;
using UserBackend.Response;
using UserBackend.Service;

namespace UserBackend.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class QuizSolvingTryController : ControllerBase
    {
        private readonly IQuizSolvingTryService _quizSolvingTryService;

        public QuizSolvingTryController(IQuizSolvingTryService quizSolvingTryService)
        {
            _quizSolvingTryService = quizSolvingTryService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateQuizAttempt([FromBody] CreateQuizSolvingTryRequestDTO request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrWhiteSpace(userIdClaim.Value))
                return Unauthorized("User ID not found in the token.");

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("User ID in token is invalid.");

            var result = await _quizSolvingTryService.CreateQuizSolvingTryAsync(userId, request);

            if (result.Status == ResponseStatus.CREATED && result.Data != null)
                return CreatedAtAction(nameof(GetQuizAttempt), new { id = result.Data.Id }, result.Data);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizAttempt(int id)
        {
            var result = await _quizSolvingTryService.GetQuizSolvingTryAsync(id);

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound();

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuizAttempt(int id)
        {
            var result = await _quizSolvingTryService.DeleteQuizSolvingTryAsync(id);

            if (result.Status == ResponseStatus.OK)
                return Ok();

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound();

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("leaderboard/{quizId}")]
        public async Task<IActionResult> GetAllForOneQuiz(int quizId)
        {
            var result = await _quizSolvingTryService.GetLeaderboardByQuiz(quizId);

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("leaderboard/me")]
        [Authorize]
        public async Task<IActionResult> GetAllAttemptsByUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("User ID in token not found or invalid.");

            var result = await _quizSolvingTryService.GetSolvingTriesByUser(userId);

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("admin/all-results")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllQuizResults()
        {
            var result = await _quizSolvingTryService.GetAllQuizResults();

            if (result.Status == ResponseStatus.OK && result.Data != null)
                return Ok(result.Data);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }
    }
}
