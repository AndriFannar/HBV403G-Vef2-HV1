/**
 * @file useCases.db.ts
 * @description Contains the database functions for the useCases endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, useCase.js, publicIdGenerators.js, crypto, slugUtils.js
 */

import type { UseCase, NewUseCase, BaseUseCase } from '../entities/useCase.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { generateSlug } from '../lib/slugUtils.js';
import { randomInt } from 'crypto';
import {
  generateFlowPublicId,
  generateUseCasePublicId,
  generateConditionPublicId,
  generateBusinessRulePublicId,
} from './publicIdGenerators.js';

const MAX_RANDINT = 281474976710655;
const DEF_NUM_FULL_USECASES = 5;
const DEF_NUM_USECASES = 10;

export const prisma = new PrismaClient();

/**
 * Gets all flows.
 * @param limit - The maximum number of flows to return at a time.
 * @param offset - The number of flows to skip.
 * @returns - All flows between the limit and offset, if provided. Otherwise, gets 10 flows.
 *            If there are no flows, returns an empty array.
 */
export async function getAllUseCases(
  limit: number = DEF_NUM_USECASES,
  offset: number = 0
): Promise<Array<BaseUseCase>> {
  const useCases = await prisma.useCase.findMany({
    skip: offset,
    take: limit,
  });
  return useCases ?? [];
}

/**
 * Gets base useCases by a user ID.
 * @param userId - The ID of the user to get the useCases for.
 * @returns - The useCases for the user ID, if they exist. Otherwise, returns an empty array.
 */
export async function getUseCasesSummaryByUserId(
  userId: number
): Promise<Array<BaseUseCase>> {
  const useCases = await prisma.useCase.findMany({
    where: {
      creatorId: userId,
    },
  });
  return useCases ?? [];
}

/**
 * Gets base useCases by a project ID.
 * @param projectId - The ID of the project to get the useCases for.
 * @returns - The useCases for the project ID, if they exist. Otherwise, returns an empty array.
 */
export async function getUseCasesSummaryByProjectId(
  projectId: number
): Promise<Array<BaseUseCase>> {
  const useCases = await prisma.useCase.findMany({
    where: {
      projectId: projectId,
    },
  });
  return useCases ?? [];
}

/**
 * Gets useCases by a project ID.
 * @param projectId - The ID of the project to get the useCases for.
 * @returns - The useCases for the project ID, if they exist. Otherwise, returns an empty array.
 */
export async function getFullUseCasesByProjectId(
  projectId: number,
  limit: number = DEF_NUM_FULL_USECASES,
  offset: number = 0
): Promise<UseCase[]> {
  const useCases = await prisma.useCase.findMany({
    where: { projectId: projectId },
    skip: offset,
    take: limit,
    include: {
      conditions: true,
      flows: {
        include: {
          steps: {
            include: {
              refs: true,
            },
          },
        },
      },
      businessRules: true,
      secondaryActors: true,
      useCaseSequences: true,
    },
  });
  return useCases ?? [];
}

/**
 * Gets a useCase by slug.
 * @param id - The slug of the useCase to fetch.
 * @returns - The useCase corresponding to given slug, if it exists. Otherwise, returns null.
 */
export async function getUseCaseBySlug(slug: string): Promise<UseCase | null> {
  const useCase = await prisma.useCase.findFirst({
    where: { slug: slug },
    include: {
      conditions: true,
      flows: {
        include: {
          steps: {
            include: {
              refs: true,
            },
          },
        },
      },
      businessRules: true,
      secondaryActors: true,
      useCaseSequences: true,
    },
  });
  return useCase ?? null;
}

