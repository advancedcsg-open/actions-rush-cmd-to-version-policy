const core = require('@actions/core')
const utils = require('./utils')
const { Events } = require('./constants')

async function run () {
  try {
    if (utils.isGhes()) {
      utils.logWarning('Action is not supported on GHES')
      utils.setCacheHitOutput(false)
      return
    }

    if (!utils.isValidEvent()) {
      utils.logWarning(`Event Validation Error: The event type ${process.env[Events.Key]} is not supported because it's not tied to a branch or tag ref.`)
      return
    }

    const versionPolicy = core.getInput('version-policy')
    if (!versionPolicy) {
      throw new Error('Parameter `version-policy` is required')
    }

    // run rush build for the version policy
    await utils.runRushBuild(versionPolicy)

    // load rush.json
    const rushJson = utils.loadRushJson()
    const versionPolicyProjects = rushJson.projects.filter(project => project.versionPolicy === versionPolicy)
    versionPolicyProjects.forEach(project => {
      utils.logInfo(`Publishing project ${project.packageName}`)
    })
  } catch (error) {
    core.error(`Action failed: ${error.message}`)
    core.setFailed(error.message)
  }
}

run()

module.exports = run
