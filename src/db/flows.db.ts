/**
 * @file flows.db.ts
 * @description Contains the database functions for the flow endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies
 */

import type { Flow, BaseFlow } from '../entities/flow.js';
import { PrismaClient } from '@prisma/client';

const maxSlugLength = 64;
const defaultNumFlows = 10;

export const prisma = new PrismaClient();

/**
 * Generates a slug for a project.
 * @param projectName - The projectName string to generate a slug for.
 * @param id - The id of the project.
 * @returns - The generated slug.
 */
function generateSlug(projectName: string, id: number): string {
  return (
    id.toString() +
    '-' +
    projectName
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll(/[^a-z0-9-]/g, '')
      .slice(0, maxSlugLength - id.toString().length - 1)
  );
}

/**
 * Gets all projects.
 * @param limit - The maximum number of projects to return at a time.
 * @param offset - The number of projects to skip.
 * @returns - All projects between the limit and offset, if provided. Otherwise, gets 10 projects.
 *            If there are no projects, returns an empty array.
 */
export async function getAllProjects(
  limit: number = defaultNumProjects,
  offset: number = 0
): Promise<Array<Project>> {
  const projects = await prisma.project.findMany({
    skip: offset,
    take: limit,
    include: {
      useCases: true,
      actors: true,
      businessRules: true,
    },
  });
  return projects ?? null;
}