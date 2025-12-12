# Master (Primary) Server Setup Guide

This guide walks you through configuring the master (primary) PostgreSQL server for streaming replication.

## Overview

The master server is the primary database server that handles all write operations and streams Write-Ahead Log (WAL) data to the standby server(s).

## Step 1: Install PostgreSQL

Ensure PostgreSQL 12 or higher is installed on the master server:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql  # or your preferred version

# Verify installation
psql --version
```

## Step 2: Configure PostgreSQL (postgresql.conf)

Edit the PostgreSQL configuration file. The location varies by installation:

- **Linux**: `sudo nano /etc/postgresql/12/main/postgresql.conf` or `sudo nano /var/lib/pgsql/12/data/postgresql.con`

### Required Configuration Settings

Add or modify the following settings in `postgresql.conf`:

```ini
# Connection Settings
listen_addresses = '*'  # or specific IP addresses
port = 5432

# WAL Settings (Critical for Replication)
wal_level = replica  # Required for streaming replication
# Alternative: wal_level = logical (for logical replication)

# Maximum number of concurrent replication connections
max_wal_senders = 3  # At least 1, increase if you have multiple standbys

# WAL Retention (PostgreSQL 13+)
wal_keep_size = 1GB  # How much WAL to keep for replication
# For PostgreSQL 12 and below, use: wal_keep_segments = 32

# WAL Archiving (Recommended)
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
# Example: archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'

# Hot Standby (allows read queries on standby)
# This is set on the standby, but good to know
# hot_standby = on  # Set on standby server

# Logging (Optional but recommended)
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_connections = on
log_disconnections = on
log_replication_commands = on
```

### Configuration Notes

- **wal_level**: Set to `replica` for streaming replication, or `logical` for logical replication
- **max_wal_senders**: Should be at least the number of standby servers plus 1
- **wal_keep_size**: Ensures WAL files are retained long enough for replication. Adjust based on your replication lag tolerance
- **archive_mode**: Enables WAL archiving, which is useful for point-in-time recovery

## Step 3: Configure Authentication (pg_hba.conf)

Edit the `pg_hba.conf` file (usually in the same directory as `postgresql.conf`):

Add the following entries to allow replication connections:

```conf
# Allow replication connections from localhost
local   replication     replicator                     trust
host    replication     replicator     127.0.0.1/32    md5

# Allow replication connections from slave server
host    replication     replicator     <SLAVE_IP>/32    md5
# Example: host    replication     replicator     192.168.1.100/32    md5

# For SSL connections (recommended for production)
hostssl replication     replicator     <SLAVE_IP>/32    md5
```

### pg_hba.conf Format

```
TYPE  DATABASE  USER  ADDRESS  METHOD
```

- **TYPE**: `host` for TCP/IP, `hostssl` for SSL connections
- **DATABASE**: `replication` for replication connections
- **USER**: The replication user (we'll create this next)
- **ADDRESS**: IP address or CIDR notation
- **METHOD**: Authentication method (`md5`, `scram-sha-256`, `trust`, etc.)

### Allow Regular Database Connections

If you need to allow regular database connections (not just replication) from remote hosts, add these entries:

```conf
# Allow postgres user from specific IP
host    all    postgres    <CLIENT_IP>/32    md5
# Example: host    all    postgres    10.8.0.100/32    md5

# Allow all users from specific IP
host    all    all    <CLIENT_IP>/32    md5

# Allow from entire subnet (less secure, but useful for internal networks)
host    all    all    10.8.0.0/24    md5

# For SSL connections (recommended)
hostssl    all    all    <CLIENT_IP>/32    md5
```

**Security Notes**:

- Use specific IP addresses (`/32`) when possible instead of subnets
- For production, avoid using `0.0.0.0/0` (allows connections from anywhere)
- Use `scram-sha-256` instead of `md5` for better security (PostgreSQL 10+)
- Consider using SSL (`hostssl`) for all remote connections

**Example: Allow all connections from local network**:

```conf
# Allow all connections from 10.8.0.0/24 subnet
host    all    all    10.8.0.0/24    md5
hostssl    all    all    10.8.0.0/24    md5
```

### Set Password for postgres User (If Needed)

If you've configured `pg_hba.conf` to require password authentication (`md5` or `scram-sha-256`), you need to set a password for the `postgres` user:

```bash
# Connect locally (no password needed for local connections)
sudo -u postgres psql
```

```sql
-- Set password for postgres user
ALTER USER postgres WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Verify the change
\du postgres
```

**Note**: By default, the `postgres` user may not have a password set. After setting a password, you'll need to provide it when connecting remotely.

## Step 4: Create Replication User

Connect to PostgreSQL as a superuser and create a dedicated replication user:

```bash
sudo -u postgres psql
```

```sql
-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant necessary permissions (if needed)
-- The REPLICATION privilege is already granted by default

