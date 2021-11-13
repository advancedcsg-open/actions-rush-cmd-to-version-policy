const core = require('@actions/core')
const utils = require('./utils')
const { Events } = require('./constants')
const { existsSync } = require('fs')

async function run () {
  try {
    const workingDirectory = core.getInput('working-directory', { required: false, default: '.' })
    const versionPolicy = core.getInput('version-policy', { required: true })

    try {
      if (utils.isGhes()) {
        throw new Error('Action is not supported on GHES')
      }

      if (!utils.isValidEvent()) {
        throw new Error(`Event Validation Error: The event type ${process.env[Events.Key]} is not supported because it's not tied to a branch or tag ref.`)
      }

      if (!existsSync(workingDirectory)) {
        throw new Error(`Working directory '${workingDirectory}' does not exist`)
      }

      if (!versionPolicy) {
        throw new Error('Parameter `version-policy` is required')
      }
    } catch (error) {
      utils.logWarning(`Invalid configuration: ${error.message}`)
      throw error
    }

    // run rush build for the version policy
    try {
      await utils.runRushBuild(versionPolicy, workingDirectory)
    } catch (error) {
      utils.logWarning(`Error running rush build: ${error.message}`)
      throw error
    }

    // process projects
    try {
      const versionPolicyProjects = await utils.getVersionPolicyProjects(versionPolicy, workingDirectory)
      utils.logInfo(`Found following projects: ${versionPolicyProjects}`)
    } catch (error) {
      utils.logWarning(`Error processing projects: ${error.message}`)
      throw error
    }
  } catch (error) {
    core.error(`Action failed: ${error.message}`)
    core.setFailed(error.message)
  }
}

run()

module.exports = run
