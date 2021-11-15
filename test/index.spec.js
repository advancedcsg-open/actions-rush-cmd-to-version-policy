/* eslint-env jest */
const core = require('@actions/core')

const utils = require('../src/utils')
const { Events, RefKey } = require('../src/constants')
const run = require('../src/index')

jest.mock('@actions/core')
jest.mock('../src/utils')

beforeAll(() => {
  jest.spyOn(utils, 'isValidEvent').mockImplementation(() => {
    const actualUtils = jest.requireActual('../src/utils')
    return actualUtils.isValidEvent()
  })

  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    if (name === 'version-policy') return 'modules'
    else if (name === 'working-directory') return 'test/data'
    else return undefined
  })

  jest.spyOn(core, 'info').mockImplementation((message) => {
    console.log(message)
  })
})

beforeEach(() => {
  process.env[Events.Key] = Events.Push
  process.env[RefKey] = 'refs/heads/feature-branch'

  jest.spyOn(utils, 'isGhes').mockImplementation(() => false)
})

afterEach(() => {
  delete process.env[Events.Key]
  delete process.env[RefKey]
})

test('invalid event outputs warning', async () => {
  const logWarningMock = jest.spyOn(utils, 'logWarning')
  const failedMock = jest.spyOn(core, 'setFailed')
  const invalidEvent = 'commit_comment'
  process.env[Events.Key] = invalidEvent
  delete process.env[RefKey]
  await run()
  expect(logWarningMock).toHaveBeenCalledWith(
    `Invalid configuration: Event Validation Error: The event type ${invalidEvent} is not supported because it's not tied to a branch or tag ref.`
  )
  expect(failedMock).toHaveBeenCalledTimes(1)
  expect(failedMock).toHaveBeenCalledWith(
    `Event Validation Error: The event type ${invalidEvent} is not supported because it's not tied to a branch or tag ref.`
  )
})

test('GHES should no-op', async () => {
  jest.spyOn(utils, 'isGhes').mockImplementation(() => true)

  const logWarningMock = jest.spyOn(utils, 'logWarning')

  await run()

  expect(logWarningMock).toHaveBeenCalledWith(
    'Invalid configuration: Action is not supported on GHES'
  )
})

test('should publish modules to jfrog', async () => {
  const runRushBuildMock = jest.spyOn(utils, 'runRushBuild')
  const getVersionPolicyProjectsMock = jest.spyOn(utils, 'getVersionPolicyProjects')
  // const logInfoMock = jest.spyOn(utils, 'logInfo')
  const failedMock = jest.spyOn(core, 'setFailed')
  await run()

  expect(runRushBuildMock).toHaveBeenCalledTimes(1)
  expect(runRushBuildMock).toHaveBeenCalledWith('modules', 'test/data')

  expect(getVersionPolicyProjectsMock).toHaveBeenCalledTimes(1)
  expect(getVersionPolicyProjectsMock).toHaveBeenCalledWith('modules', 'test/data')

  expect(failedMock).toHaveBeenCalledTimes(0)
  // expect(failedMock).toHaveBeenCalledWith('message')
})

test('should throw error with invalid path', async () => {
  const failedMock = jest.spyOn(core, 'setFailed')

  jest
    .spyOn(core, 'getInput')
    .mockImplementationOnce((name, options) => {
      if (name === 'working-directory') return 'test/data/invalid'
      else return undefined
    })

  await run()
  expect(failedMock).toHaveBeenCalledTimes(1)
  expect(failedMock).toHaveBeenCalledWith('Working directory \'test/data/invalid\' does not exist')
})
