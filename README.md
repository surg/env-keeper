A simple app that keeps track of available environments' availability (actually any shared resources). Who owns what etc.

See [usage](usage.md) for the list of available commands and their semantics.

## Configuration

* **ADMIN_BLACKLIST** - Comma-separated list of usernames who are not allowed admin commands. Some get too creative sometimes...
* **REDIS_URL** – in a format of redis://h:[password]@[host]:[port]
* **TOKEN** - Slack's integration token