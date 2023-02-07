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
