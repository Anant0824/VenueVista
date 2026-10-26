# Initial administrator account

Admin seeding is disabled by default. To create the initial administrator, configure
these environment variables in the deployment environment:

- `VENUEVISTA_ADMIN_SEED_ENABLED=true`
- `VENUEVISTA_ADMIN_USERNAME=anant` (the default if omitted)
- `VENUEVISTA_ADMIN_EMAIL=<admin email>`
- `VENUEVISTA_ADMIN_PASSWORD=<secret password of at least 16 characters>`

Keep the password in the hosting provider's secret/environment-variable settings;
do not put its value in this file, application properties, or source control. Use a
password of at least 16 characters. The seeder skips creation if the configured
username already exists and does not delete existing accounts.
