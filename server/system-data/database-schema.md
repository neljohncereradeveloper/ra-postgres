### **Final Database Schema**

#### **1. `Election` Table**
Stores data about each election.
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `election_id` | SERIAL (PK) | Unique identifier for the election. |
| `election_name` | VARCHAR(255) | Name of the election (e.g., 2023 Board of Directors Election).|
| `start_date` | TIMESTAMP | Start date and time of the election. |
| `end_date` | TIMESTAMP | End date and time of the election. |
| `status` | VARCHAR(20) | Current status of the election (`Upcoming`, `Ongoing`, `Completed`).|
| `quorum` | INT | Minimum number of voters required for the election.|
| `preferences` | JSON | Election preferences (e.g., voting method, candidate order).|
| `metadata` | JSON | Additional metadata (e.g., election rules, URL for results).|

---

#### **2. `Voter` Table**
Stores data about voters (cooperative members).
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `voter_id` | SERIAL (PK) | Unique identifier for the voter. |
| `voter_name` | VARCHAR(255) | Name of the voter. |
| `voter_email` | VARCHAR(255) | Email address of the voter. |
| `verification_token` | VARCHAR(255) | Unique token for verification. |
| `has_voted` | BOOLEAN | `TRUE` if the voter has cast a vote, `FALSE` otherwise.|
| `membership_class` | VARCHAR(255) | Class of membership (e.g., Regular, Associate).|
| `share_capital` | DECIMAL(15,2) | Share capital contributed by the voter. |
| `contact_number` | VARCHAR(20) | Contact number of the voter. |
| `address` | VARCHAR(255) | Address of the voter. |

---

#### **3. `Candidate` Table**
Stores data about candidates (nominated by the ELECOM).
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `candidate_id` | SERIAL (PK) | Unique identifier for the candidate. |
| `candidate_name` | VARCHAR(255) | Name of the candidate. |
| `position_id` | INT (FK) | References the position the candidate is running for.|
| `voter_id` | INT (FK) | References the voter record of the candidate. |
| `share_capital` | DECIMAL(15,2) | Share capital contributed by the candidate. |
| `contact_number` | VARCHAR(20) | Contact number of the candidate. |
| `address` | VARCHAR(255) | Address of the candidate. |

---

#### **4. `Position` Table**
Stores data about positions.
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `position_id` | SERIAL (PK) | Unique identifier for the position. |
| `position_name` | VARCHAR(255) | Name of the position (e.g., Chairperson). |
| `max_candidates` | INT | Maximum number of candidates allowed for the position.|
| `term_limit` | INT | Maximum number of terms a candidate can serve. |

---

#### **5. `Ballot` Table**
Stores data about issued ballots.
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `ballot_id` | VARCHAR(255) (PK) | Unique identifier for the ballot. |
| `voter_id` | INT (FK) | References the voter the ballot was issued to. |
| `election_id` | INT (FK) | References the election the ballot is associated with.|
| `status` | VARCHAR(20) | Status of the ballot (`Issued`, `Submitted`). |

---

#### **6. `Vote` Table**
Stores data about cast votes.
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `vote_id` | SERIAL (PK) | Unique identifier for the vote. |
| `ballot_id` | VARCHAR(255) (FK) | References the ballot used for the vote. |
| `candidate_id` | INT (FK) | References the candidate the vote was cast for. |
| `position_id` | INT (FK) | References the position the vote is for. |
| `vote_timestamp` | TIMESTAMP | Timestamp when the vote was cast. |

---

#### **7. `AuditLog` Table**
Stores audit logs for transparency and accountability.
| Column Name | Data Type | Description |
|----------------------|----------------|--------------------------------------------------|
| `log_id` | SERIAL (PK) | Unique identifier for the log entry. |
| `action_type` | VARCHAR(255) | Type of action (e.g., "Ballot Issued", "Vote Cast").|
| `action_details` | JSON | Details of the action (e.g., `voter_id`, `ballot_id`).|
| `action_timestamp` | TIMESTAMP | Timestamp of the action. |
| `user_id` | INT (FK) | References the user who performed the action. |

---

### **Relationships**

1. **`Election` to `Ballot`** (One-to-Many):
- Each election can have multiple ballots.
- `Ballot.election_id` references `Election.election_id`.

2. **`Voter` to `Ballot`** (One-to-One):
- Each voter can only have one ballot per election.
- `Ballot.voter_id` references `Voter.voter_id`.

3. **`Ballot` to `Vote`** (One-to-One):
- Each ballot can only be used to cast one vote.
- `Vote.ballot_id` references `Ballot.ballot_id`.

4. **`Candidate` to `Vote`** (One-to-Many):
- A candidate can receive multiple votes.
- `Vote.candidate_id` references `Candidate.candidate_id`.

5. **`Position` to `Vote`** (One-to-Many):
- A position can have multiple votes.
- `Vote.position_id` references `Position.position_id`.

6. **`Position` to `Candidate`** (One-to-Many):
- A position can have multiple candidates.
- `Candidate.position_id` references `Position.position_id`.

7. **`Voter` to `Candidate`** (One-to-One):
- A candidate must be a voter.
- `Candidate.voter_id` references `Voter.voter_id`.

---

### **SQL Example for Creating Tables**

```sql
-- Election Table
CREATE TABLE Election (
election_id SERIAL PRIMARY KEY,
election_name VARCHAR(255) NOT NULL,
start_date TIMESTAMP NOT NULL,
end_date TIMESTAMP NOT NULL,
status VARCHAR(20) NOT NULL,
quorum INT NOT NULL,
preferences JSON,
metadata JSON
);

-- Voter Table
CREATE TABLE Voter (
voter_id SERIAL PRIMARY KEY,
voter_name VARCHAR(255) NOT NULL,
voter_email VARCHAR(255) NOT NULL,
verification_token VARCHAR(255) NOT NULL,
has_voted BOOLEAN DEFAULT FALSE,
membership_class VARCHAR(255),
share_capital DECIMAL(15,2) NOT NULL,
contact_number VARCHAR(20),
address VARCHAR(255)
);

-- Candidate Table
CREATE TABLE Candidate (
candidate_id SERIAL PRIMARY KEY,
candidate_name VARCHAR(255) NOT NULL,
position_id INT REFERENCES Position(position_id),
voter_id INT REFERENCES Voter(voter_id),
share_capital DECIMAL(15,2) NOT NULL,
contact_number VARCHAR(20),
address VARCHAR(255)
);

-- Position Table
CREATE TABLE Position (
position_id SERIAL PRIMARY KEY,
position_name VARCHAR(255) NOT NULL,
max_candidates INT NOT NULL,
term_limit INT NOT NULL
);

-- Ballot Table
CREATE TABLE Ballot (
ballot_id VARCHAR(255) PRIMARY KEY,
voter_id INT REFERENCES Voter(voter_id),
election_id INT REFERENCES Election(election_id),
status VARCHAR(20) NOT NULL
);

-- Vote Table
CREATE TABLE Vote (
vote_id SERIAL PRIMARY KEY,
ballot_id VARCHAR(255) REFERENCES Ballot(ballot_id),
candidate_id INT REFERENCES Candidate(candidate_id),
position_id INT REFERENCES Position(position_id),
vote_timestamp TIMESTAMP NOT NULL
);

-- AuditLog Table
CREATE TABLE AuditLog (
log_id SERIAL PRIMARY KEY,
action_type VARCHAR(255) NOT NULL,
action_details JSON,
action_timestamp TIMESTAMP NOT NULL,
user_id INT REFERENCES User(user_id)
);
```

