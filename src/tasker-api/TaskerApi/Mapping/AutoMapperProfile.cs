using AutoMapper;
using TaskerApi.Controllers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;

namespace TaskerApi.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // User mappings
            CreateMap<UserEntity, UserResponse>();
            CreateMap<UserEntity, UserDetailedResponse>();

            // Action mappings
            CreateMap<ActionEntity, ActionResponse>();

            // Area mappings
            CreateMap<AreaEntity, AreaResponse>();
            CreateMap<AreaStatistics, AreaStatisticsResponse>();

            // Task mappings
            CreateMap<TaskEntity, TaskResponse>();
            CreateMap<TaskStatistics, TaskStatisticsResponse>();

            // Tag mappings
            CreateMap<TagEntity, TagResponse>();
            CreateMap<TagStatistics, TagStatisticsResponse>();
            CreateMap<TagUsage, TagUsageResponse>();

            // Rule mappings
            CreateMap<RuleEntity, RuleResponse>();

            // File mappings
            CreateMap<FileEntity, FileResponse>();
            CreateMap<FileAreaStatistics, FileAreaStatisticsResponse>();

            // AreaMembership mappings
            CreateMap<AreaMembershipEntity, AreaMembershipResponse>();

            // UserActionLog mappings
            CreateMap<UserActionLogEntity, UserActionLogResponse>();

            // Reference mappings
            CreateMap<TaskStatusRefEntity, TaskStatusRefResponse>();
            CreateMap<VisibilityRefEntity, VisibilityRefResponse>();
            CreateMap<ActionVerbEntity, ActionVerbResponse>();
            CreateMap<RelationKindRefEntity, RelationKindRefResponse>();
        }
    }
}
