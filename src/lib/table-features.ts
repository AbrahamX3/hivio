import {
	columnFacetingFeature,
	columnFilteringFeature,
	columnOrderingFeature,
	columnPinningFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createFacetedMinMaxValues,
	createFacetedRowModel,
	createFacetedUniqueValues,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_arrIncludes,
	filterFn_equals,
	filterFn_inDateRange,
	filterFn_inNumberRange,
	filterFn_includesString,
	filterFn_weakEquals,
	metaHelper,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	type Column,
	type ColumnDef,
	type ReactTable,
	type RowData,
} from "@tanstack/react-table";

import type { DataTableColumnMeta, DataTableMeta } from "@/types/data-table";

/**
 * Features registered for every data table in the app.
 *
 * Keep this in sync with the table APIs used by the shared data-table
 * components (filters, faceting, pinning, sizing, pagination, selection,
 * sorting and visibility). Registering explicitly keeps unused features out of
 * the client bundle.
 */
export const dataTableFeatures = tableFeatures({
	columnFacetingFeature,
	columnFilteringFeature,
	columnOrderingFeature,
	columnPinningFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	facetedRowModel: createFacetedRowModel(),
	facetedUniqueValues: createFacetedUniqueValues(),
	facetedMinMaxValues: createFacetedMinMaxValues(),
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	// Only the functions resolved by the default `'auto'` behaviour are
	// registered, so filtering and sorting keep working without shipping the
	// full built-in registries.
	filterFns: {
		includesString: filterFn_includesString,
		inNumberRange: filterFn_inNumberRange,
		equals: filterFn_equals,
		arrIncludes: filterFn_arrIncludes,
		inDateRange: filterFn_inDateRange,
		weakEquals: filterFn_weakEquals,
	},
	sortFns: {
		text: sortFn_text,
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
	},
	tableMeta: metaHelper<DataTableMeta>(),
	columnMeta: metaHelper<DataTableColumnMeta>(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableInstance<TData extends RowData> = ReactTable<
	DataTableFeatures,
	TData
>;

export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
	DataTableFeatures,
	TData,
	TValue
>;

export type DataTableColumnDef<
	TData extends RowData,
	TValue = unknown,
> = ColumnDef<DataTableFeatures, TData, TValue>;
