const core = require('@actions/core')
const exec = require('@actions/exec')
const { readFileSync, existsSync } = require('fs')
const path = require('path')

const { RefKey } = require('./constants')

function isGhes () {
  const ghUrl = new URL(process.env.GITHUB_SERVER_URL || 'https://github.com')
  return ghUrl.hostname.toUpperCase() !== 'GITHUB.COM'
}

function logWarning (message) {
  const warningPrefix = '[warning]'
  core.info(`${warningPrefix}${message}`)
}

function logInfo (message) {
  const infoPrefix = '[info]'
  core.info(`${infoPrefix}${message}`)
}

function isValidEvent () {
  return RefKey in process.env && Boolean(process.env[RefKey])
}

async function runRushBuild (versionPolicy, workingDirectory) {
  if (!existsSync(workingDirectory)) {
    throw new Error(`Path not found: ${workingDirectory}`)
  }

  let myOutput = ''
  let myError = ''

  const options = {}
  options.listeners = {
    stdout: (data) => {
      myOutput += data.toString()
    },
    stderr: (data) => {
      myError += data.toString()
    }
  }
  options.cwd = workingDirectory

  await exec.exec('node', [
    'common/scripts/install-run-rush.js',
    'build',
    '--to-version-policy',
    versionPolicy
  ], options)

  if (myError) {
    throw new Error(`Build failed: ${myError}`)
  }
  return myOutput
}

function loadRushJson (workingDirectory) {
  const rushJsonPath = path.join(workingDirectory, 'rush.json')
  if (!existsSync(rushJsonPath)) {
    throw new Error(`Could not find rush.json in ${workingDirectory}`)
  }

  const rawJson = readFileSync(rushJsonPath, 'utf8')
  if (!rawJson) {
    throw new Error(`Failed to load ${rushJsonPath}`)
  }

  const rushJson = JSON.parse(rawJson)
  return rushJson
}

function getVersionPolicyProjects (versionPolicy, workingDirectory) {
  try {
    const rushJson = loadRushJson(workingDirectory)
    const projects = rushJson.projects.filter(project => project.versionPolicyName === versionPolicy)
    return projects
  } catch (error) {
    throw new Error(`Failed to get version policy projects: ${error.message}`)
  }
}

module.exports = {
  isGhes,
  logWarning,
  logInfo,
  isValidEvent,
  loadRushJson,
  getVersionPolicyProjects,
  runRushBuild
}
