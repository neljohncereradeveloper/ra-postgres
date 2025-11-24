# **Handling Soft-Deleted Relations in TypeORM (Next.js & Node.js)**

## **Overview**

In TypeORM, soft deletes are managed using the `deletedAt` column when `@DeleteDateColumn()` is used. However, when querying relations, soft-deleted related entities **are automatically excluded by default** unless explicitly included using `.withDeleted()`.

This can cause issues where queries unexpectedly return `null` for relations, even when the main entity exists.

This document provides a **detailed solution** to correctly fetch soft-deleted relations while ensuring data integrity.

---

## **🚨 Issue: Related Entity Not Found Due to Soft Delete**

### **Scenario**

We have an `Event` entity related to a `District` entity through a **many-to-one** (`event.district`). When querying for an event, we also want to fetch its associated district, **even if the district was soft deleted**.

### **Problematic Query**

```ts
const eventEntity = await this.eventRepo
  .createQueryBuilder('events')
  .leftJoinAndSelect('events.district', 'districts')
  .where('events.id = :id', { id })
  .andWhere('events.deletedAt IS NULL')
  .getOne();
```

### **Expected Behavior**

- Retrieve the event **if it is not deleted**.
- Include the related district **even if it is soft deleted**.

### **Actual Behavior**

- If the related `district` is **soft deleted**, the event query **fails to return data**.
- `INNER JOIN` filters out results if no valid `district` exists.

---

## **✅ Solution: Explicitly Include Soft-Deleted Relations**

To **fetch deleted related entities**, you must use **`.withDeleted()` on both the main entity (`events`) and the related entity (`districts`)**.

### **🔹 Corrected Query**

```ts
const eventEntity = await this.eventRepo
  .createQueryBuilder('events')
  .withDeleted() // ✅ Allows fetching deleted events
  .leftJoinAndSelect('events.district', 'districts')
  .withDeleted() // ✅ Allows fetching deleted districts
  .where('events.id = :id', { id })
  .andWhere('events.deletedAt IS NULL') // ✅ Ensures event itself is active
  .getOne();
```

### **Why This Works**

✔ **`.withDeleted()` on `events`** → Ensures deleted events are included.  
✔ **`.withDeleted()` on `districts`** → Ensures deleted districts are included.  
✔ **`.andWhere("events.deletedAt IS NULL")`** → Ensures only **non-deleted** events are fetched.

---

## **🚀 Alternative Approach: Load Relations Manually**

If you **don't** want to fetch deleted districts within the main query, you can **fetch the event first** and **then manually fetch the related district**.

### **🔹 Manual Fetching of Deleted Relations**

```ts
const eventEntity = await this.eventRepo
  .createQueryBuilder('events')
  .withDeleted()
  .where('events.id = :id', { id })
  .andWhere('events.deletedAt IS NULL')
  .getOne();

if (eventEntity) {
  eventEntity.district = await this.districtRepo
    .createQueryBuilder('districts')
    .withDeleted()
    .where('districts.id = :districtId', { districtId: eventEntity.districtId })
    .getOne();
}
```

### **Why Use This Approach?**

✔ **More control over when soft-deleted relations are fetched**.  
✔ **Avoids unnecessary joins in the main query**.  
✔ **Prevents exposing deleted relations unless explicitly needed**.

---

## **📌 Best Practices for Handling Soft Deletes in TypeORM**

1️⃣ **Always use `.withDeleted()` on both the main entity and relations** when fetching soft-deleted records.  
2️⃣ **Use `LEFT JOIN` instead of `INNER JOIN`** to prevent filtering out main entities due to missing relations.  
3️⃣ **Filter out deleted records explicitly (`.andWhere("events.deletedAt IS NULL")`)** to avoid returning unwanted deleted data.  
4️⃣ **Manually load deleted relations if needed** to keep better control over queries.

---

## **🔍 Summary**

| **Approach**                                              | **Use Case**                                     | **Pros**                                | **Cons**                    |
| --------------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | --------------------------- |
| **`.withDeleted()` on both main and related entities** ✅ | When you want to **include deleted relations**   | Ensures deleted relations are retrieved | Can expose deleted records  |
| **Manually fetch deleted relations separately** ✅        | When you want **more control over deleted data** | Avoids unnecessary joins                | Requires additional queries |

---

## **🎯 Final Thoughts**

Soft deletes in TypeORM can **unexpectedly filter out results**, especially in **JOIN queries**. Using `.withDeleted()` **correctly** ensures that soft-deleted relations are included **only when necessary**.

This approach allows **better data integrity**, ensuring that no event is lost due to a deleted related entity. 🚀
