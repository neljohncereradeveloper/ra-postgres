# Slave (Standby) Server Setup Guide

This guide walks you through configuring the slave (standby) PostgreSQL server for streaming replication.

## Overview

The slave server receives WAL data from the master server and applies it to maintain an identical copy of the database. It can also serve read queries (hot standby).

## Prerequisites

- Master server must be fully configured (see [Master Setup Guide](master-setup.md))
- Network connectivity between master and slave
- PostgreSQL installed on slave server (same or compatible version)
- Replication user credentials from master server

## Step 1: Install PostgreSQL

Install PostgreSQL on the slave server (should match or be compatible with master version):

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql  # match master version

# Verify installation
psql --version
```

## Step 2: Stop PostgreSQL (if running)

Stop the PostgreSQL service before initializing the data directory:

```bash
sudo systemctl stop postgresql
```

## Step 3: Remove Default Data Directory

Remove the default PostgreSQL data directory (we'll create it from the master):

```bash
# Backup the original data directory (optional but recommended)
sudo mv /var/lib/postgresql/[version]/main /var/lib/postgresql/[version]/main.backup

# Or remove it if you're sure
sudo rm -rf /var/lib/postgresql/[version]/main
```

**Note**: Data directory location varies:

- **Linux**: `/var/lib/postgresql/[version]/main` or `/var/lib/pgsql/[version]/data`

## Step 4: Create Initial Backup from Master

Use `pg_basebackup` to create an initial copy of the master database:

```bash
# Create data directory
sudo mkdir -p /var/lib/postgresql/[version]/main
sudo chown postgres:postgres /var/lib/postgresql/[version]/main

# Run pg_basebackup as postgres user
sudo -u postgres pg_basebackup \
  -h <MASTER_IP> \
  -p 5432 \
  -U replicator \
  -D /var/lib/postgresql/[version]/main \
  -Fp \
  -Xs \
  -P \
  -R

# Options explained:
# -h: Master server hostname or IP
# -p: Master server port (default 5432)
# -U: Replication user
# -D: Data directory on slave
# -Fp: Plain format (copy files as-is)
# -Xs: Stream WAL while backup is taken
# -P: Show progress
# -R: Create recovery configuration (PostgreSQL 12+)
```

### Alternative: Manual Backup and Transfer

If `pg_basebackup` doesn't work over the network, you can create a backup on the master and transfer it:

```bash
# On master server
sudo -u postgres pg_basebackup -h localhost -U replicator -D /tmp/pg_backup -Fp -Xs -P

