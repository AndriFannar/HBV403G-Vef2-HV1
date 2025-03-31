/**
 * @file useCases.db.ts
 * @description Contains the database functions for the useCases endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, useCase.js, publicIdGenerators.js, crypto, slugUtils.js
 */

import type { UseCase, NewUseCase, BaseUseCase } from '../entities/useCase.js';
import { Prisma, PrismaClient, UseCaseCounterType } from '@prisma/client';
import type { NewActor } from '../entities/actor.js';
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
  userId: number,
  limit: number = DEF_NUM_USECASES,
  offset: number = 0
): Promise<Array<BaseUseCase>> {
  const useCases = await prisma.useCase.findMany({
    skip: offset,
    take: limit,
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
  projectId: number,
  limit: number = DEF_NUM_USECASES,
  offset: number = 0
): Promise<Array<BaseUseCase>> {
  const useCases = await prisma.useCase.findMany({
    skip: offset,
    take: limit,
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
      primaryActor: true,
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
      primaryActor: true,
      secondaryActors: true,
      useCaseSequences: true,
    },
  });
  return useCase ?? null;
}

/**
 * Gets base useCase by ID.
 * @param id - The ID of the useCase to fetch.
 * @returns - The useCase corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getUseCaseSummaryById(
  id: number
): Promise<BaseUseCase | null> {
  const useCase = await prisma.useCase.findUnique({
    where: {
      id: id,
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
      primaryActor: true,
      secondaryActors: true,
      useCaseSequences: true,
    },
  });
  return useCase ?? null;
}

/**
 * Processes an actor for a useCase.
 * @param tx - The Prisma transaction client.
 * @param actor - The actor to process.
 * @param projectId - The ID of the project to which the actor belongs.
 * @returns - The processed actor data.
 */
async function processActor(
  tx: Prisma.TransactionClient,
  actor: NewActor,
  projectId: number
) {
  if (actor.id !== null) {
    const existingActor = await tx.actor.findUnique({
      where: { id: actor.id },
      select: { projectId: true },
    });
    if (!existingActor) {
      throw new Error(`Actor with id ${actor.id} not found`);
    }
    if (existingActor.projectId !== projectId) {
      throw new Error(
        `Actor with id ${actor.id} does not belong to the specified project`
      );
    }
    return { connect: { id: actor.id } };
  } else {
    return {
      create: {
        name: actor.name,
        description: actor.description,
        project: { connect: { id: projectId } },
      },
    };
  }
}

/**
 * Verifies nested relations for a useCase.
 * @param tx - The Prisma transaction client.
 * @param useCase - The useCase to verify.
 * @param useCaseId - The ID of the useCase.
 * @returns - The verified data for the useCase.
 */
async function verifyNestedRelations(
  tx: Prisma.TransactionClient,
  useCase: NewUseCase,
  useCaseId: number
) {
  let conditionsData;
  try {
    conditionsData = await Promise.all(
      useCase.conditions.map(async c => ({
        description: c.description,
        conditionType: c.conditionType,
        publicId: await generateConditionPublicId(tx, c, useCaseId),
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
        publicId: await generateFlowPublicId(tx, f, useCaseId),
      }))
    );
  } catch (error) {
    throw new Error('Error creating flows:' + error);
  }

  const secondaryActorsOp = await Promise.all(
    useCase.secondaryActors.map(async actor => {
      return processActor(tx, actor, useCase.projectId);
    })
  );

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
    secondaryActorsOp,
    businessRulesConnect,
    businessRulesCreate,
  };
}

/**
 * Creates a new useCase.
 * @requires The creatorId must be set inside the useCase object.
 * @param useCase - The new useCase to create.
 * @throws Error if the useCase does not have a creatorId.
 * @returns - The created useCase.
 */
