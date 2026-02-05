import { register, login, refresh, logout } from "../../src/controllers/auth.controller";
import * as authService from "../../src/services/auth.service";
import * as lib from "../../src/utils/lib";
import jwt from "jsonwebtoken";
import { ValidationError } from "../../src/errors/app.error";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();
jest.mock("../../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  generateAccessToken: jest.fn(),
}));

jest.mock("../../src/utils/lib", () => ({
  sendResponse: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  decode: jest.fn(),
}));

describe("register controller", () => {
  it("registers a user successfully", async () => {
    const req: any = {
      body: { email: "a@test.com", password: "123", name: "A" },
    };
    const res = mockRes();

    (authService.register as jest.Mock).mockResolvedValue({ id: "1" });

    await register(req, res, mockNext);

    expect(authService.register).toHaveBeenCalledWith("a@test.com", "123", "A");
    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      201,
      { id: "1" },
      "User registered successfully"
    );
  });

  it("throws ValidationError on duplicate email", async () => {
    const req: any = {
      body: { email: "a@test.com", password: "123", name: "A" },
    };
    const res = mockRes();

    (authService.register as jest.Mock).mockRejectedValue({ code: "23505" });

    await expect(register(req, res, mockNext)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("login controller", () => {
  it("logs in successfully and sets cookie", async () => {
    const req: any = {
      body: { email: "a@test.com", password: "123" },
    };
    const res = mockRes();

    (authService.login as jest.Mock).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: { id: "1" },
    });

    await login(req, res, mockNext);

    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "refresh",
      expect.objectContaining({ httpOnly: true })
    );

    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { accessToken: "access", user: { id: "1" } },
      "Login successful"
    );
  });

  it("returns 401 on invalid credentials", async () => {
    const req: any = {
      body: { email: "a@test.com", password: "wrong" },
    };
    const res = mockRes();

    (authService.login as jest.Mock).mockRejectedValue(
      new Error("Invalid credentials")
    );

    await login(req, res, mockNext);

    expect(res.clearCookie).toHaveBeenCalled();
    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      401,
      null,
      "Invalid credentials"
    );
  });
});

describe("refresh controller", () => {
  it("returns new access token when refresh token is valid", async () => {
    const req: any = {
      cookies: { refreshToken: "validToken" },
    };
    const res = mockRes();

    (jwt.verify as jest.Mock).mockReturnValue({ userId: "1" });
    (authService.refresh as jest.Mock).mockResolvedValue("validToken");
    (authService.generateAccessToken as jest.Mock).mockReturnValue("newAccess");

    await refresh(req, res);

    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { accessToken: "newAccess" },
      "Token refreshed"
    );
  });

  it("returns 401 if no refresh token", async () => {
    const req: any = { cookies: {} };
    const res = mockRes();

    await refresh(req, res);

    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      401,
      null,
      "No refresh token provided"
    );
  });
});

describe("logout controller", () => {
  it("logs out user and clears cookie", async () => {
    const req: any = {
      cookies: { refreshToken: "token" },
    };
    const res = mockRes();

    (jwt.decode as jest.Mock).mockReturnValue({ userId: "1" });
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    await logout(req, res, mockNext);

    expect(authService.logout).toHaveBeenCalledWith("1");
    expect(res.clearCookie).toHaveBeenCalled();
    expect(lib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      null,
      "Logged out successfully"
    );
  });
});
