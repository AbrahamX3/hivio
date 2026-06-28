import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type TableOptions,
	type TableState,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	type SingleParser,
	useQueryState,
	type UseQueryStateOptions,
	useQueryStates,
} from "nuqs";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getSortingStateParser } from "@/lib/parsers";
import type { ExtendedColumnSort, QueryKeys } from "@/types/data-table";

/** @see https://github.com/sadmann7/tablecn/blob/main/src/hooks/use-data-table.ts */
export const PAGE_KEY = "page";
export const PER_PAGE_KEY = "perPage";
export const SORT_KEY = "sort";
export const FILTERS_KEY = "filters";
export const JOIN_OPERATOR_KEY = "joinOperator";
export const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

export type DataTableUrlState<TData> = {
	page: number;
	perPage: number;
	pagination: PaginationState;
	sorting: ExtendedColumnSort<TData>[];
	columnFilters: ColumnFiltersState;
	debouncedColumnFilters: ColumnFiltersState;
	onPaginationChange: (updaterOrValue: Updater<PaginationState>) => void;
	onSortingChange: (updaterOrValue: Updater<SortingState>) => void;
	onColumnFiltersChange: (updaterOrValue: Updater<ColumnFiltersState>) => void;
};

type UrlSyncOptions<TData> = {
	columns: TableOptions<TData>["columns"];
	initialState?: Omit<Partial<TableState>, "sorting"> & {
		sorting?: ExtendedColumnSort<TData>[];
	};
	queryKeys?: Partial<QueryKeys>;
	history?: "push" | "replace";
	debounceMs?: number;
	throttleMs?: number;
	clearOnDefault?: boolean;
	enableAdvancedFilter?: boolean;
	scroll?: boolean;
	shallow?: boolean;
	startTransition?: React.TransitionStartFunction;
};

/**
 * URL search params for filters, sort, and pagination (nuqs).
 * Use this **before** `useQuery` when the server needs the same params, then pass the result to
 * `useDataTableWithUrl`.
 */
export function useDataTableUrl<TData>(
	props: UrlSyncOptions<TData>,
): DataTableUrlState<TData> {
	const {
		columns,
		initialState,
		queryKeys,
		history = "replace",
		debounceMs = DEBOUNCE_MS,
		throttleMs = THROTTLE_MS,
		clearOnDefault = false,
		enableAdvancedFilter = false,
		scroll = false,
		shallow = true,
		startTransition,
	} = props;
	const pageKey = queryKeys?.page ?? PAGE_KEY;
	const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY;
	const sortKey = queryKeys?.sort ?? SORT_KEY;

	const queryStateOptions = React.useMemo<
		Omit<UseQueryStateOptions<string>, "parse">
	>(
		() => ({
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		}),
		[
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		],
	);

	const [page, setPage] = useQueryState(
		pageKey,
		parseAsInteger.withOptions(queryStateOptions).withDefault(1),
	);
	const [perPage, setPerPage] = useQueryState(
		perPageKey,
		parseAsInteger
			.withOptions(queryStateOptions)
			.withDefault(initialState?.pagination?.pageSize ?? 10),
	);

	const pagination: PaginationState = React.useMemo(() => {
		return {
			pageIndex: page - 1,
			pageSize: perPage,
		};
	}, [page, perPage]);

	const onPaginationChange = React.useCallback(
		(updaterOrValue: Updater<PaginationState>) => {
			if (typeof updaterOrValue === "function") {
				const newPagination = updaterOrValue(pagination);
				void setPage(newPagination.pageIndex + 1);
				void setPerPage(newPagination.pageSize);
			} else {
				void setPage(updaterOrValue.pageIndex + 1);
				void setPerPage(updaterOrValue.pageSize);
			}
		},
		[pagination, setPage, setPerPage],
	);

	const columnIds = React.useMemo(() => {
		return new Set(
			columns.map((column) => column.id).filter(Boolean) as string[],
		);
	}, [columns]);

	const [sorting, setSorting] = useQueryState(
		sortKey,
		getSortingStateParser<TData>(columnIds)
			.withOptions(queryStateOptions)
			.withDefault(initialState?.sorting ?? []),
	);

	const onSortingChange = React.useCallback(
		(updaterOrValue: Updater<SortingState>) => {
			if (typeof updaterOrValue === "function") {
				const newSorting = updaterOrValue(sorting);
				setSorting(newSorting as ExtendedColumnSort<TData>[]);
			} else {
				setSorting(updaterOrValue as ExtendedColumnSort<TData>[]);
			}
		},
		[sorting, setSorting],
	);

	const filterableColumns = React.useMemo(() => {
		if (enableAdvancedFilter) return [];

		return columns.filter((column) => column.enableColumnFilter);
	}, [columns, enableAdvancedFilter]);

	const filterParsers = React.useMemo(() => {
		if (enableAdvancedFilter) return {};

		return filterableColumns.reduce<
			Record<string, SingleParser<string> | SingleParser<string[]>>
		>((acc, column) => {
			if (column.meta?.options) {
				acc[column.id ?? ""] = parseAsArrayOf(
					parseAsString,
					ARRAY_SEPARATOR,
				).withOptions(queryStateOptions);
			} else {
				acc[column.id ?? ""] = parseAsString.withOptions(queryStateOptions);
			}
			return acc;
		}, {});
	}, [filterableColumns, queryStateOptions, enableAdvancedFilter]);

	const [filterValues, setFilterValues] = useQueryStates(filterParsers);

	const debouncedSetFilterValues = useDebouncedCallback(
		(values: typeof filterValues) => {
			void setPage(1);
			void setFilterValues(values);
		},
		debounceMs,
	);

	const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
		if (enableAdvancedFilter) return [];

		return Object.entries(filterValues).reduce<ColumnFiltersState>(
			(filters, [key, value]) => {
				if (value !== null) {
					const processedValue = Array.isArray(value) ? value : [value];

					filters.push({
						id: key,
						value: processedValue,
					});
				}
				return filters;
			},
			[],
		);
	}, [filterValues, enableAdvancedFilter]);

	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>(initialColumnFilters);

	React.useEffect(() => {
		setColumnFilters(initialColumnFilters);
	}, [initialColumnFilters]);

	const [debouncedColumnFilters, setDebouncedColumnFilters] =
		React.useState<ColumnFiltersState>(initialColumnFilters);

	React.useEffect(() => {
		const timer = setTimeout(
			() => setDebouncedColumnFilters(columnFilters),
			debounceMs,
		);
		return () => clearTimeout(timer);
	}, [columnFilters, debounceMs]);

	const onColumnFiltersChange = React.useCallback(
		(updaterOrValue: Updater<ColumnFiltersState>) => {
			if (enableAdvancedFilter) return;

			setColumnFilters((prev) => {
				const next =
					typeof updaterOrValue === "function"
						? updaterOrValue(prev)
						: updaterOrValue;

				const filterUpdates = next.reduce<
					Record<string, string | string[] | null>
				>((acc, filter) => {
					if (filterableColumns.find((column) => column.id === filter.id)) {
						acc[filter.id] = filter.value as string | string[];
					}
					return acc;
				}, {});

				for (const prevFilter of prev) {
					if (!next.some((filter) => filter.id === prevFilter.id)) {
						filterUpdates[prevFilter.id] = null;
					}
				}

				debouncedSetFilterValues(filterUpdates);
				return next;
			});
		},
		[debouncedSetFilterValues, filterableColumns, enableAdvancedFilter],
	);

	return React.useMemo(
		() => ({
			page,
			perPage,
			pagination,
			sorting,
			columnFilters,
			debouncedColumnFilters,
			onPaginationChange,
			onSortingChange,
			onColumnFiltersChange,
		}),
		[
			page,
			perPage,
			pagination,
			sorting,
			columnFilters,
			debouncedColumnFilters,
			onPaginationChange,
			onSortingChange,
			onColumnFiltersChange,
		],
	);
}

