# "Fetching Updated Data Within TypeORM Transactions in NestJS"

### **Documentation Explanation:**

---

#### **Purpose:**

This use case handles updating a `District` entity and logging the activity. It ensures the latest data is retrieved and updated within a transaction by using the `EntityManager`. The solution avoids potential data inconsistency caused by TypeORM's first-level cache.

---

### **Problem:**

When performing database operations inside a transaction, using standard repository methods (e.g., `findById(id)`) without the transaction's `EntityManager` can lead to stale or outdated data being returned. This occurs because TypeORM may cache the entity state from a previous query or ignore changes made within the same transaction.

---

### **Solution:**

To retrieve the latest data consistently during a transaction, the solution involves creating and using a new method `findByIdWithManager()` that accepts the transaction's `EntityManager`. This bypasses the cache and queries the database directly within the transaction scope.

---

### **Class:**

`UpdateDistrictUseCase`

---

### **Dependencies (Injected Services):**

| Dependency              | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `TransactionPort`       | Executes operations within a transaction.                |
| `DistrictRepository`    | Provides methods to interact with the `District` entity. |
| `ActivityLogRepository` | Handles logging of activity records.                     |

---

### **Method:**

#### `execute(id: number, dto: UpdateDistrictCommand, userId: number): Promise<District>`

**Purpose:**  
Updates a `District` entity and logs the activity in a transactional context.

---

### **Parameters:**

| Parameter | Type                    | Description                                         |
| --------- | ----------------------- | --------------------------------------------------- |
| `id`      | number                  | ID of the district to update.                       |
| `dto`     | `UpdateDistrictCommand` | Data transfer object containing the update details. |
| `userId`  | number                  | ID of the user performing the update.               |

---

### **Steps:**

1. **Begin Transaction:**  
   The method starts a transaction by calling `transactionHelper.executeTransaction()`.
2. **Validate District Existence:**  
   The district is fetched using `findByIdWithManager(id, manager)`.  
   If the district is not found, a `NotFoundException` is thrown.

   ```typescript
   const districtResult = await this.districtRepository.findByIdWithManager(
     id,
     manager,
   );
   if (!districtResult) {
     throw new NotFoundException('District not found');
   }
   ```

3. **Perform Update:**  
   A new `District` instance is created with the updated properties.  
   The `updateWithManager()` method is called to perform the update within the transaction.

   ```typescript
   const district = new District({ desc1: dto.desc1 });
   const updateSuccessful = await this.districtRepository.updateWithManager(
     id,
     district,
     manager,
   );
   ```

   If the update fails, an `InternalServerErrorException` is thrown.

4. **Retrieve Updated Data:**  
   The method retrieves the updated district record using `findByIdWithManager()`. This ensures fresh data is fetched within the transaction context.

   ```typescript
   const updateResult = await this.districtRepository.findByIdWithManager(
     id,
     manager,
   );
   ```

5. **Log Activity:**  
   A new `ActivityLog` is created to record the update operation.  
   The log is inserted into the database using `createWithManager()`.

   ```typescript
   const log = new ActivityLog(
     LOG_ACTION_CONSTANTS.CREATE_DISTRICT,
     DATABASE_CONSTANTS.MODELNAME_DISTRICT,
     JSON.stringify({ id: updateResult.id, desc1: updateResult.desc1 }),
     new Date(),
     userId,
   );
   await this.activityLogRepository.createWithManager(log, manager);
   ```

6. **Return Result:**  
   The updated district entity is returned to the caller.

---

### **Why `findByIdWithManager()` is Necessary:**

When using transactions, TypeORM's first-level cache can cause stale data issues. Calling the `findById()` method directly uses the default repository, which may not reflect changes made within the transaction. By passing the `EntityManager` to `findByIdWithManager()`, the query is executed within the same transaction context, ensuring the most up-to-date data is retrieved.

---

### **Example Implementation of `findByIdWithManager`:**

```typescript
async findByIdWithManager(id: number, manager: EntityManager): Promise<District | null> {
  return await manager.getRepository(District).findOne({ where: { id, deletedAt: null } });
}
```

---

### **Example UpdateDistrictUseCase Usage:**

```typescript
const updateDistrictCommand = new UpdateDistrictCommand();
updateDistrictCommand.desc1 = 'Updated Description';

const updatedDistrict = await updateDistrictUseCase.execute(
  1,
  updateDistrictCommand,
  101,
);
console.log('Updated District:', updatedDistrict);
```

---

### **Summary:**

- The `execute` method uses transactional operations to update a `District` and log the activity.
- To ensure fresh data is fetched after updates within a transaction, the `findByIdWithManager()` method is used.
- This approach avoids stale data caused by TypeORM's first-level cache when querying without the transaction's `EntityManager`.