export async function createUseCase(useCase: NewUseCase): Promise<UseCase> {
  return await prisma.$transaction(async tx => {
    const publicId = await generateUseCasePublicId(tx, useCase);

    if (!useCase.creatorId) {
      throw new Error('Creator ID is required');
    }

    // Process Primary Actor
    const primaryActorOp = await processActor(
      tx,
      useCase.primaryActor,
      useCase.projectId
    );
    let primaryActorId: number;
    if (primaryActorOp.connect?.id !== undefined) {
      primaryActorId = primaryActorOp.connect.id;
    } else if ('create' in primaryActorOp && primaryActorOp.create) {
      const createdActor = await tx.actor.create({
        data: primaryActorOp.create,
      });
      primaryActorId = createdActor.id;
    } else {
      throw new Error('Invalid primary actor data');
    }

    // Create Base UseCase
    const createdUseCase = await tx.useCase.create({
      data: {
        projectId: useCase.projectId,
        publicId: publicId,
        slug: randomInt(MAX_RANDINT).toString(),
        name: useCase.name,
        creatorId: useCase.creatorId,
        description: useCase.description,
        primaryActorId: primaryActorId,
        trigger: useCase.trigger,
        priority: useCase.priority,
        freqUse: useCase.freqUse ? useCase.freqUse : '',
        otherInfo: useCase.otherInfo?.length ? useCase.otherInfo : [],
        assumptions: useCase.assumptions?.length ? useCase.assumptions : [],
        useCaseSequences: {
          create: [
            { entityType: UseCaseCounterType.ALTERNATEFLOW, count: 0 },
            { entityType: UseCaseCounterType.EXCEPTIONFLOW, count: 0 },
            { entityType: UseCaseCounterType.POSTCONDITION, count: 0 },
            { entityType: UseCaseCounterType.PRECONDITION, count: 0 },
          ],
        },
      },
    });

    // Verify relaion data
    let verifiedData;
    try {
      verifiedData = await verifyNestedRelations(
        tx,
        useCase,
        createdUseCase.id
      );
    } catch (error) {
      throw new Error('Error verifying nested relations:' + error);
    }

    // Separate actors into those needed to connect and those to create
    const secondaryActorsConnect = verifiedData.secondaryActorsOp
      .filter(op => 'connect' in op)
      .map(op => (op as { connect: { id: number } }).connect);
    const secondaryActorsCreate = verifiedData.secondaryActorsOp
      .filter(op => 'create' in op)
      .map(op => (op as { create: never }).create);

    const newSlug = generateSlug(
      createdUseCase.name,
      createdUseCase.id,
      createdUseCase.publicId
    );

    // Update the use case with all the relations needed.
    return await tx.useCase.update({
      where: {
        id: createdUseCase.id,
      },
      data: {
        slug: newSlug,
        secondaryActors: {
          connect: secondaryActorsConnect,
          create: secondaryActorsCreate,
        },
        conditions: {
          create: verifiedData.conditionsData,
        },
        flows: {
          create: verifiedData.flowsData,
        },
        businessRules: {
          connect: verifiedData.businessRulesConnect,
          create: verifiedData.businessRulesCreate,
        },
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
        primaryActor: true,
        secondaryActors: true,
        businessRules: true,
      },
    });
  });
}

/**
 * Updates a useCase by ID.
 * @requires The useCaseId must be set inside the useCase object.
 * @param useCase - The new useCase data.
 * @throws Error if the useCase does not have a useCaseId.
 * @returns - The updated useCase, if it exists. Otherwise, returns null.
 */
export async function updateUseCase(
  useCase: NewUseCase
): Promise<UseCase | null> {
  return await prisma.$transaction(async tx => {
    // Verify existance and ownership of the useCase
    if (!useCase.id) {
      throw new Error('UseCase ID is required');
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

    // Process Primary Actor
    const primaryActorOp = await processActor(
      tx,
      useCase.primaryActor,
      useCase.projectId
    );
    let primaryActorId: number;
    if (primaryActorOp.connect?.id !== undefined) {
      primaryActorId = primaryActorOp.connect.id;
    } else if ('create' in primaryActorOp && primaryActorOp.create) {
      const createdActor = await tx.actor.create({
        data: primaryActorOp.create,
      });
      primaryActorId = createdActor.id;
    } else {
      throw new Error('Invalid primary actor data');
    }

    // Verify nested relations
    let verifiedData;
    try {
      verifiedData = await verifyNestedRelations(tx, useCase, useCase.id);
    } catch (error) {
      throw new Error('Error verifying nested relations:' + error);
    }

    // Separate actors into those needed to connect and those to create
    const secondaryActorsConnect = verifiedData.secondaryActorsOp
      .filter(op => 'connect' in op)
      .map(op => (op as { connect: { id: number } }).connect);
    const secondaryActorsCreate = verifiedData.secondaryActorsOp
      .filter(op => 'create' in op)
      .map(op => (op as { create: never }).create);

    // Update the use case with all the relations needed.
    const updatedUseCase = await tx.useCase.update({
      where: { id: useCase.id },
      data: {
        slug: generateSlug(useCase.name, useCase.id, existingUseCase.publicId),
        name: useCase.name,
        description: useCase.description,
        trigger: useCase.trigger,
        priority: useCase.priority,
        freqUse: useCase.freqUse || '',
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
        primaryActorId: primaryActorId,
        secondaryActors: {
          set: [],
          connect: secondaryActorsConnect,
          create: secondaryActorsCreate,
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
        primaryActor: true,
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
