const { createClient } = require('@clickhouse/client');

let client = null;

function getClickHouseClient() {
  if (!client) {
    const url = process.env.CLICKHOUSE_URL;
    if (!url) return null;

    // Parse clickhouse://user:pass@host:port/db
    const match = url.match(/^clickhouse:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
    if (!match) return null;

    const [, username, password, host, port, database] = match;

    client = createClient({
      url: `http://${host}:${port}`,
      username,
      password,
      database,
    });
  }
  return client;
}

module.exports = { getClickHouseClient };
