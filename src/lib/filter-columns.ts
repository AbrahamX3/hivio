import {
	type AnyColumn,
	and,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	lt,
	lte,
	ne,
	notIlike,
	notInArray,
	or,
	type SQL,
	type Table,
	isNull,
	isNotNull,
} from "drizzle-orm";

import type { ExtendedColumnFilter, FilterOperator } from "@/types/data-table";

/**
 * Converts an array of column filters to a Drizzle ORM SQL condition.
 * Based on the sadmann7/tablecn pattern adapted for our schema.
 */
export function filterColumns<T extends Table>({
	table,
	filters,
	joinOperator,
}: {
	table: T;
	filters: ExtendedColumnFilter<T>[];
	joinOperator: "and" | "or";
}): SQL | undefined {
	const joinFn = joinOperator === "and" ? and : or;

	const conditions = filters.map((filter) => {
		const column = getColumn(table, filter.id);
		if (!column) return undefined;

		const operator = filter.operator as FilterOperator;

		switch (operator) {
			case "iLike":
				return filter.variant === "text" && typeof filter.value === "string"
					? ilike(column, `%${filter.value}%`)
					: undefined;

			case "notILike":
				return filter.variant === "text" && typeof filter.value === "string"
					? notIlike(column, `%${filter.value}%`)
					: undefined;

			case "eq":
				if (column.dataType === "boolean" && typeof filter.value === "string") {
					return eq(column, filter.value === "true");
				}
				if (filter.variant === "date" || filter.variant === "dateRange") {
					const date = new Date(Number(filter.value));
					date.setHours(0, 0, 0, 0);
					const end = new Date(date);
					end.setHours(23, 59, 59, 999);
					return and(gte(column, date), lte(column, end));
				}
				if (Array.isArray(filter.value)) {
					return inArray(column, filter.value);
				}
				return eq(column, filter.value);

			case "ne":
				if (column.dataType === "boolean" && typeof filter.value === "string") {
					return ne(column, filter.value === "true");
				}
				if (filter.variant === "date" || filter.variant === "dateRange") {
					const date = new Date(Number(filter.value));
					date.setHours(0, 0, 0, 0);
					const end = new Date(date);
					end.setHours(23, 59, 59, 999);
					return or(lt(column, date), gt(column, end));
				}
				if (Array.isArray(filter.value)) {
					return notInArray(column, filter.value);
				}
				return ne(column, filter.value);

			case "inArray":
				if (Array.isArray(filter.value)) {
					return inArray(column, filter.value);
				}
				return undefined;

			case "notInArray":
				if (Array.isArray(filter.value)) {
					return notInArray(column, filter.value);
				}
				return undefined;

			case "lt":
				return filter.variant === "number" || filter.variant === "range"
					? lt(column, filter.value)
					: filter.variant === "date" && typeof filter.value === "string"
						? lt(
								column,
								(() => {
									const date = new Date(Number(filter.value));
									date.setHours(23, 59, 59, 999);
									return date;
								})(),
							)
						: undefined;

			case "lte":
				return filter.variant === "number" || filter.variant === "range"
					? lte(column, filter.value)
					: filter.variant === "date" && typeof filter.value === "string"
						? lte(
								column,
								(() => {
									const date = new Date(Number(filter.value));
									date.setHours(23, 59, 59, 999);
									return date;
								})(),
							)
						: undefined;

			case "gt":
				return filter.variant === "number" || filter.variant === "range"
					? gt(column, filter.value)
					: filter.variant === "date" && typeof filter.value === "string"
						? gt(
								column,
								(() => {
									const date = new Date(Number(filter.value));
									date.setHours(0, 0, 0, 0);
									return date;
								})(),
							)
						: undefined;

			case "gte":
				return filter.variant === "number" || filter.variant === "range"
					? gte(column, filter.value)
					: filter.variant === "date" && typeof filter.value === "string"
						? gte(
								column,
								(() => {
									const date = new Date(Number(filter.value));
									date.setHours(0, 0, 0, 0);
									return date;
								})(),
							)
						: undefined;

			case "isBetween":
				if (
					(filter.variant === "date" || filter.variant === "dateRange") &&
					Array.isArray(filter.value) &&
					filter.value.length === 2
				) {
					return and(
						filter.value[0]
							? gte(
									column,
									(() => {
										const date = new Date(Number(filter.value[0]));
										date.setHours(0, 0, 0, 0);
										return date;
									})(),
								)
							: undefined,
						filter.value[1]
							? lte(
									column,
									(() => {
										const date = new Date(Number(filter.value[1]));
										date.setHours(23, 59, 59, 999);
										return date;
									})(),
								)
							: undefined,
					);
				}

				if (
					(filter.variant === "number" || filter.variant === "range") &&
					Array.isArray(filter.value) &&
					filter.value.length === 2
				) {
					const firstValue =
						filter.value[0] && filter.value[0].trim() !== ""
							? Number(filter.value[0])
							: null;
					const secondValue =
						filter.value[1] && filter.value[1].trim() !== ""
							? Number(filter.value[1])
							: null;

					if (firstValue === null && secondValue === null) {
						return undefined;
					}

					if (firstValue !== null && secondValue === null) {
						return eq(column, firstValue);
					}

					if (firstValue === null && secondValue !== null) {
						return eq(column, secondValue);
					}

					return and(
						firstValue !== null ? gte(column, firstValue) : undefined,
						secondValue !== null ? lte(column, secondValue) : undefined,
					);
				}
				return undefined;

			case "isEmpty":
				return isNull(column);

			case "isNotEmpty":
				return isNotNull(column);

			default:
				return undefined;
		}
	});

	const validConditions = conditions.filter(
		(condition): condition is SQL => condition !== undefined,
	);

	return validConditions.length > 0 ? joinFn(...validConditions) : undefined;
}

/**
 * Get a column from a table by its key.
 */
export function getColumn<T extends Table>(
	table: T,
	columnKey: string,
): AnyColumn | undefined {
	return (table as unknown as Record<string, AnyColumn>)[columnKey];
}
