import type { ValidationError } from "@nestjs/common"

import type { ApiErrorDetail } from "../types/apiResponse.type"

const MAX_VALIDATION_DEPTH = 20;
const MAX_VALIDATION_DETAILS = 100;

export const flattenValidationErrors = (
  errors: ValidationError[]
): ApiErrorDetail[] => {
  const details: ApiErrorDetail[] = [];

  const visit = (
    entries: ValidationError[],
    parentPath: string,
    depth: number
  ): void => {
    if (
      depth > MAX_VALIDATION_DEPTH ||
      details.length >= MAX_VALIDATION_DETAILS
    ) {
      return;
    }

    for (const error of entries) {
      if (details.length >= MAX_VALIDATION_DETAILS) {
        return;
      }

      const field = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      for (const [code, message] of Object.entries(
        error.constraints ?? {}
      )) {
        if (details.length >= MAX_VALIDATION_DETAILS) {
          return;
        }

        details.push({
          field,
          code,
          message
        });
      }

      if (error.children?.length) {
        visit(error.children, field, depth + 1);
      }
    }
  }

  visit(errors, '', 0);

  return details;
}
