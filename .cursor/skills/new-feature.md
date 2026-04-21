# Skill: New Feature

Use this skill when a developer asks to implement a new feature or JIRA story.

## Steps

1. **Load context**
   - Read `AGENTS.md`
   - If a JIRA ticket ID is provided (e.g. NCO-1234), fetch the story using the Atlassian MCP and extract the Acceptance Criteria as the technical requirements
   - Read `AGENTS/00-architecture.md` and `AGENTS/01-services.md`

2. **Expand the requirement**
   - Identify which files need to change
   - Check if the required service methods already exist (AGENTS/01-services.md)
   - Check if the required UI components already exist (libs/shared/ui/)
   - Determine if a new feature module is needed (AGENTS/04-feature-scaffold.md)

3. **Create a structured todo list**
   - Use the TodoWrite tool to create an ordered, dependency-aware task list
   - Include: service method → component → template → tests → docs → git

4. **Implement each todo item**
   - Follow AGENTS/03-angular-conventions.md for all Angular code
   - Follow AGENTS/07-security.md for all security-sensitive code
   - Check AGENTS/08-bug-patterns.md before committing each file

5. **Write tests**
   - Follow AGENTS/05-test-standards.md
   - Run `npx nx test <project>`

6. **Verify**

   ```bash
   npx nx affected -t lint
   npx nx affected -t build
   npx nx affected -t test
   ```

7. **Commit and PR**
   - Follow AGENTS/06-git-workflow.md
   - Branch: `feature/<description>` or `feat(NCO-XXXX)/<description>`
   - Commit: `feat: <description>` or `feat(NCO-XXXX): <description>`
   - Create PR: `gh pr create --title "..." --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" --base main`
