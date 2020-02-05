using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace hokkoriAI_admin_tool.DB
{
    public class AppUserDatabaseContext : IdentityDbContext
    {
        public AppUserDatabaseContext(DbContextOptions<AppUserDatabaseContext> options)
        : base(options)
        {

        }

        public DbSet<IdentityUser> People { get; set; }
    }
}
