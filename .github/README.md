# GitHub Actions Workflows

This repository includes several automated workflows to maintain code quality and ensure smooth deployments.

## Workflows

### 1. Auto Update (`auto-update.yml`)
- **Trigger:** Push to master, PRs, daily schedule, manual
- **Purpose:** Automatically updates and commits changes
- **Features:**
  - Runs linting and build checks
  - Commits any generated changes
  - Pushes updates automatically

### 2. Vercel Deploy (`vercel-deploy.yml`)
- **Trigger:** Push to master, PRs
- **Purpose:** Automatically deploys to Vercel
- **Requirements:**
  - `VERCEL_TOKEN` secret
  - `ORG_ID` secret
  - `PROJECT_ID` secret
  - `VERCEL_SCOPE` secret

### 3. Code Quality (`code-quality.yml`)
- **Trigger:** Push to master/develop, PRs
- **Purpose:** Ensures code quality and security
- **Features:**
  - ESLint checks
  - TypeScript type checking
  - Build verification
  - Security audit
  - Artifact upload

### 4. Testing (`test.yml`)
- **Trigger:** Push to master/develop, PRs, daily schedule
- **Purpose:** Automated testing
- **Features:**
  - Multi-Node.js version testing
  - Build testing
  - Bundle size checking
  - E2E health checks

### 5. Dependency Update (`dependency-update.yml`)
- **Trigger:** Weekly schedule, manual
- **Purpose:** Keeps dependencies up to date
- **Features:**
  - Updates npm packages
  - Fixes security vulnerabilities
  - Creates PRs for major updates

## Setup Instructions

### 1. Enable GitHub Actions
- Go to repository Settings > Actions
- Enable "Allow all actions and reusable workflows"

### 2. Add Required Secrets
Go to Settings > Secrets and variables > Actions:

```
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_org_id
PROJECT_ID=your_project_id
VERCEL_SCOPE=your_scope
```

### 3. Configure Branch Protection
- Go to Settings > Branches
- Add rule for master branch
- Require status checks to pass
- Require branches to be up to date

## Monitoring

### View Workflow Runs
- Go to Actions tab in GitHub
- Click on any workflow to see details
- Check logs for debugging

### Notifications
- Workflows will send notifications on failure
- Check email or GitHub notifications

## Troubleshooting

### Common Issues
1. **Build Failures:** Check Node.js version compatibility
2. **Secret Errors:** Verify all required secrets are set
3. **Permission Issues:** Ensure GitHub token has proper permissions

### Debug Steps
1. Check workflow logs
2. Verify environment variables
3. Test locally with same Node.js version
4. Check dependency compatibility

## Customization

### Modify Triggers
Edit the `on:` section in each workflow file:
```yaml
on:
  push:
    branches: [ master, develop ]
  schedule:
    - cron: '0 2 * * *'
```

### Add New Steps
Add steps to any workflow:
```yaml
- name: Your Step
  run: your-command
  env:
    YOUR_VAR: ${{ secrets.YOUR_SECRET }}
```
