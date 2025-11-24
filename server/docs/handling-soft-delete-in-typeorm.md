# Handling Soft Deleted Records in TypeORM Queries

### **Documentation Explanation:**

In this function, TypeORM's **soft delete** behavior is automatically filtering out deleted records unless you explicitly tell it not to. Let’s document the key parts and behavior of this function to highlight the solution for both deleted and non-deleted records.

---

### **Method Documentation:**

#### **Method Name:**

`findWithFilters`

#### **Purpose:**

Fetches a paginated list of `District` entities based on filters such as search term and deletion status.

---

### **Parameters:**

| Parameter   | Type    | Description                                                         |
| ----------- | ------- | ------------------------------------------------------------------- |
| `term`      | string  | The search term to filter districts by their `desc1` property.      |
| `page`      | number  | The current page number for pagination.                             |
| `limit`     | number  | The number of records to return per page.                           |
| `isDeleted` | boolean | Whether to fetch deleted (`true`) or non-deleted (`false`) records. |

---

### **Return Value:**

A Promise that resolves to an object containing:

1. **data:** The list of `District` records.
2. **meta:** Pagination metadata.

---

### **Soft Deletion Behavior:**

- **Default TypeORM Soft Delete Behavior:**  
  If your `District` entity has a field decorated with `@DeleteDateColumn()`, TypeORM will automatically exclude records where `deletedAt` is not `NULL`. This behavior occurs unless `.withDeleted()` is used.

#### **Key behavior without `withDeleted()`:**

- When **`isDeleted`** is `false`:  
  TypeORM injects `AND districts.deletedAt IS NULL` to only fetch non-deleted records.
- When **`isDeleted`** is `true`:  
  You are explicitly adding a `WHERE` condition (`districts.deletedAt IS NOT NULL`), but TypeORM will still enforce the default filter unless `.withDeleted()` is used.

---

### **Solution:**

Modify the query to handle both deleted and non-deleted records using `.withDeleted()`. This bypasses TypeORM's default filter.

```typescript
// Modify query to disable automatic filtering of deleted rows
const queryBuilder = this.districtRepo
  .createQueryBuilder('districts')
  .withDeleted();
```

---

### **Example Usage in Code:**

```typescript
async findWithFilters(
  term: string,
  page: number,
  limit: number,
  isDeleted: boolean,
): Promise<{ data: District[]; meta: PaginationMeta }> {
  const skip = (page - 1) * limit;

  // Query Builder with soft delete handling
  const queryBuilder = this.districtRepo.createQueryBuilder('districts').withDeleted();

  // Filter records based on deletion status
  if (isDeleted) {
    queryBuilder.where('districts.deletedAt IS NOT NULL');
  } else {
    queryBuilder.where('districts.deletedAt IS NULL');
  }

  // Search filter
  if (term) {
    queryBuilder.andWhere('LOWER(districts.desc1) LIKE :term', {
      term: `%${term.toLowerCase()}%`,
    });
  }

  // Execute queries for both paginated data and total count
  const [data, totalRecords] = await Promise.all([
    queryBuilder.skip(skip).take(limit).getMany(),
    queryBuilder.getCount(),
  ]);

  // Pagination metadata
  const totalPages = Math.ceil(totalRecords / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  return {
    data,
    meta: {
      page,
      limit,
      totalRecords,
      totalPages,
      nextPage,
      previousPage,
    },
  };
}
```

---

### **Summary:**

- Without `.withDeleted()`, TypeORM automatically excludes soft-deleted records.
- Adding `.withDeleted()` disables the automatic filter, allowing you to handle both deleted and non-deleted records based on your conditions (`isDeleted`).
