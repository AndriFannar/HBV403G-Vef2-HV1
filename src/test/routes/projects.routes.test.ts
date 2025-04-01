/**
 * @file projects.routes.test.ts
 * @description Tests for the projects.routes.ts file. Generated in part by AI.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date April 01, 2025
 * @dependencies
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../index.js';

vi.mock('../../db/projects.db.js', () => ({
  getProjectSummaryByUserId: vi.fn(),
  getProjectSummaryById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

import * as projectsDb from '../../db/projects.db.js';

const createProjectFormData = (
  projectData: object,
  imageFile?: File
): FormData => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(projectData));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
};

describe('Projects API Endpoints', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it('should return the list of routes on GET /', async () => {
    const response = await app.fetch(new Request('http://localhost:3000/'));
    expect(response.status).toBe(StatusCodes.OK);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return Unauthorized when no token is provided for a protected endpoint', async () => {
    const request = new Request(
      'http://localhost:3000/users/1/projects/summary',
      {
        method: 'GET',
      }
    );
    const response = await app.fetch(request);
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should create a new project when valid data is provided', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiJ9.F2bdOqfodUHptyJ_YMJ7GsPB6JMkg2tjA53E3RXnK6U';
    const projectData = {
      name: 'New Project',
      description: 'Project description',
    };

    (projectsDb.createProject as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      ...projectData,
      imageUrl: '',
    });

    const formData = createProjectFormData(projectData);
    const request = new Request('http://localhost:3000/users/1/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const response = await app.fetch(request);

    expect(response.status).toBe(StatusCodes.CREATED);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('id');
  });

  it('should update a project when valid data is provided', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiJ9.F2bdOqfodUHptyJ_YMJ7GsPB6JMkg2tjA53E3RXnK6U';
    const updateData = {
      id: 1,
      name: 'Updated Project',
      description: 'Updated project description',
      imageUrl: '',
      ownerId: 1,
    };

    (
      projectsDb.getProjectSummaryById as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 1,
      ownerId: 1,
    });

    const formData = createProjectFormData(updateData);
    const request = new Request('http://localhost:3000/users/1/projects/1', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const response = await app.fetch(request);
    expect(response.status).toBe(StatusCodes.OK);
  });
});
