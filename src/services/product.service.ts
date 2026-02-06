import { ICreateProduct, IQueryProduct } from "src/types/product";
import db from "../db";
import { NotFoundError } from "../errors/app.error";

export async function createProduct(userId: string, body: ICreateProduct) {
  const [product] = await db("products")
    .insert({
      user_id: userId,
      name: body.name,
      description: body.description,
      price: body.price,
      stock: body.stock,
    })
    .returning("*");

  return product;
}

export async function getProducts(req: IQueryProduct) {
  const { search, sort, limit, offset } = req;

  const query = db("products");

  if (search) {
    const cleanSearch = `%${search.trim()}%`;
    query.where((builder) => {
      builder
        .where("name", "ilike", cleanSearch)
        .orWhere("description", "ilike", cleanSearch);
    });
  }

  const countQuery = query.clone().count("* as count").first();

  if (sort === "oldest") {
    query.orderBy("created_at", "asc");
  } else {
    query.orderBy("created_at", "desc");
  }

  const [data, countResult] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    result: data,
    countResult: parseInt((countResult?.count as string) || "0", 10),
  };
}

export async function getProductById(id: string) {
  const product = await db("products").where({ id }).first();

  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
}

export async function updateProduct(
  userId: string,
  id: string,
  body: ICreateProduct,
) {
  const [product] = await db("products")
    .where({ id, user_id: userId })
    .update({
      name: body.name,
      description: body.description,
      price: body.price,
      stock: body.stock,
      updated_at: db.fn.now(),
    })
    .returning("*");

  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
}

export async function deleteProduct(userId: string, id: string) {
  const deletedCount = await db("products")
    .where({ id, user_id: userId })
    .delete();

  if (deletedCount === 0) {
    throw new NotFoundError("Product not found");
  }
}

export async function deleteBatchProduct(userId: string, ids: string[]) {
  const deletedCount = await db("products")
    .whereIn("id", ids)
    .andWhere({ user_id: userId })
    .delete();

  return deletedCount;
}