/**
 * Gets a useCase by ID.
 * @param id - The ID of the useCase to fetch.
 * @returns - The useCase corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getUseCaseById(id: number): Promise<UseCase | null> {
  const useCase = await prisma.useCase.findFirst({
    where: { id: id },
    include: {
      conditions: true,
      flows: {
        include: {
          steps: {
            include: {
              refs: true,
            },
          },
        },
      },
      businessRules: true,
      secondaryActors: true,
      useCaseSequences: true,
    },
  });
  return useCase ?? null;
}

async function verifyNestedRelations(
  tx: Prisma.TransactionClient,
  useCase: NewUseCase
) {
  let conditionsData;
  try {
    conditionsData = await Promise.all(
      useCase.conditions.map(async c => ({
        description: c.description,
        conditionType: c.conditionType,
        publicId: await generateConditionPublicId(tx, c),
      }))
    );
  } catch (error) {
    throw new Error('Error creating conditions:' + error);
  }

  let flowsData;
  try {
    flowsData = await Promise.all(
      useCase.flows.map(async f => ({
        name: f.name,
        flowType: f.flowType,
        steps: {
          create: f.steps.map((s, i) => ({
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
        publicId: await generateFlowPublicId(tx, f),
      }))
    );
  } catch (error) {
    throw new Error('Error creating flows:' + error);
  }

  const primaryActor = await prisma.actor.findUnique({
    where: { id: useCase.primaryActorId },
    select: { projectId: true },
  });
  if (!primaryActor) {
    throw new Error(
      `Primary actor with id ${useCase.primaryActorId} not found`
    );
  }
  if (primaryActor.projectId !== useCase.projectId) {
    throw new Error(
      `Primary actor with id ${useCase.primaryActorId} does not belong to the specified project`
    );
  }

  let actorsConnect;
  try {
    actorsConnect = await Promise.all(
      useCase.secondaryActors
        .filter(act => act.id !== null)
        .map(async act => {
          const id = act.id!;
          const existingAct = await prisma.actor.findUnique({
            where: { id: id },
            select: { projectId: true },
          });
          if (!existingAct) {
            throw new Error(`Actor with id ${id} not found`);
          }
          if (existingAct.projectId !== useCase.projectId) {
            throw new Error(
              `Actor with id ${id} does not belong to the specified project`
            );
          }
          return { id: id };
        })
    );
  } catch (error) {
    throw new Error('Error connecting actors:' + error);
  }

  let actorsCreate;
  try {
    actorsCreate = useCase.secondaryActors
      .filter(act => act.id === null)
      .map(act => ({
        name: act.name,
        description: act.description,
        project: { connect: { id: useCase.projectId } },
      }));
  } catch (error) {
    throw new Error('Error creating actors:' + error);
  }

  let businessRulesConnect;
  try {
    businessRulesConnect = await Promise.all(
      useCase.businessRules
        .filter(br => br.id !== null)
        .map(async br => {
          const id = br.id!;
          const existingBR = await prisma.businessRule.findUnique({
            where: { id: id },
            select: { projectId: true, publicId: true },
          });
          if (!existingBR) {
            throw new Error(`BusinessRule with id ${id} not found`);
          }
          if (existingBR.projectId !== useCase.projectId) {
            throw new Error(
              `BusinessRule with id ${id} does not belong to the specified project`
            );
          }
          return {
            // eslint-disable-next-line camelcase
            projectId_publicId: {
              projectId: existingBR.projectId,
              publicId: existingBR.publicId,
            },
          };
        })
    );
  } catch (error) {
    throw new Error('Error connecting business rules:' + error);
  }

  let businessRulesCreate;
  try {
    businessRulesCreate = await Promise.all(
      useCase.businessRules
        .filter(br => br.id === null)
        .map(async br => {
          const publicId = await generateBusinessRulePublicId(tx, br);
          return {
            ruleDef: br.ruleDef,
            type: br.type,
            mutability: br.mutability,
            source: br.source,
            publicId,
            project: { connect: { id: br.projectId } },
          };
        })
    );
  } catch (error) {
    throw new Error('Error creating business rules:' + error);
  }

  return {
    conditionsData,
    flowsData,
    actorsConnect,
    actorsCreate,
    businessRulesConnect,
    businessRulesCreate,
  };
}

/**
 * Creates a new useCase.
 * @param useCase - The new useCase to create.
 * @returns - The created useCase.
 */
