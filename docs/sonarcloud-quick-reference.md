# SonarCloud Quick Reference

## Quick Links

- **SonarCloud Dashboard**: https://sonarcloud.io/project/overview?id=<your-project-key>
- **Setup Guide**: [sonarcloud-setup.md](./sonarcloud-setup.md)
- **GitHub Actions**: [.github/workflows/sonarcloud.yml](../.github/workflows/sonarcloud.yml)

## Local Analysis

### Run analysis locally (requires sonar-scanner CLI)

```bash
# Install sonar-scanner globally (one-time setup)
npm install -g sonar-scanner

# Run tests with coverage and analyze
npm run sonar:scan:local
```

### Quick scan without tests

```bash
npm run sonar:scan
```

**Note**: Local scans require environment variables:

```bash
export SONAR_TOKEN=<your-token>
export SONAR_ORGANIZATION=<your-org>
export SONAR_PROJECT_KEY=<your-project>
```

## CI/CD Integration

### Automatic Triggers

The SonarCloud workflow runs automatically on:

- ✅ Pull requests to `main`
- ✅ Pushes to `main`, `feature/**`, `fix/**` branches
- ✅ Manual workflow dispatch

### Viewing Results

1. **In GitHub PR**:
   - SonarCloud bot comments with analysis summary
   - Click "View analysis" for detailed report

2. **In SonarCloud Dashboard**:
   - Navigate to project dashboard
   - View issues, coverage, duplications, etc.

3. **In GitHub Actions**:
   - Check workflow run status in Actions tab
   - Review logs if analysis fails

## Understanding Metrics

### Quality Gate Criteria

| Metric                       | Threshold | Description                      |
| ---------------------------- | --------- | -------------------------------- |
| Coverage on New Code         | ≥ 80%     | Percentage of new code covered   |
| Duplicated Lines on New Code | ≤ 3%      | Duplicated code percentage       |
| Maintainability Rating       | A         | Technical debt ratio             |
| Reliability Rating           | A         | Bug severity and count           |
| Security Rating              | A         | Vulnerability severity and count |

### Issue Severities

- 🔴 **Blocker**: Critical bugs that must be fixed immediately
- 🔴 **Critical**: High-impact issues requiring urgent attention
- 🟡 **Major**: Significant issues that should be addressed soon
- 🟢 **Minor**: Low-impact issues
- 🔵 **Info**: Suggestions for improvement

## Common Tasks

### Exclude a file from analysis

Edit `sonar-project.properties`:

```properties
sonar.exclusions=**/path/to/file.ts,**/path/to/directory/**
```

### Mark code as false positive

In SonarCloud dashboard:

1. Navigate to the issue
2. Click "..." → "Resolve as"
3. Select "False Positive" or "Won't Fix"
4. Add a comment explaining why

### View coverage for a specific file

1. Go to SonarCloud project dashboard
2. Click "Code" tab
3. Navigate to the file
4. Coverage highlights show covered/uncovered lines

### Check PR decoration status

**If SonarCloud is not commenting on PRs:**

1. Verify GitHub App is installed
2. Check workflow permissions in `sonarcloud.yml`
3. Ensure `GITHUB_TOKEN` has PR read/write access

## Troubleshooting

### Analysis fails with "No coverage data"

**Solution**: Ensure tests generate LCOV reports

```bash
# Verify coverage files exist
ls -la coverage/**/lcov.info
```

### "Project not found" error

**Solution**: Verify secrets are set correctly

```bash
# In GitHub: Settings → Secrets → Actions
# Required: SONAR_TOKEN, SONAR_ORGANIZATION, SONAR_PROJECT_KEY
```

### High memory usage during scan

**Solution**: Adjust Node.js memory for large projects

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run sonar:scan:local
```

### Branch analysis not working

**Solution**: Ensure branch name is passed correctly

```bash
sonar-scanner -Dsonar.branch.name=$(git branch --show-current)
```

## Best Practices

### Before Pushing Code

```bash
# Run local quality checks
npm run lint
npm run test -- --coverage
npm run build
```

### Addressing Issues

1. **Prioritize blockers and critical issues first**
2. **Review security vulnerabilities immediately**
3. **Keep technical debt low** - address major issues in same PR
4. **Maintain test coverage** - add tests for new code

### Reviewing PRs

- ✅ Check SonarCloud status before approving
- ✅ Verify no new blockers/critical issues introduced
- ✅ Ensure coverage doesn't decrease significantly
- ✅ Review security hotspots

## Configuration Files

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `sonar-project.properties`         | SonarCloud analysis configuration  |
| `.github/workflows/sonarcloud.yml` | GitHub Actions workflow            |
| `.gitignore`                       | Excludes `.scannerwork/` artifacts |

## NPM Scripts

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `npm run sonar:scan`       | Run SonarCloud analysis (no tests)    |
| `npm run sonar:scan:local` | Run tests with coverage, then analyze |

## Quality Gate Badge

Add to README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=<project-key>&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=<project-key>)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=<project-key>&metric=coverage)](https://sonarcloud.io/summary/new_code?id=<project-key>)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=<project-key>&metric=bugs)](https://sonarcloud.io/summary/new_code?id=<project-key>)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=<project-key>&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=<project-key>)
```

## Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [TypeScript Analysis](https://docs.sonarcloud.io/enriching/languages/typescript/)
- [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)
- [Pull Request Decoration](https://docs.sonarcloud.io/enriching/pr-decoration/)
- [GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)

## Support

- **Internal**: Check [sonarcloud-setup.md](./sonarcloud-setup.md)
- **SonarCloud Issues**: [Community Forum](https://community.sonarsource.com/)
- **GitHub Integration**: [SonarSource GitHub Issues](https://github.com/SonarSource/sonarcloud-github-action/issues)
