import * as userService from "../../src/services/user.service";
import pool from "../../src/db/pool";
import { NotFoundError } from "../../src/errors/app.error";

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const mockedQuery = pool.query as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("user service", () => {
  describe("get", () => {
    it("returns all users", async () => {
      const rows = [{ id: "1", email: "a@test.com" }];

      mockedQuery.mockResolvedValue({
        rows,
        rowCount: rows.length,
      });

      const result = await userService.get();

      expect(mockedQuery).toHaveBeenCalledWith(
        "SELECT id, email, profile, created_at, updated_at FROM users",
        []
      );

      expect(result).toEqual(rows);
    });
  });

  describe("getById", () => {
    it("returns user when found", async () => {
      const user = { id: "1", email: "a@test.com" };

      mockedQuery.mockResolvedValue({
        rows: [user],
        rowCount: 1,
      });

      const result = await userService.getById("1");

      expect(result).toEqual(user);
    });

    it("throws NotFoundError when user not found", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(userService.getById("missing"))
        .rejects
        .toBeInstanceOf(NotFoundError);
    });
  });

  describe("update", () => {
    it("updates user", async () => {
      const updatedUser = {
        id: "1",
        email: "new@test.com",
        profile: { bio: "hi" },
      };

      mockedQuery.mockResolvedValue({
        rows: [updatedUser],
        rowCount: 1,
      });

      const result = await userService.update("1", {
        profile: { bio: "hi" },
        email: "new@test.com",
      });

      expect(result).toEqual(updatedUser);
    });

    it("throws NotFoundError if user does not exist", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        userService.update("missing", { email: "x@test.com" })
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
