# php-cs-fix-merge
[![build-test](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/codeeshop-oc/php-cs-fix-merge/actions/workflows/test.yml)

Fix PHP CS Issues and Create Pull request and Merge 

**Note:**
Merge & Pull Request only works if you provide [workflow permissions](../../settings/actions)<br/>
Tick Yes in Option: Allow GitHub Actions to create and approve pull requests

## Usage

See [action.yml](./action.yml)

**Basic:**
```yaml
- uses: codeeshop-oc/php-cs-fix-merge@1.0.1
```

**Full:**
```yaml
- uses: codeeshop-oc/php-cs-fix-merge@1.0.1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    repository: ${{ github.repository }}
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

## Inputs

```yaml
github_token:
  description: 'Github Token with commit access'
  default: ${{ secrets.GITHUB_TOKEN }}
  required: false
repository:
  description: 'Repository, defaults to context github.repository if omited'
  default: ${{ github.repository }}
  required: false
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
```


### Known Issue

When pushing to the same repository, the workflow may return the following error using the action:

```
remote: Permission to <owner>/<repository>.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/<owner>/<repository>/': The requested URL returned error: 403
```

This can be resolved by adding `persist-credentials: false` and `fetch-depth: 0` to the workflow configurations when using the `actions/checkout`.

```yaml
- uses: actions/checkout@v3
  with:
      persist-credentials: false # otherwise, the token used is the GITHUB_TOKEN, instead of the personal access token.
      fetch-depth: 0  # otherwise, there would be errors pushing refs to the destination repository.
- uses: codeeshop-oc/php-cs-fix-merge@1.0.1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    repository: ${{ github.repository }}
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
