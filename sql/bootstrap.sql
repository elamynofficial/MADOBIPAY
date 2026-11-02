-- Run against the default "postgres" database as a superuser, e.g.:
--   psql -U postgres -d postgres -f sql/bootstrap.sql
-- Do not paste this into PowerShell.

SELECT 'CREATE ROLE madobipay LOGIN PASSWORD ''madobipay'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'madobipay')\gexec

SELECT 'CREATE DATABASE madobipay OWNER madobipay'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'madobipay')\gexec

GRANT ALL PRIVILEGES ON DATABASE madobipay TO madobipay;
