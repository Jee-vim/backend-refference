import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteBatchProducts,
} from "../../src/controllers/product.controller"
import * as productService from "../../src/services/product.service";
import * as lib from "../../src/utils/lib";
import { ValidationError } from "../../src/errors/app.error";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mockedProductService = productService as jest.Mocked<typeof productService>;
const mockedLib = lib as jest.Mocked<typeof lib>;

jest.mock("../../src/services/product.service", () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  deleteBatchProduct: jest.fn(),
}));

jest.mock("../../src/utils/lib", () => ({
  getSafeParams: jest.fn(),
  sendResponse: jest.fn(),
  sendPaginatedResponse: jest.fn(),
}));

describe("getProducts", () => {
  it("returns paginated products", async () => {
    const req: any = {
      query: { search: "phone", sort: "asc" },
    };
    const res = mockRes();

    mockedLib.getSafeParams.mockReturnValue({
      limit: 10,
      page: 1,
      offset: 0,
    });

    mockedProductService.getProducts.mockResolvedValue({
      result: [{ id: "1" }],
      countResult: 1,
    } as any);

    await getProducts(req, res);

    expect(mockedProductService.getProducts).toHaveBeenCalledWith({
      search: "phone",
      sort: "asc",
      limit: 10,
      offset: 0,
    });

    expect(mockedLib.sendPaginatedResponse).toHaveBeenCalledWith(
      res,
      200,
      [{ id: "1" }],
      1,
      1,
      10,
      "Products retrieved successfully"
    );
  });
});

describe("getProductById", () => {
  it("returns product by id", async () => {
    const req: any = { params: { id: "123" } };
    const res = mockRes();

    mockedProductService.getProductById.mockResolvedValue({ id: "123" } as any);

    await getProductById(req, res);

    expect(mockedProductService.getProductById).toHaveBeenCalledWith("123");
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "123" },
      "Product retrieved successfully"
    );
  });

  it("throws ValidationError if id is not string", async () => {
    const req: any = { params: { id: ["123"] } };
    const res = mockRes();

    await expect(getProductById(req, res)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("createProduct", () => {
  it("creates a product", async () => {
    const req: any = {
      body: { name: "P", description: "D", price: 10, stock: 5 },
      userId: "user1",
    };
    const res = mockRes();

    mockedProductService.createProduct.mockResolvedValue({ id: "1" } as any);

    await createProduct(req, res);

    expect(mockedProductService.createProduct).toHaveBeenCalledWith(
      "user1",
      "P",
      "D",
      10,
      5
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      201,
      { id: "1" },
      "Product created successfully"
    );
  });
});

describe("updateProduct", () => {
  it("updates product", async () => {
    const req: any = {
      params: { id: "123" },
      body: { name: "P", description: "D", price: 20, stock: 3 },
      userId: "user1",
    };
    const res = mockRes();

    mockedProductService.updateProduct.mockResolvedValue({ id: "123" } as any);

    await updateProduct(req, res);

    expect(mockedProductService.updateProduct).toHaveBeenCalledWith(
      "user1",
      "123",
      "P",
      "D",
      20,
      3
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "123" },
      "Product updated successfully"
    );
  });

  it("throws ValidationError if id invalid", async () => {
    const req: any = {
      params: { id: null },
      body: {
        name: "P",
        description: "D",
        price: 10,
        stock: 1,
      },
      userId: "user1",
    };
    const res = mockRes();

    await expect(updateProduct(req, res)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("deleteProduct", () => {
  it("deletes product", async () => {
    const req: any = {
      params: { id: "123" },
      userId: "user1",
    };
    const res = mockRes();

    mockedProductService.deleteProduct.mockResolvedValue(undefined);

    await deleteProduct(req, res);

    expect(mockedProductService.deleteProduct).toHaveBeenCalledWith("user1", "123");
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      null,
      "Product deleted successfully"
    );
  });
});

describe("deleteBatchProducts", () => {
  it("deletes batch products", async () => {
    const req: any = {
      body: { ids: ["1", "2"] },
      userId: "user1",
    };
    const res = mockRes();

    mockedProductService.deleteBatchProduct.mockResolvedValue(2);

    await deleteBatchProducts(req, res);

    expect(mockedProductService.deleteBatchProduct).toHaveBeenCalledWith(
      "user1",
      ["1", "2"]
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { deletedCount: 2 },
      "Batch delete successful"
    );
  });

  it("throws ValidationError for invalid ids", async () => {
    const req: any = {
      body: { ids: [] },
      userId: "user1",
    };
    const res = mockRes();

    await expect(deleteBatchProducts(req, res)).rejects.toBeInstanceOf(ValidationError);
  });
});