-- Verify the user was created
\du replicator
```

**Security Note**: Use a strong password and store it securely. Consider using a password manager.

## Step 5: Configure Network and Firewall

### Firewall Configuration

Allow PostgreSQL port (default 5432) from the slave server:

```bash
# UFW (Ubuntu)
sudo ufw allow from <SLAVE_IP> to any port 5432

# iptables
sudo iptables -A INPUT -p tcp -s <SLAVE_IP> --dport 5432 -j ACCEPT
```

### Network Connectivity Test

Test connectivity from slave to master:

```bash
# From slave server
telnet <MASTER_IP> 5432
```

## Step 6: Configure SSL (Optional but Recommended)

For production environments, enable SSL for replication:

### Generate SSL Certificates (if not already present)

```bash
# PostgreSQL usually comes with a script to generate self-signed certificates
# Location varies by installation
cd /var/lib/postgresql/[version]/data  # or your data directory

# Generate server key and certificate
openssl req -new -x509 -days 365 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=dbmaster.example.com"

# Set proper permissions
chmod 600 server.key
chown postgres:postgres server.key server.crt
```

### Configure SSL in postgresql.conf

```ini
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
# Optional: ssl_ca_file = 'ca.crt'  # For client certificate verification
```

## Step 7: Create WAL Archive Directory

Create the directory for WAL archiving (if using archive_mode):

```bash
sudo mkdir -p /var/lib/postgresql/archive
sudo chown postgres:postgres /var/lib/postgresql/archive
sudo chmod 700 /var/lib/postgresql/archive
```

## Step 8: Restart PostgreSQL

After making configuration changes, restart PostgreSQL:

```bash
# Systemd (most Linux distributions)
sudo systemctl restart postgresql
# or
sudo systemctl restart postgresql-14  # version-specific

# Verify it's running
sudo systemctl status postgresql
```

## Step 9: Verify Configuration

### Check WAL Level

```bash
sudo -u postgres psql -c "SHOW wal_level;"
```

Should return: `replica` or `logical`

### Check Max WAL Senders

```bash
sudo -u postgres psql -c "SHOW max_wal_senders;"
```

Should return: `3` (or your configured value)

### Check Archive Mode

```bash
sudo -u postgres psql -c "SHOW archive_mode;"
```

Should return: `on`

### Test Replication Connection

From the slave server, test the connection:

```bash
# From slave server
psql -h <MASTER_IP> -U replicator -d postgres -c "SELECT version();"
```

## Step 10: Initial Backup (for Slave Setup)

Before setting up the slave, you may want to create an initial backup. The slave setup will use `pg_basebackup`, but having a backup is good practice:

```bash
# This will be done during slave setup using pg_basebackup
# But you can also create a manual backup:
pg_basebackup -h localhost -U replicator -D /path/to/backup -Ft -z -P
```

## Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] `wal_level` is set to `replica` or `logical`
- [ ] `max_wal_senders` is configured (at least 1)
- [ ] `wal_keep_size` (or `wal_keep_segments`) is configured
- [ ] `archive_mode` is enabled (if using archiving)
- [ ] `pg_hba.conf` allows replication connections from slave
- [ ] Replication user `replicator` is created
- [ ] Firewall allows connections from slave server
- [ ] SSL is configured (for production)
- [ ] PostgreSQL has been restarted
- [ ] Configuration verified with `SHOW` commands
- [ ] Network connectivity tested from slave

## Next Steps

Once the master server is configured, proceed to the [Slave Setup Guide](slave-setup.md) to configure the standby server.

## Troubleshooting

If you encounter issues:

1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Verify configuration: `psql -U postgres -c "SHOW ALL;"`
3. Test network connectivity from slave to master
4. Check firewall rules
5. Verify `pg_hba.conf` entries
6. See [Troubleshooting Guide](troubleshooting.md) for common issues
