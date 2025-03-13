/**
 * @file categories.db.test.ts
 * @description Contains the tests for the database functions for the categories endpoint of the API. Written in part by AI.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies categories.db, @prisma/client
 */

import { prisma } from '../../db/categories.db.js';
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  type Mock,
} from 'vitest';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      categories = {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
    },
  };
});

let categoriesDb: typeof import('../../db/categories.db.js');
beforeAll(async () => {
  categoriesDb = await import('../../db/categories.db.js');
});

describe('categories.db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCategories returns all categorieSs', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1', slug: 'category-1' },
      { id: 2, name: 'Category 2', slug: 'category-2' },
    ];
    (prisma.categories.findMany as unknown as Mock).mockResolvedValue(
      mockCategories
    );

    const result = await categoriesDb.getCategories();
    expect(result).toEqual(mockCategories);
    expect(prisma.categories.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });
  });

  it('getCategory returns a category when found', async () => {
    const mockCategory = {
      id: 1,
      name: 'Category 1',
      slug: 'category-1',
      questions: [],
    };
    (prisma.categories.findFirst as unknown as Mock).mockResolvedValue(
      mockCategory
    );

    const result = await categoriesDb.getCategory('category-1');
    expect(result).toEqual(mockCategory);
    expect(prisma.categories.findFirst).toHaveBeenCalledWith({
      where: { slug: 'category-1' },
      include: { questions: { include: { answers: true } } },
    });
  });

  it('createCategory creates a new category', async () => {
    const baseCategory = { name: 'New Category' };
    const createdCategory = {
      id: 3,
      name: 'New Category',
      slug: 'new-category',
    };
    (prisma.categories.create as unknown as Mock).mockResolvedValue(
      createdCategory
    );

    const result = await categoriesDb.createCategory(baseCategory);
    expect(result).toEqual(createdCategory);
    expect(prisma.categories.create).toHaveBeenCalledWith({
      data: {
        name: baseCategory.name,
        slug: baseCategory.name.toLowerCase().replaceAll(' ', '-'),
      },
    });
  });

  it('updateCategory updates an existing category', async () => {
    const baseCategory = { name: 'Updated Category' };
    const updatedCategory = {
      id: 1,
      name: 'Updated Category',
      slug: 'updated-category',
    };
    (prisma.categories.update as unknown as Mock).mockResolvedValue(
      updatedCategory
    );

    const result = await categoriesDb.updateCategory('old-slug', baseCategory);
    expect(result).toEqual(updatedCategory);
    expect(prisma.categories.update).toHaveBeenCalledWith({
      where: { slug: 'old-slug' },
      data: {
        name: baseCategory.name,
        slug: baseCategory.name.toLowerCase().replaceAll(' ', '-'),
      },
    });
  });

  it('deleteCategory deletes a category', async () => {
    (prisma.categories.delete as unknown as Mock).mockResolvedValue(undefined);
    await expect(
      categoriesDb.deleteCategory('category-1')
    ).resolves.toBeUndefined();
    expect(prisma.categories.delete).toHaveBeenCalledWith({
      where: { slug: 'category-1' },
    });
  });
});
