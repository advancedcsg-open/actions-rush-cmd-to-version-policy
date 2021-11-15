const Events = {
  Key: 'GITHUB_EVENT_NAME',
  Push: 'push',
  PullRequest: 'pull_request'
}

const RefKey = 'GITHUB_REF'

module.exports = {
  Events,
  RefKey
}