interface UseDataTableWithUrlProps<TData>
	extends
		Omit<
			TableOptions<TData>,
			| "state"
			| "pageCount"
			| "getCoreRowModel"
			| "manualFiltering"
			| "manualPagination"
			| "manualSorting"
		>,
		Required<Pick<TableOptions<TData>, "pageCount">> {
	initialState?: Omit<Partial<TableState>, "sorting"> & {
		sorting?: ExtendedColumnSort<TData>[];
	};
	queryKeys?: Partial<QueryKeys>;
	enableAdvancedFilter?: boolean;
	urlState: DataTableUrlState<TData>;
	shallow?: boolean;
	debounceMs?: number;
	throttleMs?: number;
}

/**
 * TanStack Table wired to URL state from `useDataTableUrl`. For server-paginated tables, call
 * `useDataTableUrl` → `useQuery` → this hook.
 */
export function useDataTableWithUrl<TData>(
	props: UseDataTableWithUrlProps<TData>,
) {
	const {
		columns,
		pageCount = -1,
		initialState,
		queryKeys,
		urlState,
		shallow = true,
		debounceMs = DEBOUNCE_MS,
		throttleMs = THROTTLE_MS,
		...tableProps
	} = props;
	const pageKey = queryKeys?.page ?? PAGE_KEY;
	const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY;
	const sortKey = queryKeys?.sort ?? SORT_KEY;
	const filtersKey = queryKeys?.filters ?? FILTERS_KEY;
	const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY;

	const {
		pagination,
		sorting,
		columnFilters,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
	} = urlState;

	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
		initialState?.rowSelection ?? {},
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>(initialState?.columnVisibility ?? {});

	const table = useReactTable({
		...tableProps,
		columns,
		initialState,
		pageCount,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		defaultColumn: {
			...tableProps.defaultColumn,
			enableColumnFilter: false,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		meta: {
			...tableProps.meta,
			queryKeys: {
				page: pageKey,
				perPage: perPageKey,
				sort: sortKey,
				filters: filtersKey,
				joinOperator: joinOperatorKey,
			},
		},
	});

	return React.useMemo(
		() => ({ table, shallow, debounceMs, throttleMs }),
		[table, shallow, debounceMs, throttleMs],
	);
}
