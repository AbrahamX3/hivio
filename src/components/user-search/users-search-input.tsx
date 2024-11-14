"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

import { type UserSearch, searchUsers } from "./actions";

export default function UsersSearchInput() {
	const [query, setQuery] = useState("");
	const debouncedSearch = useDebounce(query, 500);
	const [results, setResults] = useState<UserSearch[]>([]);

	const { execute, reset, status } = useAction(searchUsers, {
		onSuccess: ({ data }) => {
			if (data) {
				setResults(data);
			}
		},
	});

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (debouncedSearch.length > 0) {
			execute({ search: debouncedSearch });
			setOpen(true);
		} else {
			reset();
		}
	}, [debouncedSearch, execute, reset]);

	return (
		<div className="relative ml-auto flex-1 text-black dark:text-white md:grow-0">
			<div className="relative">
				<SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
				<Input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-full appearance-none rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
					placeholder="Search users..."
					type="search"
				/>
			</div>
			{open && query.length > 0 && (
				<div className="absolute mt-2 w-full rounded-md border-2 bg-background shadow-sm md:w-[200px] lg:w-[320px]">
					<div className="max-h-[300px] overflow-y-auto">
						<AnimatePresence mode="sync">
							<div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
								{status === "executing" || status === "idle" ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { duration: 0.3, ease: "easeIn" },
										}}
										exit={{
											opacity: 0,
											transition: {
												duration: 0.2,
												ease: "easeOut",
												velocity: 5,
											},
										}}
										className="flex animate-pulse items-center space-x-3 rounded-md p-2"
									>
										Searching users...
									</motion.div>
								) : status === "hasSucceeded" && results.length === 0 ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { duration: 0.3, ease: "easeIn" },
										}}
										exit={{
											opacity: 0,
											transition: {
												duration: 0.2,
												ease: "easeOut",
												velocity: 5,
											},
										}}
										className="flex items-center space-x-3 rounded-md p-2"
									>
										No users found with that username or name
									</motion.div>
								) : (
									results.map(({ avatar, name, username }) => (
										<motion.div
											key={username}
											initial={{ opacity: 0 }}
											animate={{
												opacity: 1,
												transition: { duration: 0.3, ease: "easeIn" },
											}}
											exit={{
												opacity: 0,
												transition: {
													duration: 0.2,
													ease: "easeOut",
													velocity: 5,
												},
											}}
										>
											<Link
												onClick={() => {
													setOpen(false);
													setQuery("");
												}}
												href={`/profile/${username}`}
												className="flex items-center space-x-3 rounded-md p-2 transition duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
											>
												<Avatar className="h-10 w-10">
													{avatar && (
														<AvatarImage alt={`@${username}`} src={avatar} />
													)}
													<AvatarFallback className="uppercase">
														{username?.slice(0, 1)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="truncate font-medium">{name}</div>
													<div className="text-sm">@{username}</div>
												</div>
											</Link>
										</motion.div>
									))
								)}
							</div>
						</AnimatePresence>
					</div>
				</div>
			)}
		</div>
	);
}
