# php-cs-fix-merge
[![build-test](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/test.yml/badge.svg)](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/test.yml)
[![CodeQL](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/codeql-analysis.yml)

Fix PHP CS Issues and Create Pull request and Merge if provide workflow permissions

## Usage

See [action.yml](./action.yml)

**Basic:**
```yaml
- uses: codeeshop-oc/php-cs-fix-merge@1.0.0  
```

**Full:**
```yaml
- uses: codeeshop-oc/php-cs-fix-merge@1.0.0
  with: 
    username: codeeshop-oc
    email: github-action[bot]@users.noreply.github.com
    temp_branch_name: php-cs-fix
    master_branch_name: main
    commit_message: Automated Bot Deployment
    pull_title: Automated Bot Deployment
    pull_body: Update PH CS Fix Files
    assignee: codeeshop-oc
    reviewer: codeeshop-oc
```

#Inputs

```yaml
username:
  description: 'Username of user, defaults to context github.repository_owner if omited'
  default: ${{ github.repository_owner }}
  required: false
email:
  description: 'Email of User, defaults to context "github-action[bot]@users.noreply.github.com" if omited'
  default: 'github-action[bot]@users.noreply.github.com'
  required: false
temp_branch_name:
  description: 'Repostory owner, defaults to context "php-cs-fix" if omited'
  default: 'php-cs-fix'
  required: false
master_branch_name:
  description: 'Master Branch Name, defaults to context github.ref_name if omited'
  default: ${{ github.ref_name }}
  required: false
commit_message:
  description: 'Commit Message, defaults to context "Automated Bot Deployment" if omited'
  default: 'Automated Bot Deployment'
  required: false
pull_title:
  description: 'Pull request title, defaults to context "Automated Bot Deployment" if omited'
  default: 'Automated Bot Deployment'
  required: false
pull_body:
  description: 'Pull request body text, defaults to "Update PH CS Fix Files" if omited'
  default: 'Update PH CS Fix Files'
  required: false
assignee:
  description: 'Pull request assignee, defaults to context github.repository_owner if omited'
  default: ${{ github.repository_owner }}
  required: false
reviewer:
  description: 'Pull request reviewer, defaults to context github.repository_owner if omited'
  default: ${{ github.repository_owner }}
  required: false
repository:
  description: 'Repository, defaults to context github.repository if omited'
  default: ${{ github.repository }}
  required: false
github_token:
  description: 'Github Token, defaults to context secrets.GITHUB_TOKEN if omited'
  default: ${{ secrets.GITHUB_TOKEN }}
  required: false
github_actor:
  description: 'Github Token, defaults to context secrets.GITHUB_ACTOR if omited'
  default: ${{ secrets.GITHUB_ACTOR }}
  required: false
```