export async function createUseCase(useCase: NewUseCase): Promise<UseCase> {
  return await prisma.$transaction(async tx => {
    const publicId = await generateUseCasePublicId(tx, useCase);

    let verifiedData;
    try {
      verifiedData = await verifyNestedRelations(tx, useCase);
    } catch (error) {
      throw new Error('Error verifying nested relations:' + error);
    }

    const createdUseCase = await tx.useCase.create({
      data: {
        projectId: useCase.projectId,
        publicId: publicId,
        slug: randomInt(MAX_RANDINT).toString(),
        name: useCase.name,
        creatorId: useCase.creatorId,
        primaryActorId: useCase.primaryActorId,
        secondaryActors: {
          connect: verifiedData.actorsConnect,
          create: verifiedData.actorsCreate,
        },
        description: useCase.description,
        trigger: useCase.trigger,
        conditions: {
          create: verifiedData.conditionsData,
        },
        flows: {
          create: verifiedData.flowsData,
        },
        priority: useCase.priority,
        freqUse: useCase.freqUse ? useCase.freqUse : '',
        businessRules: {
          connect: verifiedData.businessRulesConnect,
          create: verifiedData.businessRulesCreate,
        },
        otherInfo: useCase.otherInfo?.length ? useCase.otherInfo : [],
        assumptions: useCase.assumptions?.length ? useCase.assumptions : [],
      },
    });

    const newSlug = generateSlug(
      createdUseCase.name,
      createdUseCase.id,
      createdUseCase.publicId
    );

    return await prisma.useCase.update({
      where: {
        id: createdUseCase.id,
      },
      data: {
        slug: newSlug,
      },
      include: {
        conditions: true,
        flows: {
          include: {
            steps: {
              include: {
                refs: true,
              },
            },
          },
        },
        secondaryActors: true,
        businessRules: true,
      },
    });
  });
}

/**
 * Updates a useCase by ID.
 * @param useCase - The new useCase data.
 * @returns - The updated useCase, if it exists. Otherwise, returns null.
 */
export async function updateUseCase(useCase: UseCase): Promise<UseCase | null> {
  return await prisma.$transaction(async tx => {
    let verifiedData;
    try {
      verifiedData = await verifyNestedRelations(tx, useCase);
    } catch (error) {
      throw new Error('Error verifying nested relations:' + error);
    }

    const existingUseCase = await tx.useCase.findUnique({
      where: { id: useCase.id },
    });

    if (!existingUseCase) {
      return null;
    }

    if (existingUseCase.projectId !== useCase.projectId) {
      throw new Error(
        `UseCase with id ${useCase.id} does not belong to the specified project`
      );
    }

    if (existingUseCase.creatorId !== useCase.creatorId) {
      throw new Error(
        `UseCase with id ${useCase.id} does not belong to the specified user`
      );
    }

    const updatedUseCase = await tx.useCase.update({
      where: { id: useCase.id },
      data: {
        slug: await generateSlug(
          useCase.name,
          useCase.id,
          existingUseCase.publicId
        ),
        name: useCase.name,
        description: useCase.description,
        trigger: useCase.trigger,
        priority: useCase.priority,
        freqUse: useCase.freqUse ? useCase.freqUse : '',
        otherInfo: useCase.otherInfo?.length ? useCase.otherInfo : [],
        assumptions: useCase.assumptions?.length ? useCase.assumptions : [],
        conditions: {
          deleteMany: { useCaseId: useCase.id },
          create: verifiedData.conditionsData,
        },
        flows: {
          deleteMany: { useCaseId: useCase.id },
          create: verifiedData.flowsData,
        },
        secondaryActors: {
          set: [],
          connect: verifiedData.actorsConnect,
          create: verifiedData.actorsCreate,
        },
        businessRules: {
          set: [],
          connect: verifiedData.businessRulesConnect,
          create: verifiedData.businessRulesCreate,
        },
      },
      include: {
        conditions: true,
        flows: { include: { steps: { include: { refs: true } } } },
        secondaryActors: true,
        businessRules: true,
      },
    });

    return updatedUseCase;
  });
}

/**
 * Deletes a useCase by ID.
 * @param id - The ID of the useCase to delete.
 */
export async function deleteUseCase(id: number) {
  await prisma.useCase.delete({
    where: { id: id },
  });
}