# Transfer to slave (using scp, rsync, etc.)
scp -r /tmp/pg_backup/* user@slave:/var/lib/postgresql/[version]/main/
```

## Step 5: Configure Recovery (PostgreSQL 12+)

For PostgreSQL 12 and above, `pg_basebackup -R` automatically creates `postgresql.auto.conf` with recovery settings. Verify it exists:

```bash
cat /var/lib/postgresql/[version]/main/postgresql.auto.conf
```

It should contain something like:

```ini
primary_conninfo = 'user=replicator password=your_password host=<MASTER_IP> port=5432 sslmode=prefer'
primary_slot_name = ''
```

### Manual Recovery Configuration (if -R wasn't used)

If you didn't use `-R` flag, create `postgresql.auto.conf` manually:

```bash
sudo -u postgres tee /var/lib/postgresql/[version]/main/postgresql.auto.conf << EOF
primary_conninfo = 'user=replicator password=your_password host=<MASTER_IP> port=5432 sslmode=prefer'
primary_slot_name = ''
EOF
```

**Security Note**: For production, use a `.pgpass` file instead of putting the password in the config file:

```bash
# Create .pgpass file
sudo -u postgres tee ~postgres/.pgpass << EOF
<MASTER_IP>:5432:replication:replicator:your_password
EOF
sudo chmod 600 ~postgres/.pgpass
sudo chown postgres:postgres ~postgres/.pgpass

# Then use in primary_conninfo without password:
primary_conninfo = 'user=replicator host=<MASTER_IP> port=5432 sslmode=prefer'
```

## Step 6: Configure Recovery (PostgreSQL 11 and below)

For PostgreSQL 11 and below, create a `recovery.conf` file:

```bash
sudo -u postgres tee /var/lib/postgresql/[version]/main/recovery.conf << EOF
standby_mode = 'on'
primary_conninfo = 'user=replicator password=your_password host=<MASTER_IP> port=5432 sslmode=prefer'
primary_slot_name = ''
trigger_file = '/var/lib/postgresql/[version]/main/failover.trigger'
EOF
```

## Step 7: Configure PostgreSQL (postgresql.conf)

Edit `postgresql.conf` on the slave server:

```ini
# Connection Settings
listen_addresses = '*'  # or specific IP addresses
port = 5432

# Hot Standby (allows read queries on standby)
hot_standby = on

# Maximum number of concurrent connections from standby
max_standby_streaming_delay = 30s

# Standby connection timeout
max_standby_archive_delay = 300s

# Logging (Optional but recommended)
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_connections = on
log_disconnections = on
```

### Important Settings

- **hot_standby**: Must be `on` to allow read queries on the standby
- **max_standby_streaming_delay**: Maximum delay before canceling queries that conflict with WAL replay
- **max_standby_archive_delay**: Maximum delay for archive recovery

## Step 8: Set Proper Permissions

Ensure the data directory has correct ownership:

```bash
sudo chown -R postgres:postgres /var/lib/postgresql/[version]/main
sudo chmod 700 /var/lib/postgresql/[version]/main
```

## Step 9: Configure Firewall (Optional)

If the slave needs to accept connections, configure firewall:

```bash
# UFW (Ubuntu)
sudo ufw allow 5432/tcp

```

## Step 10: Start PostgreSQL

Start the PostgreSQL service:

```bash
sudo systemctl start postgresql
# or
sudo systemctl start postgresql-14

# Enable auto-start on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

## Step 11: Verify Replication

### Check Replication Status on Master

On the master server, check if replication is working:

```bash
sudo -u postgres psql -c "SELECT * FROM pg_stat_replication;"
```

You should see a row with information about the slave connection, including:

- `client_addr`: IP address of the slave
- `state`: Should be `streaming`
- `sync_state`: `async` (for async replication) or `sync` (for sync replication)

### Check Replication Status on Slave

On the slave server:

```bash
# Check if in recovery mode (should return 't' for true)
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"

# Check replication lag
sudo -u postgres psql -c "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS replication_lag_seconds;"

# Check WAL receiver status
sudo -u postgres psql -c "SELECT * FROM pg_stat_wal_receiver;"
```

### Test Read Queries

Since `hot_standby = on`, you can run read queries on the slave:

```bash
sudo -u postgres psql -c "SELECT count(*) FROM your_table;"
```

### Test Replication

On the master, create a test:

```bash
sudo -u postgres psql
```

```bash connect specific database
sudo -u postgres psql -d ra
```

```sql
-- On master

CREATE TABLE replication_test (id SERIAL, data TEXT);
INSERT INTO replication_test (data) VALUES ('test data');
```

On the slave, verify it was replicated:

```bash
sudo -u postgres psql
```

```sql
-- On slave
SELECT * FROM replication_test;
```

## Step 12: Configure Replication Slot (Recommended)

Replication slots prevent the master from removing WAL files that the slave hasn't received yet.

### Create Replication Slot on Master

```sql
-- On master
SELECT * FROM pg_create_physical_replication_slot('slave1');
```

### Update Slave Configuration

Update `postgresql.auto.conf` (PostgreSQL 12+) or `recovery.conf` (PostgreSQL 11-):

```ini
primary_slot_name = 'slave1'
```

Then restart PostgreSQL on the slave:

```bash
sudo systemctl restart postgresql
```

## Verification Checklist

- [ ] PostgreSQL is installed on slave
- [ ] Default data directory removed
- [ ] Initial backup created from master using `pg_basebackup`
- [ ] Recovery configuration created (`postgresql.auto.conf` or `recovery.conf`)
- [ ] `hot_standby = on` in `postgresql.conf`
- [ ] Data directory permissions set correctly
- [ ] PostgreSQL started successfully
- [ ] Replication status verified on master (`pg_stat_replication`)
- [ ] Slave is in recovery mode (`pg_is_in_recovery()` returns true)
- [ ] Read queries work on slave
- [ ] Test data replicated from master to slave
- [ ] Replication slot configured (optional but recommended)

## Monitoring

Set up monitoring to track replication health:

- Monitor replication lag regularly
- Set up alerts for replication failures
- See [Monitoring Guide](monitoring.md) for details

## Next Steps

1. Set up [Monitoring](monitoring.md) to track replication health
2. Review [Troubleshooting Guide](troubleshooting.md) for common issues
3. Configure [Application Integration](application-integration.md) to use the slave for read queries
4. Test failover procedures (see [Scripts](scripts.md))

## Troubleshooting

Common issues:

1. **Slave not connecting to master**: Check network connectivity, firewall, and `pg_hba.conf` on master
2. **Replication lag**: Check network speed, master load, and `wal_keep_size` settings
3. **Slave not in recovery**: Verify recovery configuration file exists and is correct
4. **Read queries not working**: Ensure `hot_standby = on` in `postgresql.conf`

See [Troubleshooting Guide](troubleshooting.md) for detailed solutions.
