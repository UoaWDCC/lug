import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocalImageStorage } from "./localStorage";

const { mkdirMock, writeFileMock } = vi.hoisted(() => ({
  mkdirMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: mkdirMock,
    writeFile: writeFileMock,
  },
  mkdir: mkdirMock,
  writeFile: writeFileMock,
}));

beforeEach(() => {
  vi.unstubAllEnvs();
  mkdirMock.mockReset();
  writeFileMock.mockReset();
});

describe("LocalImageStorage", () => {
  it("rejects unsupported MIME types", async () => {
    vi.stubEnv("UPLOAD_DIR", "/data/uploads");
    const storage = new LocalImageStorage();
    const file = new File(["<svg></svg>"], "logo.svg", {
      type: "image/svg+xml",
    });

    await expect(storage.upload(file)).rejects.toThrow(
      "Unsupported image type",
    );

    expect(mkdirMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("rejects uploads when UPLOAD_DIR is missing", async () => {
    const storage = new LocalImageStorage();
    const file = new File(["image"], "image.png", { type: "image/png" });

    await expect(storage.upload(file)).rejects.toThrow(
      "UPLOAD_DIR is not configured",
    );

    expect(mkdirMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
