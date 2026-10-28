# Initial administrator account

On every application startup, the seeder deletes all records from `user_roles` and
`users`, then creates one `ROLE_ADMIN` account. Configure these environment
variables in the deployment environment before starting the application:

- `VENUEVISTA_ADMIN_USERNAME=anant` (the default if omitted)
- `VENUEVISTA_ADMIN_EMAIL=<admin email>`
- `VENUEVISTA_ADMIN_PASSWORD=<secret password of at least 16 characters>`

Keep the password in the hosting provider's secret/environment-variable settings;
do not put its value in this file, application properties, or source control. Use a
password of at least 16 characters. The delete-and-seed operation runs in a single
database transaction.
