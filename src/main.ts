import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'

import INPUTS from './inputs'
import {execSync} from 'child_process'

interface ENVS {
  username: string
  email: string
  temp_branch_name: string
  master_branch_name: string
  commit_message: string
  pull_title: string
  pull_body: string
  assignee: string
  reviewer: string
  repository: string
  github_token: string
}

export type ConfigEnv = Pick<
  ENVS,
  | 'username'
  | 'email'
  | 'temp_branch_name'
  | 'master_branch_name'
  | 'commit_message'
  | 'pull_title'
  | 'pull_body'
  | 'assignee'
  | 'reviewer'
  | 'repository'
  | 'github_token'
>

const config: ConfigEnv = {} as ConfigEnv

config.username = core.getInput(INPUTS.username)
config.email = core.getInput(INPUTS.email)
config.temp_branch_name = core.getInput(INPUTS.temp_branch_name)
config.master_branch_name = core.getInput(INPUTS.master_branch_name)
config.commit_message = core.getInput(INPUTS.commit_message)
config.pull_title = core.getInput(INPUTS.pull_title)
config.pull_body = core.getInput(INPUTS.pull_body)
config.assignee = core.getInput(INPUTS.assignee)
config.reviewer = core.getInput(INPUTS.reviewer)
config.repository = core.getInput(INPUTS.repository)
config.github_token = core.getInput(INPUTS.github_token)

const octokit = github.getOctokit(config.github_token).rest

async function run(): Promise<void> {
  try {
    // core.info('Step 7: Check - Something To Commit ?')
    // const output1 = execSync(`git diff --quiet --staged . || echo "changed"`)
    // output.push(output1)

    // if (output1.toString()) {
    //   core.info('Step 8: All')
    // }

    await pushCommitAndMergePR(config.temp_branch_name, config.commit_message)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function addChanges(
  owner: string,
  repo: string,
  branch: string
): Promise<void> {
  try {
    const output = []

    core.info('Step 1: Create composer.json')
    output.push(
      execSync(
        `echo '{"name":"prestashop/phpcs","description":"Test","license":"MIT","autoload":{"psr-4":{"Prestashop\\\\\\\\Phpcs\\\\\\\\":"src/"}},"authors":[{"name":"Anant","email":"anantnegi8@gmail.com"}],"require":{}}' > composer.json | echo 'File composer.json Created.'`
      ).toString()
    )

    core.info('Step 2: Validate composer.json and composer.lock')
    output.push(execSync(`composer validate --strict`))

    core.info('Step 3: No Cache Composer packages')
    output.push(execSync(`composer install --prefer-dist --no-progress`))

    core.info('Step 4: Install PHP CS Fixer BundleTools')
    output.push(
      execSync(
        `mkdir -p tools/php-cs-fixer && composer require --working-dir=tools/php-cs-fixer friendsofphp/php-cs-fixer`
      )
    )

    core.info('Step 5: Run PHP-CS')
    output.push(
      execSync(`tools/php-cs-fixer/vendor/bin/php-cs-fixer fix ./`, {
        stdio: 'inherit'
      })
    )

    core.info(`${config.username}`)
    core.info(`${config.email}`)
    core.info('Step 6: Update Git Config')
    output.push(
      execSync(
        `git config --global user.name "${config.username}"
      git config --global user.email "${config.email}"`
      )
    )

    execSync('git add .', {stdio: 'inherit'})

    // Get the changed files
    const changedFiles = execSync('git diff --name-only HEAD')
      .toString()
      .split('\n')
      .filter(Boolean)

    if (changedFiles.length > 0) {
      // Commit and push the changes
      core.info(`File updated working till now`)
      for (const file of changedFiles) {
        const {data: fileInfo} = await octokit.repos.getContent({
          owner,
          repo,
          path: file,
          ref: branch
        })

        core.info('JSON.stringify(fileInfo)')
        core.info(JSON.stringify(fileInfo))

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file,
          message: `Fixed ${file} using php-cs-fixer`,
          content: Buffer.from(
            fs.readFileSync(file).toString(),
            'utf-8'
          ).toString('base64'),
          branch
        })
        // core.info(`File updated: ${data.commit.sha}`)
        core.info(`File updated`)
      }
    } else {
      core.info(`No files changed`)
    }

    // for (const step of output) {
    //   core.info(step.toString())
    // }

    // process.exit(0)
  } catch (error) {
    core.info((error as Error).message)
  }
}

async function updateReference(
  repo: string,
  ref: string,
  sha: string
): Promise<void> {
  try {
    await octokit.git.updateRef({
      owner: 'OWNER',
      repo,
      ref,
      sha,
      force: true
    })
    core.info(`Reference updated: ${ref}`)
  } catch (error) {
    core.info((error as Error).message)
  }
}

async function createReference(
  owner: string,
  repo: string,
  ref: string,
  sha: string
): Promise<void> {
  try {
    await octokit.git.createRef({
      owner,
      repo,
      ref,
      sha
    })
    core.info(`Reference created: ${ref}`)
  } catch (error) {
    if ((error as Error).message.includes('Reference already exists')) {
      core.info(`Reference already exists: ${ref}`)
      await updateReference(repo, ref, sha)
    } else {
      core.info((error as Error).message)
    }
  }
}

async function pushCommitAndMergePR(
  branch: string,
  message: string
): Promise<void> {
  const context = github.context
  const owner = context.repo.owner
  const repo = context.repo.repo
  core.info(message)
  // 1. Create a new branch
  await createReference(
    owner,
    repo,
    `refs/heads/${branch}`,
    (
      await octokit.repos.getBranch({
        owner,
        repo,
        branch: config.master_branch_name
      })
    ).data.commit.sha
  )

  addChanges(owner, repo, branch)

  // 2. Create a new file in the branch
  const content = Buffer.from(message).toString('base64')
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `${branch}/newfile.txt`,
    message: `Add new file: ${branch}/newfile.txt ${new Date().toTimeString()}`,
    content,
    branch
  })

  // 3. Create a pull request to merge the branch
  const pullRequest = (
    await octokit.pulls.create({
      owner,
      repo,
      head: branch,
      base: config.master_branch_name,
      title: `Merge ${branch} into ${config.master_branch_name}`,
      body: `This pull request merges branch \`${branch}\` into \`${config.master_branch_name}\`.`
    })
  ).data

  // 4. Merge the pull request
  await octokit.pulls.merge({
    owner,
    repo,
    pull_number: pullRequest.number,
    commit_title: `Merge pull request #${pullRequest.number}`,
    merge_method: 'squash'
  })
}

run()
