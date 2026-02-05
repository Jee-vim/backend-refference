# POSTGRESQL TERMINAL & TABLE CHEAT SHEET

## 1. PSQL SHELL COMMANDS (Navigating the Terminal)
\l              : List all databases
\c db_name      : Connect to a specific database
\dt             : List all tables in the current database
\d table_name   : Show structure of a specific table (columns, types, etc.)
\du             : List all users/roles
\q              : Quit/Exit the terminal

## 2. TABLE OPERATIONS (Creating & Deleting)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE products;          --- Deletes the table and all data (Permanent)
TRUNCATE TABLE products;      --- Deletes all rows but keeps the table structure
ALTER TABLE products RENAME TO items; --- Rename a table

## 3. COLUMN OPERATIONS (Adding & Changing)
### Add a new column
ALTER TABLE products ADD COLUMN stock_count INTEGER;

### Add a column with a Foreign Key relationship
ALTER TABLE products ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

### Delete a column
ALTER TABLE products DROP COLUMN stock_count;

### Rename a column
ALTER TABLE products RENAME COLUMN old_name TO new_name;

### Change a column's data type
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(12,2);

### Add/Remove NOT NULL constraint
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
ALTER TABLE products ALTER COLUMN name DROP NOT NULL;

## 4. DATA OPERATIONS (DML) 
### Insert
INSERT INTO products (name, price, user_id) VALUES ($1, $2, $3);

### Update (Don't forget the WHERE clause!)
UPDATE products SET price = $1 WHERE id = $2 AND user_id = $3;

### Delete
DELETE FROM products WHERE id = $1 AND user_id = $2;

### Select with Filtering and Sorting
SELECT * FROM products WHERE price > $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

## 5. IMPORTANT TIPS TO AVOID ERRORS
1. ALWAYS end your SQL commands with a semicolon (;).
2. If your prompt shows "taskdb->", it means you forgot the semicolon and it is waiting for it.
3. Use snake_case (user_id) instead of camelCase (userId). If you use capital letters, 
   you must wrap the name in double quotes, like: SELECT * FROM "Products";
