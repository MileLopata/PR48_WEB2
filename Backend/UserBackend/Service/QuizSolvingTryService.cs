using AutoMapper;
using Microsoft.Identity.Client;
using System.Runtime.CompilerServices;
using UserBackend.DTO.QuizSolvingTryDTO;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Model.Enums;
using UserBackend.Response;

namespace UserBackend.Service
{
    public class QuizSolvingTryService : IQuizSolvingTryService
    {
        private readonly IQuizRepo _quizRepo;
        private readonly IQuizSolvingTryRepo _quizSolvingTryRepo;
        private readonly IUserRepo _userRepo;
        private readonly IMapper _mapper;
        public QuizSolvingTryService(IQuizRepo quizRepo, IQuizSolvingTryRepo quizSolvingTryRepo, IUserRepo userRepo, IMapper mapper)
        {
            _quizRepo = quizRepo;
            _quizSolvingTryRepo = quizSolvingTryRepo;
            _userRepo = userRepo;
            _mapper = mapper;
        }
        public async Task<ResponseData<CreateQuizSolvingTryResponseDTO>> CreateQuizSolvingTryAsync(int userId, CreateQuizSolvingTryRequestDTO request)
        {
            try
            {
                Quiz? quiz = await _quizRepo.GetByIdAsync(request.QuizId);
                if (quiz is null)
                {
                    return new ResponseData<CreateQuizSolvingTryResponseDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz not found"
                    };
                }
                QuizSolvingTry solvingTry = new QuizSolvingTry
                {
                    UserId = userId,
                    QuizId = quiz.Id,
                    AttemptedAt = DateTime.UtcNow,
                    Duration = request.Duration
                };

                double totalScore = 0;
                List<UserAnswerResponseDTO> answerResponses = new();

                foreach (UserAnswerDTO userAnswer in request.Answers)
                {
                    Question? question = quiz.Questions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);
                    if (question is null)
                    {
                        continue;
                    }
                    double pointsAwarded = CalculatePoints(question, userAnswer);
                    totalScore += pointsAwarded;

                    solvingTry.UserAnswers.Add(new UserAnswer
                    {
                        QuestionId = question.Id,
                        SelectedOptionIds = userAnswer.SelectedOptionIds,
                        FillInTheBlankInput = userAnswer.FillInTheBlankInput
                    });

                    answerResponses.Add(new UserAnswerResponseDTO
                    {
                        QuestionId = userAnswer.QuestionId,
                        SelectedOptionIds = userAnswer.SelectedOptionIds,
                        FillInTheBlankInput = userAnswer.FillInTheBlankInput,
                        Score = pointsAwarded
                    });
                }
                solvingTry.Score = totalScore;

                await _quizSolvingTryRepo.AddAsync(solvingTry);
                CreateQuizSolvingTryResponseDTO response = _mapper.Map<CreateQuizSolvingTryResponseDTO>(solvingTry);

