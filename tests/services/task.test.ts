import * as taskService from "../../src/services/task.service";
import pool from "../../src/db/pool";
import { NotFoundError } from "../../src/errors/app.error";

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const mockedQuery = pool.query as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("task service", () => {
  describe("createTask", () => {
    it("creates a task with default status", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1", title: "Task", status: "pending" }],
      });

      const result = await taskService.createTask("user-1", {
        title: "Task",
      });

      expect(mockedQuery).toHaveBeenCalledWith(
        "INSERT INTO tasks (user_id, title, status) VALUES ($1, $2, $3) RETURNING *",
        ["user-1", "Task", "pending"]
      );

      expect(result).toEqual({ id: "1", title: "Task", status: "pending" });
    });
  });

  describe("getTasks", () => {
    it("returns tasks with pagination", async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rows: [{ id: "1" }],
        }) // data query
        .mockResolvedValueOnce({
          rows: [{ count: "1" }],
        }); // count query

      const result = await taskService.getTasks("user-1", {
        status: "done",
        search: "test",
        limit: 10,
        offset: 0,
        page: 1,
      });

      expect(result).toEqual({
        data: [{ id: "1" }],
        pagination: {
          totalItems: 1,
          page: 1,
          limit: 10,
        },
      });

      expect(mockedQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe("getTaskById", () => {
    it("returns task when found", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1" }],
        rowCount: 1,
      });

      const result = await taskService.getTaskById("user-1", "1");

      expect(result).toEqual({ id: "1" });
    });

    it("throws NotFoundError if task missing", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        taskService.getTaskById("user-1", "missing")
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("updateTask", () => {
    it("updates task", async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ id: "1", title: "New" }],
        rowCount: 1,
      });

      const result = await taskService.updateTask("user-1", "1", {
        title: "New",
      });

      expect(result).toEqual({ id: "1", title: "New" });
    });

    it("throws NotFoundError if task missing", async () => {
      mockedQuery.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      await expect(
        taskService.updateTask("user-1", "missing", {})
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("deleteTask", () => {
    it("deletes task", async () => {
      mockedQuery.mockResolvedValue({
        rowCount: 1,
      });

      await taskService.deleteTask("user-1", "1");

      expect(mockedQuery).toHaveBeenCalled();
    });

    it("throws NotFoundError if task missing", async () => {
      mockedQuery.mockResolvedValue({
        rowCount: 0,
      });

      await expect(
        taskService.deleteTask("user-1", "missing")
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("deleteBatchTask", () => {
    it("deletes multiple tasks", async () => {
      mockedQuery.mockResolvedValue({
        rowCount: 2,
      });

      const result = await taskService.deleteBatchTask("user-1", ["1", "2"]);

      expect(result).toBe(2);
    });

    it("throws NotFoundError if no tasks deleted", async () => {
      mockedQuery.mockResolvedValue({
        rowCount: 0,
      });

      await expect(
        taskService.deleteBatchTask("user-1", ["1"])
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
