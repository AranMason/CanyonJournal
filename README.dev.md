This file is for documenting various configs to make setting up new development environments easier

### .env file
This is not committed to the DB, this will need to be created and populated. It generally will take the form of the following. (2026/07/30)

```
SQL_SERVER=localhost\SQLEXPRESS
SQL_USER=
SQL_PASSWORD=
SQL_DATABASE=

BASE_URL=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
SESSION_SECRET=
```

### DB Set-up
1. Ensure Mixed Mode (SQL + Windows Auth) is enabled for the server
1. Ensure that TCP/IP is enabled for the Server, and the Port is 1433.
1. Create a User for the app to login as.
1. Make sure the SQL Server Browser is running to use `localhost`

NOTE: There is some permission flag that needs to be set on the server to restore back-ups. Forgotten what it is sadly