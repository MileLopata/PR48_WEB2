using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserBackend.DTO.QuestionDTO;
using UserBackend.DTO.QuizDTO;
using UserBackend.Interfaces;
using UserBackend.Response;

namespace UserBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequestDTO request)
        {
            var result = await _quizService.CreateQuizAsync(request);

            return result.Status switch
            {
                ResponseStatus.CREATED =>
                    CreatedAtAction(nameof(GetQuiz), new { id = result.Data!.Id }, result.Data),
                ResponseStatus.BAD_REQUEST => BadRequest(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            var result = await _quizService.GetQuizWithoutQuestions(id);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] UpdateQuizRequestDTO request)
        {
            var result = await _quizService.UpdateQuizAsync(id, request);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                ResponseStatus.BAD_REQUEST => BadRequest(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var result = await _quizService.GetAllQuizzesAsync();
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var result = await _quizService.DeleteQuizAsync(id);
            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Message),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }
        //////

        [HttpGet("{quizId:int}/questions")]
        public async Task<IActionResult> GetQuizQuestions(int quizId)
        {
            List<QuestionDTO>? result = await _quizService.GetQuizQuestions(quizId);

            if (result == null)
            {
                return NotFound($"Quiz with ID {quizId} not found.");
            }
            return Ok(result);
        }

        [HttpPost("{quizId:int}/questions")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateQuestion(int quizId, [FromBody] CreateQuestionRequestDTO requestDto)
        {
            var dto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Text = requestDto.Text,
                Points = requestDto.Points,
                Type = requestDto.Type,
                AnswerOptions = requestDto.AnswerOptions
            };

            var result = await _quizService.CreateQuestionAsync(dto);

            return result.Status switch
            {
                ResponseStatus.CREATED => CreatedAtAction(
                    nameof(GetQuestion),
                    new { quizId, questionId = result.Data?.Id },
                    result.Data),
                ResponseStatus.BAD_REQUEST => BadRequest(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpGet("{quizId}/questions/{questionId}")]
        public async Task<IActionResult> GetQuestion(int quizId, int questionId)
        {
            var result = await _quizService.GetQuestionAsync(questionId);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpPut("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateQuestion(int quizId, int questionId, [FromBody] UpdateQuestionRequestDTO request)
        {
            if (quizId <= 0)
            {
                return BadRequest("Invalid Quiz Id");
            }

            if (questionId <= 0)
            {
                return BadRequest("Invalid Question Id");
            }

            var result = await _quizService.UpdateQuestionAsync(questionId, request);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Data),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                ResponseStatus.BAD_REQUEST => BadRequest(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }

        [HttpDelete("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteQuestion(int quizId, int questionId)
        {
            var result = await _quizService.DeleteQuestionAsync(questionId);

            return result.Status switch
            {
                ResponseStatus.OK => Ok(result.Message),
                ResponseStatus.NOT_FOUND => NotFound(result.Message),
                ResponseStatus.CONFLICT => Conflict(result.Message),
                _ => StatusCode(StatusCodes.Status500InternalServerError, result.Message)
            };
        }
    }
}
