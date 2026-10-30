# Matomo

Production environment configuration (server-side, no public environment variables):

```dotenv
MATOMO_ENABLED=true
MATOMO_URL=https://analytics.coviongroup.com/
MATOMO_SITE_ID=1
```

Recreate the application container after changing these settings. `MATOMO_ENABLED=false`
disables the integration. It only runs on the configured public site origin and in the
frontend layout, excluding the Payload admin, local development, and other hosts.

The asynchronous tracker records one initial page view and one for each pathname change,
including back/forward navigation, with link tracking enabled. Query parameters and hashes
are excluded from page and referrer URLs. Forms and consultation content are not sent.
Site ID 1 and the collector URL are supplied by the site owner. GA remains independently
configured and is not enabled by this integration.
