import * as core from '@actions/core'
// import * as cache from '@actions/cache'

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
  File: string
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
>

async function run(): Promise<void> {
  try {
    // core.info(`Running ${github.context.action}`);

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
    output.push(execSync(`tools/php-cs-fixer/vendor/bin/php-cs-fixer fix ./`))

    core.info('Step 6: Update Git Config')
    output.push(
      execSync(
        `git config --global user.name "${config.username}"
      git config --global user.email "${config.email}"
      git add .`
      )
    )

    core.info('Step 7: Check - Something To Commit ?')
    output.push(execSync(`git diff --quiet --staged . || echo "changed"`))

    if (output[6] === 'changed') {
      core.info('Step 8: Deleting Previous Branches')
      output.push(
        execSync(
          `git branch -D ${config.temp_branch_name} || echo
         git push -d origin ${config.temp_branch_name} || echo`
        )
      )

      core.info('Step 9: Setting Branch to Temp Branch Name')
      output.push(execSync(`git checkout -b ${config.temp_branch_name}`))

      core.info('Step 10: Push Commit')
      output.push(
        execSync(
          `git commit -m "${config.commit_message}"
          git push -u origin ${config.temp_branch_name}`
        )
      )

      core.info('Step 11: Merging')
      output.push(
        execSync(
          `git checkout ${config.master_branch_name}
        gh repo set-default ${config.username}
        gh pr create --base ${config.master_branch_name} --head ${config.temp_branch_name} --title "${config.pull_title}" --body "${config.pull_body}" --reviewer ${config.assignee} --assignee ${config.reviewer}
        gh pr merge ${config.temp_branch_name} -m --auto | echo
        gh pr review ${config.temp_branch_name} --approve | echo`
        )
      )
    }

    for (const step of output) {
      core.info(step.toString())
      core.info(typeof step)
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
