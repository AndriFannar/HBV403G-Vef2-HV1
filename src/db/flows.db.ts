/**
 * @file flows.db.ts
 * @description Contains the database functions for the flow endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, flow.js, publicIdGenerators.js
 */

import type { Flow, NewFlow, BaseFlow } from '../entities/flow.js';
import { generateFlowPublicId } from './publicIdGenerators.js';
import { FlowType, PrismaClient } from '@prisma/client';

const DEF_NUM_FLOWS = 10;

export const prisma = new PrismaClient();

/**
 * Gets all flows.
 * @param limit - The maximum number of flows to return at a time.
 * @param offset - The number of flows to skip.
 * @returns - All flows between the limit and offset, if provided. Otherwise, gets 10 flows.
 *            If there are no flows, returns an empty array.
 */
export async function getAllFlows(
  limit: number = DEF_NUM_FLOWS,
  offset: number = 0
): Promise<Array<BaseFlow>> {
  const flows = await prisma.flow.findMany({
    skip: offset,
    take: limit,
  });
  return flows ?? [];
}

/**
 * Gets base flows by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the flows for.
 * @returns - The flows for the useCase ID, if they exist. Otherwise, returns an empty array.
 */
export async function getFlowsSummaryByUseCaseId(
  useCaseId: number,
  limit: number = DEF_NUM_FLOWS,
  offset: number = 0
): Promise<Array<BaseFlow>> {
  const flows = await prisma.flow.findMany({
    skip: offset,
    take: limit,
    where: {
      useCaseId: useCaseId,
    },
  });
  return flows ?? [];
}

/**
 * Gets flows by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the flows for.
 * @returns - The flows for the useCase ID, if it exists. Otherwise, returns an empty array.
 */
export async function getFlowsByUseCaseId(
  useCaseId: number,
  limit: number = DEF_NUM_FLOWS,
  offset: number = 0
): Promise<Array<Flow>> {
  const flows = await prisma.flow.findMany({
    skip: offset,
    take: limit,
    where: {
      useCaseId: useCaseId,
    },
    include: {
      steps: {
        include: {
          refs: true,
        },
      },
    },
  });
  return flows ?? [];
}

/**
 * Gets a flow by ID.
 * @param id - The ID of the flow to fetch.
 * @returns - The flow corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getFlowById(id: number): Promise<Flow | null> {
  const flow = await prisma.flow.findFirst({
    where: {
      id: id,
    },
    include: {
      steps: {
        include: {
          refs: true,
        },
      },
    },
  });
  return flow ?? null;
}

/**
 * Creates a new flow.
 * @requires The useCaseId must be set inside the flow object.
 * @param flow - The new flow to create.
 * @throws Error if a Normal flow already exists for the use case.
 * @throws Error if the useCaseId is not set inside the flow object.
 * @returns - The created flow.
 */
export async function createFlow(flow: NewFlow): Promise<Flow> {
  return await prisma.$transaction(async tx => {
    if (flow.flowType === FlowType.NORMAL) {
      const existingNormalFlow = await tx.flow.findFirst({
        where: {
          useCaseId: flow.useCaseId,
          flowType: FlowType.NORMAL,
        },
      });
      if (existingNormalFlow) {
        throw new Error('A Normal flow already exists for this use case');
      }
    }

    if (!flow.useCaseId) {
      throw new Error('Use case ID is required');
    }

    const publicId = await generateFlowPublicId(tx, flow, flow.useCaseId);

    const createdFlow = await tx.flow.create({
      data: {
        name: flow.name,
        flowType: flow.flowType,
        useCaseId: flow.useCaseId,
        forFlowId: flow.forFlowId,
        publicId: publicId,
        stepCount: flow.steps.length,
        steps: {
          create: flow.steps.map((s, i) => ({
            step: s.step,
            publicId: `${i + 1}.`,
            refs: {
              create: s.refs.map(r => ({
                refType: r.refType,
                refId: r.refId,
                location: r.location,
              })),
            },
          })),
        },
      },
      include: {
        steps: {
          include: {
            refs: true,
          },
        },
      },
    });

    return createdFlow;
  });
}

/**
 * Updates a flow by ID.
 * @param flow - The new flow data.
 * @returns - The updated flow, if it exists. Otherwise, returns null.
 */
export async function updateFlow(flow: Flow): Promise<Flow | null> {
  const updatedFlow = await prisma.flow.update({
    where: { id: flow.id },
    data: {
      name: flow.name,
      stepCount: flow.steps.length,
      steps: {
        deleteMany: {},
        create: flow.steps.map((s, i) => ({
          step: s.step,
          publicId: `${i + 1}.`,
          refs: {
            create: s.refs.map(r => ({
              refType: r.refType,
              refId: r.refId,
              location: r.location,
            })),
          },
        })),
      },
    },
    include: {
      steps: {
        include: {
          refs: true,
        },
      },
    },
  });

  return updatedFlow;
}

/**
 * Deletes a flow by ID.
 * @param id - The ID of the flow to delete.
 */
export async function deleteFlow(id: number) {
  await prisma.flow.delete({
    where: { id: id },
  });
}
