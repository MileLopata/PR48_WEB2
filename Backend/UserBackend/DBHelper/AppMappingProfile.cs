using AutoMapper;
using UserBackend.DTO.QuestionDTO;
using UserBackend.DTO.QuizDTO;
using UserBackend.DTO.QuizSolvingTryDTO;
using UserBackend.Model;

namespace UserBackend.DBHelper
{
    public class AppMappingProfile : Profile
    {
        public AppMappingProfile()
        {
            CreateMap<Quiz, QuizDTO>()
                .ForMember(
                    dest => dest.Subjects,
                    opt => opt.MapFrom(src => src.Subjects.Select(c => c.Subject).ToList())
                );

            CreateMap<QuizDTO, Quiz>()
                .ForMember(
                    dest => dest.Subjects,
                    opt => opt.Ignore()
                );

            CreateMap<Question, QuestionDTO>();
            CreateMap<QuestionAnswerOption, QuestionAnswerOptionDTO>();

            CreateMap<QuizSolvingTry, GetQuizSolvingTryResponseDTO>();
            CreateMap<UserAnswer, UserAnswerResponseDTO>();

            CreateMap<QuizSolvingTry, CreateQuizSolvingTryResponseDTO>()
                .ForMember(dest => dest.Results, opt => opt.MapFrom(src => src.UserAnswers));

        }
    }
}
