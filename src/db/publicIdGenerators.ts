/**
 * @file publicIdGenerators.db.ts
 * @description Contains the database functions for generating public IDs for entities in the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, businessRule.js, condition.js, flow.js, useCase.js
 */

import type { NewBusinessRule } from '../entities/businessRule.js';
import type { NewCondition } from '../entities/condition.js';
import type { NewUseCase } from '../entities/useCase.js';
import type { NewFlow } from '../entities/flow.js';
import {
  FlowType,
  type Prisma,
  ConditionType,
  ProjectCounterType,
  UseCaseCounterType,
} from '@prisma/client';

/**
 * Generates a public ID for a new condition.
 * @param tx - The Prisma transaction client.
 * @param condition - The new condition to generate a public ID for.
 * @returns - The generated public ID for the condition.
 */
export async function generateConditionPublicId(
  tx: Prisma.TransactionClient,
  condition: NewCondition
): Promise<string> {
  const conditionType =
    condition.conditionType === ConditionType.PRECONDITION
      ? UseCaseCounterType.PRECONDITION
      : UseCaseCounterType.POSTCONDITION;

  const useCaseSequence = await tx.useCaseSequence.findUnique({
    where: {
      // eslint-disable-next-line camelcase
      useCaseId_entityType: {
        useCaseId: condition.useCaseId,
        entityType: conditionType,
      },
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

  if (condition.conditionType === ConditionType.PRECONDITION) {
    return `PRE-${newCount}`;
  } else {
    return `POST-${newCount}`;
  }
}

/**
 * Generates a public ID for a new flow.
 * @param tx - The Prisma transaction client.
 * @param flow - The new flow to generate a public ID for.
 * @returns - The generated public ID for the flow.
 */
export async function generateFlowPublicId(
  tx: Prisma.TransactionClient,
  flow: NewFlow
): Promise<string> {
  if (flow.flowType !== FlowType.NORMAL) {
    const sequenceType =
      flow.flowType === FlowType.ALTERNATE
        ? UseCaseCounterType.ALTERNATEFLOW
        : UseCaseCounterType.EXCEPTIONFLOW;

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
 * Generates a public ID for a new businessRule.
 * @param tx - The Prisma transaction client.
 * @param businessRule - The new businessRule to generate a public ID for.
 * @returns - The generated public ID for the businessRule.
 */
export async function generateBusinessRulePublicId(
  tx: Prisma.TransactionClient,
  businessRule: NewBusinessRule
): Promise<string> {
  const projectSequence = await tx.projectSequence.findUnique({
    where: {
      // eslint-disable-next-line camelcase
      projectId_entityType: {
        projectId: businessRule.projectId,
        entityType: ProjectCounterType.BUSINESSRULE,
      },
    },
  });

  if (!projectSequence) {
    throw new Error('ProjectSequence not found');
  }

  const newCount = projectSequence.count + 1;
  await tx.useCaseSequence.update({
    where: { id: projectSequence.id },
    data: { count: newCount },
  });

  return `BR-${newCount}`;
}

/**
 * Generates a public ID for a new UseCase.
 * @param tx - The Prisma transaction client.
 * @param useCase - The new UseCase to generate a public ID for.
 * @returns - The generated public ID for the UseCase.
 */
export async function generateUseCasePublicId(
  tx: Prisma.TransactionClient,
  useCase: NewUseCase
): Promise<string> {
  const projectSequence = await tx.projectSequence.findUnique({
    where: {
      // eslint-disable-next-line camelcase
      projectId_entityType: {
        projectId: useCase.projectId,
        entityType: ProjectCounterType.USECASE,
      },
    },
  });

  if (!projectSequence) {
    throw new Error('ProjectSequence not found');
  }

  const newCount = projectSequence.count + 1;
  await tx.useCaseSequence.update({
    where: { id: projectSequence.id },
    data: { count: newCount },
  });

  return `UC-${newCount}`;
}
