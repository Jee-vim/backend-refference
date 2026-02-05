import {
  getUser,
  getUserById,
  updateUser,
} from "../../src/controllers/user.controller";
import * as profileService from "../../src/services/user.service";
import * as lib from "../../src/utils/lib";

jest.mock("../../src/services/user.service", () => ({
  get: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
}));

jest.mock("../../src/utils/lib", () => ({
  sendResponse: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mockedProfileService = profileService as jest.Mocked<typeof profileService>;
const mockedLib = lib as jest.Mocked<typeof lib>;

describe("getUser", () => {
  it("returns current user", async () => {
    const req: any = {};
    const res = mockRes();

    mockedProfileService.get.mockResolvedValue({ id: "1", name: "John" } as any);

    await getUser(req, res);

    expect(mockedProfileService.get).toHaveBeenCalled();
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "1", name: "John" },
      "User retrieved successfully"
    );
  });

  it("throws if service fails", async () => {
    const req: any = {};
    const res = mockRes();

    mockedProfileService.get.mockRejectedValue(new Error("boom"));

    await expect(getUser(req, res)).rejects.toThrow("boom");
  });
});

describe("getUserById", () => {
  it("returns user by id", async () => {
    const req: any = {
      userId: "user1",
    };
    const res = mockRes();

    mockedProfileService.getById.mockResolvedValue({ id: "user1" } as any);

    await getUserById(req, res);

    expect(mockedProfileService.getById).toHaveBeenCalledWith("user1");
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "user1" },
      "User retrieved successfully"
    );
  });

  it("throws if service fails", async () => {
    const req: any = { userId: "user1" };
    const res = mockRes();

    mockedProfileService.getById.mockRejectedValue(new Error("fail"));

    await expect(getUserById(req, res)).rejects.toThrow("fail");
  });
});

describe("updateUser", () => {
  it("updates user successfully", async () => {
    const req: any = {
      userId: "user1",
      body: {
        profile: { bio: "hello" },
        email: "test@test.com",
      },
    };
    const res = mockRes();

    mockedProfileService.update.mockResolvedValue({ id: "user1" } as any);

    await updateUser(req, res);

    expect(mockedProfileService.update).toHaveBeenCalledWith(
      "user1",
      {
        profile: { bio: "hello" },
        email: "test@test.com",
      }
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "user1" },
      "User updated successfully"
    );
  });

  it("throws if service fails", async () => {
    const req: any = {
      userId: "user1",
      body: {},
    };
    const res = mockRes();

    mockedProfileService.update.mockRejectedValue(new Error("nope"));

    await expect(updateUser(req, res)).rejects.toThrow("nope");
  });
});
