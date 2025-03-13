import { vi } from 'vitest';

export class PrismaClient {
  constructor() {
    this.categories = {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  }
}
