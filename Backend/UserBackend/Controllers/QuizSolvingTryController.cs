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
            string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in the token.");
            }

            ResponseData<CreateQuizSolvingTryResponseDTO> result = await _quizSolvingTryService.CreateQuizSolvingTryAsync(int.Parse(userId), request);

            return result.Status switch
            {
                ResponseStatus.CREATED => CreatedAtAction(nameof(GetQuizAttempt), new { id = result.Data?.Id }, result.Data),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizAttempt(int id)
        {
            ResponseData<GetQuizSolvingTryResponseDTO> result = await _quizSolvingTryService.GetQuizSolvingTryAsync(id);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                ResponseStatus.NOT_FOUND => NotFound(),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuizAttempt(int id)
        {
            var result = await _quizSolvingTryService.DeleteQuizSolvingTryAsync(id);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(),
                ResponseStatus.NOT_FOUND => NotFound(),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet("leaderboard/{quizId}")]
        public async Task<IActionResult> GetAllForOneQuiz(int quizId)
        {
            ResponseData<List<GetQuizLeaderboardDTO>> result = await _quizSolvingTryService.GetLeaderboardByQuiz(quizId);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet("leaderboard/me")]
        [Authorize]
        public async Task<IActionResult> GetAllAttemptsByUser()
        {
            string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userId, out int parsedUserId))
            {
                return Unauthorized("User ID in token not found or invalid.");
            }

            ResponseData<List<GetQuizSolvingTryResponseDTO>> result = await _quizSolvingTryService.GetSolvingTriesByUser(parsedUserId);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }
    }
}
