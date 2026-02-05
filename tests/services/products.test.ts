import * as productService from "../../src/services/product.service";
import pool from "../../src/db/pool";
import { NotFoundError } from "../../src/errors/app.error";

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const mockedQuery = pool.query as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("product service", () => {
  describe("createProduct", () => {
    it("creates a product", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1", name: "Product" }],
      });

      const result = await productService.createProduct(
        "user-1",
        "Product",
        "Desc",
        100,
        5
      );

      expect(mockedQuery).toHaveBeenCalledWith(
        "INSERT INTO products (user_id, name, description, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        ["user-1", "Product", "Desc", 100, 5]
      );

      expect(result).toEqual({ id: "1", name: "Product" });
    });
  });

  describe("getProducts", () => {
    it("returns products with search + pagination", async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ id: "1" }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: "1" }],
        });

      const result = await productService.getProducts({
        search: "abc",
        sort: "newest",
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        result: [{ id: "1" }],
        countResult: 1,
      });

      expect(mockedQuery).toHaveBeenCalledTimes(2);
    });

    it("handles empty result", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: "0" }] });

      const result = await productService.getProducts({
        limit: 10,
        offset: 0,
      });

      expect(result.countResult).toBe(0);
    });
  });

  describe("getProductById", () => {
    it("returns product when found", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1" }],
        rowCount: 1,
      });

      const result = await productService.getProductById("1");

      expect(result).toEqual({ id: "1" });
    });

    it("throws NotFoundError when missing", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        productService.getProductById("missing")
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("updateProduct", () => {
    it("updates product", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1", name: "Updated" }],
        rowCount: 1,
      });

      const result = await productService.updateProduct(
        "user-1",
        "1",
        "Updated",
        "Desc",
        200,
        10
      );

      expect(result).toEqual({ id: "1", name: "Updated" });
    });

    it("throws NotFoundError if not found", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        productService.updateProduct("user-1", "missing", "", "", 0, 0)
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("deletes product", async () => {
      mockedQuery.mockResolvedValue({ rowCount: 1 });

      await productService.deleteProduct("user-1", "1");

      expect(mockedQuery).toHaveBeenCalled();
    });

    it("throws NotFoundError if missing", async () => {
      mockedQuery.mockResolvedValue({ rowCount: 0 });

      await expect(
        productService.deleteProduct("user-1", "missing")
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("deleteBatchProduct", () => {
    it("deletes multiple products", async () => {
      mockedQuery.mockResolvedValue({ rowCount: 3 });

      const result = await productService.deleteBatchProduct("user-1", [
        "1",
        "2",
        "3",
      ]);

      expect(result).toBe(3);
    });
  });
});
