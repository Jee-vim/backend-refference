import * as authService from "../../src/services/auth.service";
import pool from "../../src/db/pool";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const mockedQuery = pool.query as jest.Mock;
const mockedHash = bcrypt.hash as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;
const mockedJwtSign = jwt.sign as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth service", () => {
  describe("generateAccessToken", () => {
    it("generates jwt with correct payload", () => {
      mockedJwtSign.mockReturnValue("access-token");

      const token = authService.generateAccessToken("user-1");

      expect(mockedJwtSign).toHaveBeenCalledWith(
        { userId: "user-1" },
        process.env.JWT_SECRET,
        { expiresIn: authService.ACCESS_EXPIRE }
      );

      expect(token).toBe("access-token");
    });
  });

  describe("register", () => {
    it("hashes password and inserts user", async () => {
      mockedHash.mockResolvedValue("hashed-password");
      mockedQuery.mockResolvedValue({
        rows: [{ id: "user-1" }],
      });

      const result = await authService.register(
        "test@test.com",
        "password",
        "John"
      );

      expect(mockedHash).toHaveBeenCalledWith("password", 10);
      expect(mockedQuery).toHaveBeenCalledWith(
        "INSERT INTO users (email, password_hash, profile) VALUES ($1, $2, $3) RETURNING id",
        [
          "test@test.com",
          "hashed-password",
          JSON.stringify({ name: "John", avatar: null }),
        ]
      );

      expect(result).toEqual({ id: "user-1" });
    });
  });

  describe("login", () => {
    it("logs in successfully with valid credentials", async () => {
      const dbUser = {
        id: "user-1",
        email: "test@test.com",
        password_hash: "hashed",
        created_at: new Date(),
        profile: { name: "John" },
      };

      mockedQuery
        .mockResolvedValueOnce({ rows: [dbUser], rowCount: 1 }) // SELECT user
        .mockResolvedValueOnce({}); // UPDATE refresh token

      mockedCompare.mockResolvedValue(true);
      mockedJwtSign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await authService.login("test@test.com", "password");

      expect(mockedCompare).toHaveBeenCalledWith(
        "password",
        dbUser.password_hash
      );

      expect(mockedQuery).toHaveBeenCalledWith(
        "UPDATE users SET current_refresh_token = $1 WHERE id = $2",
        ["refresh-token", "user-1"]
      );

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          id: "user-1",
          email: "test@test.com",
          created_at: dbUser.created_at,
          profile: dbUser.profile,
        },
      });
    });

    it("throws error if user not found", async () => {
      mockedQuery.mockResolvedValue({ rows: [], rowCount: 0 });

      await expect(
        authService.login("missing@test.com", "password")
      ).rejects.toThrow("Invalid credentials");
    });

    it("throws error if password invalid", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ password_hash: "hashed" }],
        rowCount: 1,
      });

      mockedCompare.mockResolvedValue(false);

      await expect(
        authService.login("test@test.com", "wrong")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refresh", () => {
    it("returns current refresh token", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ current_refresh_token: "refresh-token" }],
      });

      const token = await authService.refresh("user-1");

      expect(token).toBe("refresh-token");
    });
  });

  describe("logout", () => {
    it("clears refresh token", async () => {
      mockedQuery.mockResolvedValue({});

      await authService.logout("user-1");

      expect(mockedQuery).toHaveBeenCalledWith(
        "UPDATE users SET current_refresh_token = NULL WHERE id = $1",
        ["user-1"]
      );
    });
  });
});
