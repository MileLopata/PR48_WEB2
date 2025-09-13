using AutoMapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using UserBackend.DTO.QuestionDTO;
using UserBackend.DTO.QuizDTO;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Model.Enums;
using UserBackend.Response;

namespace UserBackend.Service
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepo _quizRepo;
        private readonly IQuestionRepo _questionRepo;
        private readonly IMapper _mapper;   
        public QuizService(IQuizRepo quizRepo, IQuestionRepo questionRepo, IMapper mapper)
        {
            _quizRepo = quizRepo;
            _questionRepo = questionRepo;
            _mapper = mapper;
        }
        public async Task<ResponseData<QuestionDTO>> CreateQuestionAsync(CreateQuestionDTO request)
        {
            try
            {
                if (request.AnswerOptions.Count == 0)
                {
                    return new ResponseData<QuestionDTO>
                    {
                        Status = ResponseStatus.BAD_REQUEST,
                        Message = "At least one answer option is required."
                    };
                }
                Quiz? quiz = await _quizRepo.GetByIdAsync(request.QuizId);
                if (quiz is null)
                {
                    return new ResponseData<QuestionDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = $"Quiz with id {request.QuizId} not found."
                    };
                }
                Question question = new Question
                {
                    QuizId = request.QuizId,
                    Text = request.Text,
                    Points = request.Points,
                    Type = request.Type,
                    AnswerOptions = request.AnswerOptions.Select(a => new QuestionAnswerOption
                    {
                        Text = a.Text,
                        IsCorrect = a.IsCorrect,
                        FillInTheBlankCorrectAnswer = a.FillInTheBlankCorrectAnswer
                    }).ToList()
                };

                await _questionRepo.AddAsync(question);
                quiz.NumberOfQuestions++;

                await _questionRepo.SaveChangesAsync();
                await _quizRepo.SaveChangesAsync();

                QuestionDTO questionDTO = _mapper.Map<QuestionDTO>(question);

                return new ResponseData<QuestionDTO>(questionDTO, ResponseStatus.CREATED, "Question created successfully.");
            }
            catch (Exception ex)
            {
                return new ResponseData<QuestionDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while creating the question: {ex.Message}"
                };
            }
        }

        public async Task<ResponseData<QuizDTO>> CreateQuizAsync(CreateQuizRequestDTO request)
        {
            try
            {
                if(string.IsNullOrWhiteSpace(request.Title))
                {
                    return new ResponseData<QuizDTO>
                    {
                        Status = ResponseStatus.BAD_REQUEST,
                        Message = "Quiz title cannot be empty."
                    };
                }

                Quiz quiz = new Quiz
                {
                    Title = request.Title,
                    Description = request.Description ?? string.Empty,
                    LevelOfDifficulty = request.LevelOfDifficulty,
                    TimeLimit = request.TimeLimit,
                    Subjects = request.Subjects.Select(s => new QuizSubjectLink { Subject = s }).ToList()
                };

                Quiz? createdQuiz = await _quizRepo.AddAsync(quiz);

                QuizDTO quizDTO = _mapper.Map<QuizDTO>(createdQuiz);

                return new ResponseData<QuizDTO>(quizDTO, ResponseStatus.CREATED, "Quiz created successfully.");    
            }
            catch(Exception ex)
            {
                return new ResponseData<QuizDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while creating the quiz: {ex.Message}"
                };
            }
        }

        public async Task<ResponseData<bool>> DeleteQuestionAsync(int questionId)
        {
            try
            {
                Question? question = await _questionRepo.GetByIdAsync(questionId);
                if (question is null)
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = $"Question with id {questionId} not found.",
                        //Data = false
                    };
                }
                await _questionRepo.DeleteAsync(questionId);

                Quiz? quiz = await _quizRepo.GetByIdAsync(question.QuizId);
                if (quiz is not null)
                {
                    quiz.NumberOfQuestions--;
                    await _quizRepo.UpdateAsync(quiz);
                }

                await _questionRepo.SaveChangesAsync();
                await _quizRepo.SaveChangesAsync();
                
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.OK,
                    Message = "Question deleted successfully.",
                    Data = true
                };
            }
            catch (DbUpdateException dbEx) when (dbEx.InnerException is SqlException sqlEx && sqlEx.Number == 547)
            {
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.CONFLICT,
                    Message = "Cannot delete question: it is referenced by existing user answers."
                };
            }
            catch (Exception ex)
            {
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = "An error occurred while deleting the question",
                    Data = false
                };
            }
        }

        public async Task<ResponseData<bool>> DeleteQuizAsync(int id)
        {
            try
            {
                Quiz? quiz =  _quizRepo.GetByIdAsync(id).Result;
                if(quiz is null)
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz not found.",
                        Data = false
                    };
                }
                bool isDeleted = await _quizRepo.DeleteAsync(id);
                /*
                if(isDeleted)
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.OK,
                        Message = "Quiz deleted successfully.",
                        Data = true
                    };
                }
                else
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                        Message = "Failed to delete the quiz.",
                        Data = false
                    };
                }
                */
                if (!isDeleted)
                {
                    return new ResponseData<bool>
                    {
                        Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                        Message = "Failed to delete the quiz.",
                        Data = false
                    };
                }
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.OK,
                    Message = "Quiz deleted successfully.",
                    Data = true
                };
            } catch(Exception ex)
            {
                return new ResponseData<bool>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while deleting the quiz: {ex.Message}",
                    Data = false
                };
            }
        }

        public async Task<List<QuizDTO>> GetAllQuizzesAsync()
        {
            IEnumerable<Quiz> quizzes = await _quizRepo.GetAllAsync();

            return quizzes.Select(quiz => new QuizDTO 
            { 
                Id = quiz.Id,
                Title = quiz.Title, 
                Description = quiz.Description,
                LevelOfDifficulty = quiz.LevelOfDifficulty,
                NumberOfQuestions = quiz.NumberOfQuestions,
                Subjects = quiz.Subjects.Select(s => s.Subject).ToList(),
                TimeLimit = quiz.TimeLimit
            }).ToList();
        }

        public async Task<ResponseData<QuestionDTO>> GetQuestionAsync(int questionId)
        {
            try
            {
                Question? question = await _questionRepo.GetByIdAsync(questionId);
                if (question is null)
                {
                    return new ResponseData<QuestionDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = $"Question with id {questionId} not found."
                    };
                }
                QuestionDTO questionDTO = _mapper.Map<QuestionDTO>(question);
                return new ResponseData<QuestionDTO>(questionDTO, ResponseStatus.OK, "Question retrieved successfully.");
            }
            catch (Exception ex)
            {
                return new ResponseData<QuestionDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while retrieving the question: {ex.Message}"
                };
            }
        }

        public async Task<List<QuestionDTO>?> GetQuizQuestions(int quizId)
        {
            try
            {
                Quiz? quiz = await _quizRepo.GetByIdAsync(quizId);
                if(quiz is null)
                {
                    return null;
                }   
                IEnumerable<Question> questions = await _questionRepo.GetAllByQuizIdAsync(quizId);

                List<QuestionDTO> questionDTOs = _mapper.Map<List<QuestionDTO>>(questions);

                return questionDTOs;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public async Task<ResponseData<QuizDTO>> GetQuizWithoutQuestions(int quizId)
        {
            try
            {
                Quiz? quiz = await _quizRepo.GetByIdAsync(quizId);
                if(quiz is null)
                {
                    return new ResponseData<QuizDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz not found."
                    };
                }
                QuizDTO quizDTO = _mapper.Map<QuizDTO>(quiz);

                return new ResponseData<QuizDTO>(quizDTO, ResponseStatus.OK, "Quiz retrieved successfully.");
            }catch(Exception ex)
            {
                return new ResponseData<QuizDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while retrieving the quiz: {ex.Message}"
                };
            }
        }

        public async Task<ResponseData<QuestionDTO>> UpdateQuestionAsync(int id, UpdateQuestionRequestDTO request)
        {
            try
            {
                Question? existingQuestion = await _questionRepo.GetByIdAsync(id);
                if (existingQuestion is null)
                {
                    return new ResponseData<QuestionDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = $"Question with id {id} not found."
                    };
                }

                existingQuestion.Type = request.Type;
                existingQuestion.Text = request.Text;
                existingQuestion.Points = request.Points; 

                existingQuestion.AnswerOptions.Clear();
                foreach (QuestionAnswerOptionDTO optionDTO in request.AnswerOptions)
                {
                    existingQuestion.AnswerOptions.Add(new QuestionAnswerOption
                    {
                        Text = optionDTO.Text,
                        IsCorrect = optionDTO.IsCorrect,
                        FillInTheBlankCorrectAnswer = optionDTO.FillInTheBlankCorrectAnswer
                    });
                }

                await _questionRepo.UpdateAsync(existingQuestion);
                await _questionRepo.SaveChangesAsync();

                QuestionDTO questionDTO = _mapper.Map<QuestionDTO>(existingQuestion);
                return new ResponseData<QuestionDTO>(questionDTO, ResponseStatus.OK, "Question updated successfully.");
            }
            catch (Exception ex)
            {
                return new ResponseData<QuestionDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = "An error occurred while updating the question"
                };
            }
        }

        public async Task<ResponseData<QuizDTO>> UpdateQuizAsync(int id, UpdateQuizRequestDTO request)
        {
            try
            {
                var quiz = await _quizRepo.GetByIdAsync(id);
                if (quiz is null)
                {
                    return new ResponseData<QuizDTO>
                    {
                        Status = ResponseStatus.NOT_FOUND,
                        Message = "Quiz not found."
                    };
                }

                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    return new ResponseData<QuizDTO>
                    {
                        Status = ResponseStatus.BAD_REQUEST,
                        Message = "Quiz title cannot be empty."
                    };
                }

                quiz.Title = request.Title;
                quiz.Description = request.Description ?? string.Empty;
                quiz.LevelOfDifficulty = request.LevelOfDifficulty;
                quiz.TimeLimit = request.TimeLimit;

                var newSubjects = request.Subjects ?? new List<QuizSubject>();
                var existingSubjects = quiz.Subjects.Select(s => s.Subject).ToList();

                var newSubjectsSet = new HashSet<QuizSubject>(newSubjects);
                var existingSubjectsSet = new HashSet<QuizSubject>(existingSubjects);

                bool subjectsChanged = !newSubjectsSet.SetEquals(existingSubjectsSet);

                if (subjectsChanged)
                {
                    quiz.Subjects.Clear();
                    foreach (QuizSubject subject in newSubjects)
                    {
                        quiz.Subjects.Add(new QuizSubjectLink { QuizId = quiz.Id, Subject = subject });
                    }
                }

                Quiz? updatedQuiz = await _quizRepo.UpdateAsync(quiz);
                QuizDTO quizDTO = _mapper.Map<QuizDTO>(updatedQuiz);

                return new ResponseData<QuizDTO>(quizDTO, ResponseStatus.OK, "Quiz updated successfully.");
            }
            catch (Exception ex)
            {
                return new ResponseData<QuizDTO>
                {
                    Status = ResponseStatus.INTERNAL_SERVER_ERROR,
                    Message = $"An error occurred while updating the quiz: {ex.Message}"
                };
            }
        }
    }
}
