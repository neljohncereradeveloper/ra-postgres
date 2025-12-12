# Troubleshooting PostgreSQL Replication

This guide covers common issues and solutions when setting up and maintaining PostgreSQL master-slave replication.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Replication Not Starting](#replication-not-starting)
3. [Replication Lag](#replication-lag)
4. [WAL Archiving Problems](#wal-archiving-problems)
5. [Authentication Failures](#authentication-failures)
6. [Slave Not in Recovery Mode](#slave-not-in-recovery-mode)
7. [Failover Issues](#failover-issues)
8. [Performance Issues](#performance-issues)

## Connection Issues

### Problem: Slave cannot connect to master

**Symptoms**:

- Error: `could not connect to server`
- Error: `connection refused`
- `pg_stat_replication` shows no connections

**Solutions**:

1. **Check Network Connectivity**:

```bash
# From slave, test connection to master
ping <MASTER_IP>
telnet <MASTER_IP> 5432
nc -zv <MASTER_IP> 5432
```

2. **Check Firewall Rules**:

```bash
# On master, check if port is open
sudo ufw status
sudo firewall-cmd --list-all
sudo iptables -L -n | grep 5432

# Allow connection from slave
sudo ufw allow from <SLAVE_IP> to any port 5432
```

3. **Check PostgreSQL is Listening**:

```bash
# On master
sudo netstat -tlnp | grep 5432
sudo ss -tlnp | grep 5432

# Check listen_addresses in postgresql.conf
psql -U postgres -c "SHOW listen_addresses;"
# Should be '*' or include the network interface
```

4. **Check PostgreSQL is Running**:

```bash
# On master
sudo systemctl status postgresql
psql -U postgres -c "SELECT version();"
```

### Problem: Connection timeout

**Symptoms**:

- Connection hangs and times out
- Intermittent connection failures

**Solutions**:

1. **Check Network Latency**:

```bash
ping <MASTER_IP>
traceroute <MASTER_IP>
```

2. **Check Connection Limits**:

```bash
# On master
psql -U postgres -c "SHOW max_connections;"
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

3. **Check for Network Issues**:

```bash
# Test with increased timeout
psql -h <MASTER_IP> -U replicator -d postgres -c "SELECT 1;" --connect-timeout=30
```

## Replication Not Starting

### Problem: Replication slot not found

**Symptoms**:

- Error: `replication slot "slave1" does not exist`
- Slave cannot connect

**Solutions**:

1. **Create Replication Slot**:

```sql
-- On master
SELECT * FROM pg_create_physical_replication_slot('slave1');
```

2. **Verify Slot Exists**:

```sql
SELECT slot_name, active FROM pg_replication_slots;
```

3. **Update Slave Configuration**:

```ini
# In postgresql.auto.conf or recovery.conf
primary_slot_name = 'slave1'
```

### Problem: WAL sender process limit reached

**Symptoms**:

- Error: `number of requested standby connections exceeds max_wal_senders`
- Replication connections rejected

**Solutions**:

1. **Increase max_wal_senders**:

```ini
# In postgresql.conf on master
max_wal_senders = 5  # Increase from current value
```

2. **Restart PostgreSQL**:

```bash
sudo systemctl restart postgresql
```

3. **Verify Setting**:

```sql
SHOW max_wal_senders;
```

### Problem: "no pg_hba.conf entry" error

**Symptoms**:

- Error: `no pg_hba.conf entry for host "<CLIENT_IP>", user "<USER>", database "<DATABASE>"`
- Error: `no pg_hba.conf entry for replication connection`
- Connection refused even with correct credentials

**Common Scenarios**:

#### Scenario 1: Regular Database Connection (postgres user)

**Error Example**:

```
FATAL: no pg_hba.conf entry for host "10.8.0.100", user "postgres", database "postgres", SSL on
```

**Solutions**:

1. **Find pg_hba.conf location**:

```bash
# On the PostgreSQL server
sudo -u postgres psql -c "SHOW hba_file;"
# Common locations:
# /etc/postgresql/14/main/pg_hba.conf
# /var/lib/postgresql/14/main/pg_hba.conf
```

2. **Add entry for regular database connections**:

```conf
# Allow postgres user from specific IP
host    postgres    postgres    10.8.0.100/32    md5

# Or allow all databases for postgres user from specific IP
host    all    postgres    10.8.0.100/32    md5

# Or allow from entire subnet (less secure)
host    all    postgres    10.8.0.0/24    md5
```

3. **For SSL connections, use hostssl**:

```conf
# SSL connection
hostssl    all    postgres    10.8.0.100/32    md5

# Or allow both SSL and non-SSL
host    all    postgres    10.8.0.100/32    md5
hostssl    all    postgres    10.8.0.100/32    md5
```

4. **Reload Configuration**:

```bash
# Reload without restart (preferred)
sudo systemctl reload postgresql
# Or
sudo -u postgres psql -c "SELECT pg_reload_conf();"
```

#### Scenario 2: Replication Connection

**Error Example**:

```
FATAL: no pg_hba.conf entry for replication connection from host "10.8.0.100"
```

**Solutions**:

1. **Check pg_hba.conf on Master**:

```bash
# Verify entry exists
sudo grep replication /var/lib/postgresql/14/main/pg_hba.conf
```

2. **Add Entry**:

```conf
host    replication     replicator     10.8.0.100/32    md5
```

3. **Reload Configuration**:

```bash
# Reload without restart
sudo systemctl reload postgresql
# Or
psql -U postgres -c "SELECT pg_reload_conf();"
```

#### General Troubleshooting Steps

1. **Verify the exact error message** - Note the client IP, user, and database
2. **Check current pg_hba.conf entries**:

```bash
sudo cat /var/lib/postgresql/14/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

3. **Verify entry format** - pg_hba.conf entries must be in this order:

```
TYPE  DATABASE  USER  ADDRESS  METHOD
```

4. **Check entry order** - PostgreSQL processes entries from top to bottom, first match wins
5. **Test connection after reload**:

```bash
# From client machine
psql -h 10.8.0.121 -U postgres -d postgres
```

#### Scenario 3: Allow All Connections (Use with Caution)

**If you want to allow connections from all IPs, all databases, and all users:**

```conf
# Allow all connections from any IP (NOT RECOMMENDED FOR PRODUCTION)
host    all    all    0.0.0.0/0    md5

# For IPv6
host    all    all    ::/0    md5

# For SSL connections
hostssl    all    all    0.0.0.0/0    md5
```

**More Secure Alternatives**:

1. **Allow all from specific subnet** (better than 0.0.0.0/0):

```conf
# Allow from your local network only
host    all    all    10.8.0.0/24    md5
host    all    all    192.168.1.0/24    md5
```

2. **Allow all databases but specific user from subnet**:

```conf
# Allow postgres user from subnet
host    all    postgres    10.8.0.0/24    md5
```

3. **Allow all users but specific database from subnet**:

```conf
# Allow all users to connect to postgres database from subnet
host    postgres    all    10.8.0.0/24    md5
```

**Security Warnings**:

⚠️ **NEVER use `0.0.0.0/0` in production** - This allows connections from anywhere on the internet!

⚠️ **NEVER use `trust` method with `0.0.0.0/0`** - This allows passwordless access from anywhere!

**Recommended Production Setup**:

```conf
# Specific IP addresses (most secure)
host    all    postgres    10.8.0.100/32    md5
host    all    postgres    10.8.0.101/32    md5

# Or specific subnet (if you control the network)
host    all    all    10.8.0.0/24    md5

# Use scram-sha-256 for better security (PostgreSQL 10+)
host    all    all    10.8.0.0/24    scram-sha-256
```

**After adding entries, reload configuration**:

```bash
sudo systemctl reload postgresql
```

## Replication Lag

### Problem: High replication lag

**Symptoms**:

- Large difference between master and slave WAL positions
- Slave data is outdated
- Queries on slave return old data

**Diagnosis**:

```sql
-- On master, check lag
SELECT
    client_addr,
    pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes,
    state
FROM pg_stat_replication;

-- On slave, check lag in seconds
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;
```

**Solutions**:

1. **Increase WAL Retention**:

```ini
# On master, increase wal_keep_size
wal_keep_size = 2GB  # Increase from current value
```

2. **Use Replication Slots**:

```sql
-- Create replication slot on master
SELECT * FROM pg_create_physical_replication_slot('slave1');

-- Update slave configuration
primary_slot_name = 'slave1'
```

3. **Check Network Speed**:

```bash
# Test network speed between master and slave
iperf3 -c <MASTER_IP> -p 5201
```

4. **Check Slave Performance**:

```bash
# Check CPU and I/O on slave
top
iostat -x 1
```

5. **Reduce Slave Load**:

```ini
# On slave, increase delays to reduce conflicts
max_standby_streaming_delay = 60s
max_standby_archive_delay = 300s
```

### Problem: Replication lag increasing

**Symptoms**:

- Lag continuously increases
- Slave falls further behind

**Solutions**:

1. **Check for Long-Running Queries on Slave**:

```sql
-- On slave
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

2. **Check WAL Archiving**:

```bash
# Verify archive directory is accessible
ls -lh /var/lib/postgresql/archive/
```

3. **Check Disk Space**:

```bash
df -h
# Ensure both master and slave have sufficient space
```

4. **Monitor WAL Generation Rate**:

```sql
-- On master
SELECT
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS total_wal_size;
```

## WAL Archiving Problems

### Problem: Archive command failing

**Symptoms**:

- WAL files not being archived
- Archive directory not updating
- Errors in PostgreSQL logs

**Diagnosis**:

```sql
-- Check archive status
SELECT * FROM pg_stat_archiver;

-- Check for archive failures
SELECT archived_count, failed_count FROM pg_stat_archiver;
```

**Solutions**:

1. **Test Archive Command Manually**:

```bash
# Test the archive command
sudo -u postgres bash -c 'test ! -f /var/lib/postgresql/archive/test && cp /var/lib/pgsql/data/pg_wal/000000010000000000000001 /var/lib/postgresql/archive/test'
```

2. **Check Archive Directory Permissions**:

```bash
sudo ls -ld /var/lib/postgresql/archive
sudo chown postgres:postgres /var/lib/postgresql/archive
sudo chmod 700 /var/lib/postgresql/archive
```

3. **Check Disk Space**:

```bash
df -h /var/lib/postgresql/archive
```

4. **Fix Archive Command**:

```ini
# In postgresql.conf, ensure command is correct
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
```

5. **Reload Configuration**:

```bash
sudo systemctl reload postgresql
```

### Problem: WAL files accumulating

**Symptoms**:

- Many WAL files in pg_wal directory
- Disk space filling up

**Solutions**:

1. **Use Replication Slots**:

```sql
-- Prevents master from removing WAL files needed by slave
SELECT * FROM pg_create_physical_replication_slot('slave1');
```

2. **Increase Archive Cleanup**:

```bash
# Manually clean old WAL files (if not using replication slots)
# Be careful - only remove files older than what slave needs
find /var/lib/postgresql/14/main/pg_wal -name "*.backup" -mtime +7 -delete
```

3. **Monitor WAL Directory Size**:

```bash
du -sh /var/lib/postgresql/14/main/pg_wal
```

## Authentication Failures

### Problem: "no password supplied" error

**Symptoms**:

- Error: `fe_sendauth: no password supplied`
- Error: `password authentication failed for user "postgres"`
- Connection fails when trying to connect remotely

**Cause**:
The `pg_hba.conf` is configured to require password authentication (`md5` or `scram-sha-256`), but either:

1. The user doesn't have a password set
2. The password wasn't provided in the connection command

**Solutions**:

1. **Set Password for postgres User** (if not already set):

```bash
# Connect locally (no password needed for local connections)
sudo -u postgres psql
```

```sql
-- Set password for postgres user
ALTER USER postgres WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Verify password is set
\du postgres
```

2. **Connect with Password**:

```bash
# Method 1: Use -W flag to prompt for password
psql -h 10.8.0.121 -U postgres -d postgres -W

# Method 2: Use PGPASSWORD environment variable (less secure)
PGPASSWORD='your_password' psql -h 10.8.0.121 -U postgres -d postgres

# Method 3: Use connection string with password
psql "postgresql://postgres:your_password@10.8.0.121:5432/postgres"
```

3. **Use .pgpass File** (Recommended for automation):

```bash
# Create .pgpass file in your home directory
echo "10.8.0.121:5432:postgres:postgres:your_password" >> ~/.pgpass
chmod 600 ~/.pgpass

# Now you can connect without entering password
psql -h 10.8.0.121 -U postgres -d postgres
```

**Format for .pgpass file**:

```
hostname:port:database:username:password
```

4. **Check if User Has Password Set**:

```sql
-- Connect locally first
sudo -u postgres psql

-- Check if password is set (NULL means no password)
SELECT usename, passwd IS NOT NULL as has_password
FROM pg_shadow
WHERE usename = 'postgres';
```

5. **If You Want Passwordless Authentication** (NOT RECOMMENDED for remote):

```conf
# In pg_hba.conf, change method from md5 to trust (INSECURE!)
host    all    postgres    10.8.0.100/32    trust
```

⚠️ **Warning**: Using `trust` allows passwordless access - only use for local/trusted networks!

### Problem: Replication user authentication fails

**Symptoms**:

- Error: `password authentication failed for user "replicator"`
- Connection refused

**Solutions**:

1. **Verify User Exists**:

```sql
-- On master
\du replicator
SELECT usename, usesuper, userepl FROM pg_user WHERE usename = 'replicator';
```

2. **Reset Password**:

```sql
-- On master
ALTER USER replicator WITH ENCRYPTED PASSWORD 'new_password';
```

3. **Check pg_hba.conf**:

```conf
# Ensure correct entry exists
host    replication     replicator     <SLAVE_IP>/32    md5
```

4. **Use .pgpass File**:

```bash
# On slave, create .pgpass file
echo "<MASTER_IP>:5432:replication:replicator:password" | sudo tee ~postgres/.pgpass
sudo chmod 600 ~postgres/.pgpass
sudo chown postgres:postgres ~postgres/.pgpass
```

5. **Test Connection**:

```bash
# From slave, test connection
psql -h <MASTER_IP> -U replicator -d postgres -c "SELECT 1;"
```

## Slave Not in Recovery Mode

### Problem: Slave is not in recovery mode

**Symptoms**:

- `pg_is_in_recovery()` returns false
- Slave accepts write operations
- Replication not working

**Solutions**:

1. **Check Recovery Configuration**:

```bash
# PostgreSQL 12+
cat /var/lib/postgresql/14/main/postgresql.auto.conf

# PostgreSQL 11 and below
cat /var/lib/postgresql/11/main/recovery.conf
```

2. **Verify Recovery File Exists**:

```bash
# PostgreSQL 12+ should have postgresql.auto.conf
# PostgreSQL 11- should have recovery.conf
ls -la /var/lib/postgresql/14/main/ | grep -E "(recovery|auto)"
```

3. **Recreate Recovery Configuration**:

```bash
# For PostgreSQL 12+
sudo -u postgres tee /var/lib/postgresql/14/main/postgresql.auto.conf << EOF
primary_conninfo = 'user=replicator host=<MASTER_IP> port=5432'
primary_slot_name = 'slave1'
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql
```

4. **Check PostgreSQL Logs**:

```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Failover Issues

### Problem: Promotion fails

**Symptoms**:

- `pg_ctl promote` fails
- Slave remains in recovery mode

**Solutions**:

1. **Check PostgreSQL Version**:

```bash
psql --version
# PostgreSQL 12+ uses pg_ctl promote
# PostgreSQL 11- uses trigger file
```

2. **For PostgreSQL 12+**:

```bash
sudo -u postgres pg_ctl promote -D /var/lib/postgresql/14/main
```

3. **For PostgreSQL 11-**:

```bash
# Create trigger file
sudo touch /var/lib/postgresql/11/main/failover.trigger
sudo chown postgres:postgres /var/lib/postgresql/11/main/failover.trigger
```

4. **Verify Promotion**:

```sql
SELECT pg_is_in_recovery();
-- Should return false after promotion
```

### Problem: Old master cannot become slave

**Symptoms**:

- After failover, old master cannot be reconfigured as slave

**Solutions**:

1. **Stop Old Master**:

```bash
sudo systemctl stop postgresql
```

2. **Create New Backup from New Master**:

```bash
sudo -u postgres pg_basebackup \
    -h <NEW_MASTER_IP> \
    -U replicator \
    -D /var/lib/postgresql/14/main \
    -Fp -Xs -P -R
```

3. **Start as Slave**:

```bash
sudo systemctl start postgresql
```

## Performance Issues

### Problem: Slow replication

**Symptoms**:

- Replication takes long time
- High CPU usage during replication

**Solutions**:

1. **Check Network Bandwidth**:

```bash
# Test network speed
iperf3 -c <MASTER_IP>
```

2. **Optimize WAL Settings**:

```ini
# On master
wal_compression = on  # Compress WAL (PostgreSQL 9.5+)
```

3. **Check Slave I/O**:

```bash
# Monitor I/O performance
iostat -x 1
```

4. **Reduce Checkpoint Frequency**:

```ini
# On master
checkpoint_timeout = 15min
max_wal_size = 2GB
```

### Problem: Slave queries are slow

**Symptoms**:

- Read queries on slave are slower than master
- High query times

**Solutions**:

1. **Check for Conflicts**:

```sql
-- On slave, check for conflicts
SELECT * FROM pg_stat_database_conflicts;
```

2. **Increase Standby Delays**:

```ini
# On slave
max_standby_streaming_delay = 60s
max_standby_archive_delay = 300s
```

3. **Check Statistics**:

```sql
-- On slave
SELECT * FROM pg_stat_database WHERE datname = 'your_database';
```

## General Diagnostic Commands

### Check Replication Status

```sql
-- On master
SELECT * FROM pg_stat_replication;

-- On slave
SELECT * FROM pg_stat_wal_receiver;
SELECT pg_is_in_recovery();
```

### Check Configuration

```sql
-- On master
SHOW wal_level;
SHOW max_wal_senders;
SHOW archive_mode;

-- On slave
SHOW hot_standby;
```

### View Logs

```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# System logs
sudo journalctl -u postgresql -f
```

### Check Disk Space

```bash
df -h
du -sh /var/lib/postgresql/*/main/pg_wal
```

## Getting Help

If issues persist:

1. Check PostgreSQL logs for detailed error messages
2. Review [PostgreSQL Documentation](https://www.postgresql.org/docs/)
3. Check [PostgreSQL Mailing Lists](https://www.postgresql.org/list/)
4. Review [Monitoring Guide](monitoring.md) for health checks
5. Consult with your database administrator
