/**
 * @file categories.test.ts
 * @description Tests for the categories.ts file. Generated in part by AI.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies categories.ts, vitest, status-codes, categories.db.ts
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { categoriesApp } from '../../routes/categories.routes.js';
import { StatusCodes } from 'http-status-codes';

import * as categoriesDb from '../../db/categories.db.js';
vi.mock('../../db/categories.db.js', () => ({
  getCategories: vi.fn(),
  getCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe('Categories API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET / returns all categories', async () => {
    const sampleCategories = [
      { id: 1, name: 'Test Category', slug: 'test-category' },
    ];
    (categoriesDb.getCategories as unknown as Mock).mockResolvedValue(
      sampleCategories
    );

    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);

    const data = await res.json();
    expect(data).toEqual(sampleCategories);
  });

  it('GET /:slug returns 400 if slug is invalid', async () => {
    const req = new Request('http://localhost/INVALID slug!', {
      method: 'GET',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid slug');
  });

  it('GET /:slug returns 404 if category not found', async () => {
    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(null);

    const req = new Request('http://localhost/test-category', {
      method: 'GET',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Category not found');
  });

  it('GET /:slug returns category if found', async () => {
    const sampleCategory = {
      id: 1,
      name: 'Test Category',
      slug: 'test-category',
    };
    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(
      sampleCategory
    );

    const req = new Request('http://localhost/test-category', {
      method: 'GET',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);
    const data = await res.json();
    expect(data).toEqual(sampleCategory);
  });

  it('POST / returns 400 if invalid JSON is sent', async () => {
    const req = new Request('http://localhost/', {
      method: 'POST',
      body: 'not json',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid JSON');
  });

  it('POST / returns 400 if invalid data is sent', async () => {
    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrongField: 'value' }),
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid data');
  });

  it('POST / returns 201 when a valid category is created', async () => {
    const validCategoryInput = { name: 'New Category' };
    const createdCategory = {
      id: 2,
      name: 'New Category',
      slug: 'new-category',
    };

    (categoriesDb.createCategory as unknown as Mock).mockResolvedValue(
      createdCategory
    );

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCategoryInput),
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.CREATED);
    const data = await res.json();
    expect(data).toEqual(createdCategory);
  });

  it('PATCH /:slug returns 400 if invalid JSON is sent', async () => {
    const req = new Request('http://localhost/test-category', {
      method: 'PATCH',
      body: 'invalid',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid JSON');
  });

  it('PATCH /:slug returns 404 if category not found', async () => {
    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/test-category', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Category' }),
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Category not found');
  });

  it('PATCH /:slug returns updated category on valid update', async () => {
    const originalCategory = {
      id: 1,
      name: 'Test Category',
      slug: 'test-category',
    };
    const updatedCategory = {
      id: 1,
      name: 'Updated Category',
      slug: 'updated-category',
    };

    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(
      originalCategory
    );
    (categoriesDb.updateCategory as unknown as Mock).mockResolvedValue(
      updatedCategory
    );

    const req = new Request('http://localhost/test-category', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Category' }),
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);
    const data = await res.json();
    expect(data).toEqual(updatedCategory);
  });

  it('DELETE /:slug returns 400 if slug is invalid', async () => {
    const req = new Request('http://localhost/INVALID slug!', {
      method: 'DELETE',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid slug');
  });

  it('DELETE /:slug returns 404 if category not found', async () => {
    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/test-category', {
      method: 'DELETE',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Category not found');
  });

  it('DELETE /:slug returns 204 on successful deletion', async () => {
    const sampleCategory = {
      id: 1,
      name: 'Test Category',
      slug: 'test-category',
    };
    (categoriesDb.getCategory as unknown as Mock).mockResolvedValue(
      sampleCategory
    );
    (categoriesDb.deleteCategory as unknown as Mock).mockResolvedValue(
      undefined
    );

    const req = new Request('http://localhost/test-category', {
      method: 'DELETE',
    });
    const res = await categoriesApp.request(req);
    expect(res.status).toBe(StatusCodes.NO_CONTENT);
    const text = await res.text();
    expect(text).toBe('');
  });
});
