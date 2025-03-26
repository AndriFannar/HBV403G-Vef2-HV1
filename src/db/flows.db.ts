/**
 * @file flows.db.ts
 * @description Contains the database functions for the flow endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, flow.js
 */

import { Prisma, EntityType, FlowType, PrismaClient } from '@prisma/client';
import type { Flow, NewFlow, BaseFlow } from '../entities/flow.js';

const defaultNumFlows = 10;

export const prisma = new PrismaClient();

/**
 * Generates a public ID for a new flow.
 * @param tx - The Prisma transaction client.
 * @param flow - The new flow to generate a public ID for.
 * @returns - The generated public ID for the flow.
 */
async function generateFlowPublicId(
  tx: Prisma.TransactionClient,
  flow: NewFlow
): Promise<string> {
  if (flow.flowType !== FlowType.NORMAL) {
    const sequenceType =
      flow.flowType === FlowType.ALTERNATE
        ? EntityType.ALTERNATEFLOW
        : EntityType.EXCEPTIONFLOW;

    const useCaseSequence = await tx.useCaseSequence.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        useCaseId_entityType: {
          useCaseId: flow.useCaseId,
          entityType: sequenceType,
        },
      },
      include: {
        useCase: { select: { publicId: true } },
      },
    });

    if (!useCaseSequence) {
      throw new Error('UseCaseSequence not found');
    }

    const newCount = useCaseSequence.count + 1;
    await tx.useCaseSequence.update({
      where: { id: useCaseSequence.id },
      data: { count: newCount },
    });

    if (flow.flowType === FlowType.ALTERNATE) {
      return `${useCaseSequence.useCase.publicId}.${newCount}`;
    } else {
      if (!flow.forFlowId) {
        throw new Error('forFlowId is required for exception flows');
      }

      const parentFlow = await tx.flow.findUnique({
        where: { id: flow.forFlowId },
        select: { publicId: true },
      });
      if (!parentFlow) {
        throw new Error('Flow not found');
      }
      return `${parentFlow.publicId}.E${newCount}`;
    }
  } else {
    const useCase = await tx.useCase.findUnique({
      where: { id: flow.useCaseId },
      select: { publicId: true },
    });
    if (!useCase) throw new Error('UseCase not found');
    return `${useCase.publicId}.0`;
  }
}

/**
 * Gets all flows.
 * @param limit - The maximum number of flows to return at a time.
 * @param offset - The number of flows to skip.
 * @returns - All flows between the limit and offset, if provided. Otherwise, gets 10 flows.
 *            If there are no flows, returns an empty array.
 */
export async function getAllFlows(
  limit: number = defaultNumFlows,
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
  useCaseId: number
): Promise<Array<BaseFlow>> {
  const flows = await prisma.flow.findMany({
    where: {
      useCaseId: useCaseId,
    },
  });
  return flows ?? [];
}

/**
 * Gets a flow by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the flow for.
 * @returns - The flows for the useCase ID, if it exists. Otherwise, returns an empty array.
 */
export async function getFlowsByUseCaseId(
  useCaseId: number
): Promise<Array<Flow>> {
  const flows = await prisma.flow.findMany({
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
 * Gets a flow by a ID.
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
 * @param flow - The new flow to create.
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

    const publicId = await generateFlowPublicId(tx, flow);

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
  return await prisma.$transaction(async tx => {
    const updatedFlow = await tx.flow.update({
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
  });
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
