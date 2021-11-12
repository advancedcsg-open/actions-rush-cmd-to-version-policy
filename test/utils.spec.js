/* eslint-env jest */
const core = require('@actions/core')
const fs = require('fs')

const { Events, RefKey } = require('../src/constants')
const utils = require('../src/utils')

jest.mock('@actions/core')

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options)
  })
})

afterEach(() => {
  delete process.env[Events.Key]
  delete process.env[RefKey]
})

test('isGhes returns true if server url is not github.com', () => {
  try {
    process.env.GITHUB_SERVER_URL = 'http://example.com'
    expect(utils.isGhes()).toBe(true)
  } finally {
    process.env.GITHUB_SERVER_URL = undefined
  }
})

test('logWarning logs a message with a warning prefix', () => {
  const message = 'A warning occurred.'

  const infoMock = jest.spyOn(core, 'info')

  utils.logWarning(message)

  expect(infoMock).toHaveBeenCalledWith(`[warning]${message}`)
})

test('isValidEvent returns false for event that does not have a branch or tag', () => {
  const event = 'foo'
  process.env[Events.Key] = event

  const isValidEvent = utils.isValidEvent()

  expect(isValidEvent).toBe(false)
})

test('isValidEvent returns true for event that has a ref', () => {
  const event = Events.Push
  process.env[Events.Key] = event
  process.env[RefKey] = 'ref/heads/feature'

  const isValidEvent = utils.isValidEvent()

  expect(isValidEvent).toBe(true)
})

test('rush runners complete successfully', async () => {
  const runRushBuildMock = jest.spyOn(utils, 'runRushBuild')

  await utils.runRushBuild('modules', 'test/data')

  expect(runRushBuildMock).toHaveBeenCalledTimes(1)
})

test('load rush json successfully', () => {
  const loadRushJsonMock = jest.spyOn(utils, 'loadRushJson')

  const rushJson = utils.loadRushJson('test/data')

  expect(loadRushJsonMock).toHaveBeenCalledTimes(1)
  expect(rushJson).toHaveProperty('projects')
})

test('load rush json fails', () => {
  const loadRushJsonMock = jest.spyOn(utils, 'loadRushJson')

  try {
    utils.loadRushJson('test/data/invalid')
  } catch (error) {
    expect(loadRushJsonMock).toHaveBeenCalledTimes(1)
    expect(error).toBeInstanceOf(Error)
  }
})