                return new ResponseData<CreateQuizSolvingTryResponseDTO>
                {
                    Status = ResponseStatus.CREATED,
                    Message = "Quiz solving try created successfully",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<CreateQuizSolvingTryResponseDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred when solving a quiz"
                };
            }
        }

        public async Task<ResponseData<bool>> DeleteQuizSolvingTryAsync(int id)
        {
            try
            {
                QuizSolvingTry? solvingTry = await _quizSolvingTryRepo.GetByIdAsync(id);
                if(solvingTry is null)
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz solving try not found",
                    };
                }
                await _quizSolvingTryRepo.DeleteAsync(id);
                await _quizSolvingTryRepo.SaveChangesAsync();

                return new ResponseData<bool>
                {
                    Status = ResponseStatus.OK,
                    Message = "Quiz solving try deleted successfully",
                    Data = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred when deleting a quiz solving try {ex.Message}",
                    Data = false
                };
            }
        }

        public async Task<ResponseData<List<GetQuizLeaderboardDTO>>> GetLeaderboardByQuiz(int quizId)
        {
            Quiz? quiz = await _quizRepo.GetByIdAsync(quizId);
            if(quiz is null)
            {
                return new ResponseData<List<GetQuizLeaderboardDTO>>
                {
                    Status = ResponseStatus.NOT_FOUND,
                    Message = "Quiz not found"
                };
            }

            IEnumerable<QuizSolvingTry> solvingTries = await _quizSolvingTryRepo.GetAllSolvingTriesByQuizIdAsync(quizId);

            List<QuizSolvingTry> orderedSolvingTries = solvingTries
                .OrderByDescending(st => st.Score)
                .ThenBy(st => st.Duration)
                .ThenBy(st => st.AttemptedAt)
                .ToList();

            var leaderboard = new List<GetQuizLeaderboardDTO>();
            int position = 0;
            int rankOffset = 1;
            double? lastScore = null;
            TimeSpan? lastDuration = null;

            foreach(var solvingTry in orderedSolvingTries)
            {
                if (lastScore != solvingTry.Score || lastDuration != solvingTry.Duration)
                {
                    position += rankOffset;
                    rankOffset = 1;
                }
                else
                {
                    rankOffset++;
                }
                User? user = await _userRepo.GetByIdAsync(solvingTry.UserId);
                string userName = user?.Username ?? $"User {solvingTry.UserId}";

                leaderboard.Add(new GetQuizLeaderboardDTO
                {
                    QuizId = quizId,
                    UserRankingPosition = position,
                    Username = userName,
                    Score = solvingTry.Score,
                    Duration = solvingTry.Duration,
                    AttemptedAt = solvingTry.AttemptedAt
                });
                lastScore = solvingTry.Score;
                lastDuration = solvingTry.Duration;
                rankOffset++;   
            }

            return new ResponseData<List<GetQuizLeaderboardDTO>>
            {
                Status = ResponseStatus.OK,
                Message = "Quiz leaderboard retrieved successfully",
                Data = leaderboard
            };
        }

        public async Task<ResponseData<GetQuizSolvingTryResponseDTO>> GetQuizSolvingTryAsync(int id)
        {
            try
            {
                QuizSolvingTry? solvingTry = await _quizSolvingTryRepo.GetByIdAsync(id);
                if (solvingTry is null)
                {
                    return new ResponseData<GetQuizSolvingTryResponseDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz solving try not found"
                    };
                }

                GetQuizSolvingTryResponseDTO response = _mapper.Map<GetQuizSolvingTryResponseDTO>(solvingTry);

                return new ResponseData<GetQuizSolvingTryResponseDTO>
                {
                    Status = ResponseStatus.OK,
                    Message = "Quiz solving try retrieved successfully",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<GetQuizSolvingTryResponseDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred when retrieving a quiz solving try {ex.Message}" 
                };
            }
        }

        public async Task<ResponseData<List<GetQuizSolvingTryResponseDTO>>> GetSolvingTriesByQuiz(int quizId)
        {
            Quiz? quiz = await _quizRepo.GetByIdAsync(quizId);
            if(quiz is null)
            {
                return new ResponseData<List<GetQuizSolvingTryResponseDTO>>
                {
                    Status = ResponseStatus.NOT_FOUND,
                    Message = "Quiz not found"
                };
            }

            IEnumerable<QuizSolvingTry> solvingTries = await _quizSolvingTryRepo.GetAllSolvingTriesByQuizIdAsync(quizId);

            List<GetQuizSolvingTryResponseDTO> response = _mapper.Map<List<GetQuizSolvingTryResponseDTO>>(solvingTries);
            
            return new ResponseData<List<GetQuizSolvingTryResponseDTO>>
            {
                Status = ResponseStatus.OK,
                Message = "Quiz solving tries retrieved successfully",
                Data = response
            };
        }

        public async Task<ResponseData<List<GetQuizSolvingTryResponseDTO>>> GetSolvingTriesByUser(int userId)
        {
            try
            {
                IEnumerable<QuizSolvingTry> solvingTries = await _quizSolvingTryRepo.GetAllSolvingTriesByUserIdAsync(userId);

                var solvingTriesList = solvingTries.Select(st => new GetQuizSolvingTryResponseDTO
                {
                    Id = st.Id,
                    QuizId = st.QuizId,
                    UserId = st.UserId,
                    Score = st.Score,
                    Duration = st.Duration,
                    AttemptedAt = st.AttemptedAt,
                    UserAnswers = st.UserAnswers.Select(ua => new UserAnswerResponseDTO
                    {
                        QuestionId = ua.QuestionId,
                        Score = ua.Score,
                        SelectedOptionIds = ua.SelectedOptionIds,
                        FillInTheBlankInput = ua.FillInTheBlankInput
                    }).ToList()
                }).OrderByDescending(st => st.AttemptedAt).ToList();

                return new ResponseData<List<GetQuizSolvingTryResponseDTO>>
                {
                    Status = ResponseStatus.OK,
                    Message = "Quiz solving tries retrieved successfully",
                    Data = solvingTriesList
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<List<GetQuizSolvingTryResponseDTO>>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred when retrieving quiz solving tries for a user {ex.Message}",
                    Data = new List<GetQuizSolvingTryResponseDTO>()
                };
            }
        }
        private double CalculatePoints(Question question, UserAnswerDTO userAnswer)
        {
            double pointsAwarded = 0;

            switch (question.Type)
            {
                case QuestionType.MULTIPLE_CHOICE_ONE_CORRECT:
                case QuestionType.MULTIPLE_CHOICE_MULTIPLE_CORRECT:
                case QuestionType.TRUE_FALSE:
                    {
                        int[] correctOptions = question.AnswerOptions
                            .Where(o => o.IsCorrect == true)
                            .Select(o => o.Id)
                            .OrderBy(id => id)
                            .ToArray();

                        int[]? selectedOptions = userAnswer.SelectedOptionIds?
                            .OrderBy(id => id)
                            .ToArray();
                        if (selectedOptions is null || selectedOptions.Length == 0)
                        {
                            break;
                        }
                        if (correctOptions.SequenceEqual(selectedOptions))
                        {
                            pointsAwarded = question.Points;
                        }
                        break;
                    }
                case QuestionType.FILL_IN_THE_BLANK:
                    {
                        string? correct = question.AnswerOptions.FirstOrDefault()?.FillInTheBlankCorrectAnswer; // TODO, CHANGE MODEL TO USE AnswerOptions[0].Text instead of FillInTheBlankCorrectAnswer
                        if (!string.IsNullOrEmpty(correct) &&
                            string.Equals(userAnswer.FillInTheBlankInput, correct, StringComparison.OrdinalIgnoreCase))
                        {
                            pointsAwarded = question.Points;
                        }

                        break;
                    }
            }
            return pointsAwarded;
        }
        
    }
}
