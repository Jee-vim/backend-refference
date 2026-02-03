import pool from "../db/pool";
import { NotFoundError } from "../errors/app.error";

export async function createProduct(userId: string, name: string, description: string, price: number, stock: number) {
  const result = await pool.query(
    "INSERT INTO products (user_id, name, description, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [userId, name, description, price, stock]
  );
  return result.rows[0];
}

export async function getProducts(req: { search?: string, sort?: string, limit: number, offset: number }) {
  const { search, sort, limit, offset } = req;
  let conditions = [];
  let params: any[] = [];

  if (search) {
    const cleanSearch = `%${search.trim()}%`;
    params.push(cleanSearch);
    const idx = params.length;
    conditions.push(`(name ILIKE $${idx} OR COALESCE(description, '') ILIKE $${idx})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "ORDER BY created_at DESC";
  if (sort === "oldest") {
    orderBy = "ORDER BY created_at ASC";
  }

  const dataSql = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const result = await pool.query(dataSql, [...params, limit, offset]);

  const countSql = `SELECT COUNT(*) FROM products ${whereClause}`;
  const countResult = await pool.query(countSql, params);

  return {
    result: result.rows,
    countResult: parseInt(countResult.rows[0].count) || 0
  };
}

export async function getProductById(id: string) {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Product not found");
  }
  return result.rows[0];
}

export async function updateProduct(userId: string, id: string, name: string, description: string, price: number, stock: number) {
  const result = await pool.query(
    "UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
    [name, description, price, stock, id, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Product not found");
  }
  return result.rows[0];
}

export async function deleteProduct(userId: string, id: string) {
  const result = await pool.query("DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Product not found");
  }
}

export async function deleteBatchProduct(userId: string, ids: string[]) {
  const result = await pool.query(
    "DELETE FROM products WHERE id = ANY($1) AND user_id = $2 RETURNING id",
    [ids, userId]
  );

  return result.rowCount;
}
