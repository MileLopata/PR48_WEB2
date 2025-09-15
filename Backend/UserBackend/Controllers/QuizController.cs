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

            if (result.Status == ResponseStatus.CREATED && result.Data != null)
                return CreatedAtAction(nameof(GetQuiz), new { id = result.Data.Id }, result.Data);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            var result = await _quizService.GetQuizWithoutQuestions(id);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] UpdateQuizRequestDTO request)
        {
            var result = await _quizService.UpdateQuizAsync(id, request);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();
            return quizzes.Count > 0 ? Ok(quizzes) : NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var result = await _quizService.DeleteQuizAsync(id);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Message);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("{quizId:int}/questions")]
        public async Task<IActionResult> GetQuizQuestions(int quizId)
        {
            var questions = await _quizService.GetQuizQuestions(quizId);

            if (questions == null)
                return NotFound($"Quiz with ID {quizId} not found.");

            return Ok(questions);
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

            if (result.Status == ResponseStatus.CREATED && result.Data != null)
                return CreatedAtAction(nameof(GetQuestion), new { quizId, questionId = result.Data.Id }, result.Data);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpGet("{quizId}/questions/{questionId}")]
        public async Task<IActionResult> GetQuestion(int quizId, int questionId)
        {
            var result = await _quizService.GetQuestionAsync(questionId);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpPut("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateQuestion(int quizId, int questionId, [FromBody] UpdateQuestionRequestDTO request)
        {
            if (quizId <= 0 || questionId <= 0)
                return BadRequest("Invalid Quiz or Question Id");

            var result = await _quizService.UpdateQuestionAsync(questionId, request);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Data);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            if (result.Status == ResponseStatus.BAD_REQUEST)
                return BadRequest(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }

        [HttpDelete("{quizId}/questions/{questionId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteQuestion(int quizId, int questionId)
        {
            var result = await _quizService.DeleteQuestionAsync(questionId);

            if (result.Status == ResponseStatus.OK)
                return Ok(result.Message);

            if (result.Status == ResponseStatus.NOT_FOUND)
                return NotFound(result.Message);

            if (result.Status == ResponseStatus.CONFLICT)
                return Conflict(result.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, result.Message);
        }
    }
}
