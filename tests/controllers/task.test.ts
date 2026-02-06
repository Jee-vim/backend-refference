import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  deleteBatchTasks,
} from "../../src/controllers/task.controller";
import * as taskService from "../../src/services/task.service";
import * as lib from "../../src/utils/lib";
import { ValidationError } from "../../src/errors/app.error";

jest.mock("../../src/services/task.service", () => ({
  createTask: jest.fn(),
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  deleteBatchTask: jest.fn(),
}));

jest.mock("../../src/utils/lib", () => ({
  sendResponse: jest.fn(),
  sendPaginatedResponse: jest.fn(),
  getSafeParams: jest.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

const mockedTaskService = taskService as jest.Mocked<typeof taskService>;
const mockedLib = lib as jest.Mocked<typeof lib>;

describe("createTask", () => {
  it("creates task successfully", async () => {
    const req: any = {
      body: { title: "Task 1" },
      userId: "user1",
    };
    const res = mockRes();

    mockedTaskService.createTask.mockResolvedValue({ id: "1" } as any);

    await createTask(req, res);

    expect(mockedTaskService.createTask).toHaveBeenCalledWith(
      "user1",
      { title: "Task 1" }
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      201,
      { id: "1" },
      "Task successfully created"
    );
  });

  it("throws if service fails", async () => {
    const req: any = { body: {}, userId: "user1" };
    const res = mockRes();

    mockedTaskService.createTask.mockRejectedValue(new Error("fail"));

    await expect(createTask(req, res)).rejects.toThrow("fail");
  });
});

describe("getTasks", () => {
  it("returns paginated tasks", async () => {
    const req: any = {
      userId: "user1",
      query: { status: "done", search: "test" },
    };
    const res = mockRes();

    mockedLib.getSafeParams.mockReturnValue({
      limit: 10,
      page: 1,
      offset: 0,
    });

    mockedTaskService.getTasks.mockResolvedValue({
      data: [{ id: "1" }],
      pagination: { totalItems: 1 },
    } as any);

    await getTasks(req, res);

    expect(mockedTaskService.getTasks).toHaveBeenCalledWith(
      "user1",
      { status: "done", search: "test", limit: 10, page: 1, offset: 0 }
    );

    expect(mockedLib.sendPaginatedResponse).toHaveBeenCalledWith(
      res,
      200,
      [{ id: "1" }],
      1,
      1,
      10,
      "Tasks retrieved successfully"
    );
  });
});

describe("getTaskById", () => {
  it("returns task by id", async () => {
    const req: any = {
      params: { id: "123" },
      userId: "user1",
    };
    const res = mockRes();

    mockedTaskService.getTaskById.mockResolvedValue({ id: "123" } as any);

    await getTaskById(req, res);

    expect(mockedTaskService.getTaskById).toHaveBeenCalledWith("user1", "123");
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "123" },
      "Task retrieved successfully"
    );
  });

  it("throws ValidationError if id invalid", async () => {
    const req: any = {
      params: { id: 123 }, // Testing with non-string type
      userId: "user1",
    };
    const res = mockRes();

    await expect(getTaskById(req, res))
      .rejects
      .toThrow(ValidationError);
  });
});

describe("updateTask", () => {
  it("updates task successfully", async () => {
    const updateBody = { status: "done" };
    const req: any = {
      params: { id: "123" },
      body: updateBody, // Controller uses req.body
      userId: "user1",
    };
    const res = mockRes();

    mockedTaskService.updateTask.mockResolvedValue({ id: "123" } as any);

    await updateTask(req, res);

    expect(mockedTaskService.updateTask).toHaveBeenCalledWith(
      "user1",
      "123",
      updateBody
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: "123" },
      "Task updated successfully"
    );
  });

  it("throws ValidationError on invalid id", async () => {
    const req: any = {
      params: { id: undefined },
      userId: "user1",
      body: {},
    };
    const res = mockRes();

    await expect(updateTask(req, res))
      .rejects
      .toThrow(ValidationError);
  });
});

describe("deleteTask", () => {
  it("deletes task successfully", async () => {
    const req: any = {
      params: { id: "123" },
      userId: "user1",
    };
    const res = mockRes();

    mockedTaskService.deleteTask.mockResolvedValue(undefined as any);

    await deleteTask(req, res);

    expect(mockedTaskService.deleteTask).toHaveBeenCalledWith("user1", "123");
    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      null,
      "Task deleted successfully"
    );
  });
});

describe("deleteBatchTasks", () => {
  it("deletes tasks in batch", async () => {
    const req: any = {
      body: { ids: ["1", "2"] },
      userId: "user1",
    };
    const res = mockRes();

    mockedTaskService.deleteBatchTask.mockResolvedValue(2 as any);

    await deleteBatchTasks(req, res);

    expect(mockedTaskService.deleteBatchTask).toHaveBeenCalledWith(
      "user1",
      ["1", "2"]
    );

    expect(mockedLib.sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { deletedCount: 2 },
      "Tasks deleted successfully"
    );
  });

  it("throws ValidationError if ids invalid", async () => {
    const req: any = {
      body: { ids: [] },
      userId: "user1",
    };
    const res = mockRes();

    await expect(deleteBatchTasks(req, res))
      .rejects
      .toThrow(ValidationError);
  });
});
