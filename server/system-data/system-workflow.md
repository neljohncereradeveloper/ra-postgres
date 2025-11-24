# System Workflow

## 1. Election Setup

### Workflow

a. **Create Election**
**TRANSACTION PROCESS**

- The system administrator creates a new election in the Election table

## 2. Set Active election

- The system administrator update the settings and set an current/active election

## 3. Voter Registration

### Workflow

a. **Upload Delegates**
**TRANSACTION PROCESS**

- The system administrator upload delegates to the system
- each delegate is registered on the current/active election

b. **Issue Ballot**
**TRANSACTION PROCESS**

- Issue a ballot to each delegate in the Ballot table
- each ballot is registered on the current/active election

## 4. Candidate Registration

### Workflow

a. **Add Position**
**TRANSACTION PROCESS**

- The system administrator creates a new position in the Positions table
- each position is registered on the current/active election

b. **Add District**
**TRANSACTION PROCESS**

- The system administrator creates a new district in the Districts table
- each district is registered on the current/active election

c. **Add Candidate**
**TRANSACTION PROCESS**

- The system administrator creates a new candidate in the Candidates table
- each candidate is registered on the current/active election
- each candidate must be delegate member in the current/active election
- set the displayName of the candidate which well be seen on the UI

## 5. Start election

- The system administrator starts the election

## 6. Vote Casting

### Workflow

a. **Validate Delegate Control Number**
**TRANSACTION PROCESS**

- Verify the delegate control number and ensure the ballot is still Issued

b. **Cast Vote**
**TRANSACTION PROCESS**

- Insert the vote into the Vote table

c. **System Mark Delegate as Voted**
**TRANSACTION PROCESS**

- Update the has_voted field in the Delegate table to TRUE

d. **System Remove Delegate Link from Ballot**
**TRANSACTION PROCESS**

- Mark the ballot as Submitted and set delegate to NULL

e. **Audit the Action**
**TRANSACTION PROCESS**

- Log the vote casting action in the AuditLog table
