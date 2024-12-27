import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/floating-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as React from "react";
import { Badge } from "./ui/badge";

interface FloatingDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	side?: "right" | "bottom";
	status?: string;
	isScrolled: boolean;
	setIsScrolled: (value: boolean) => void;
}

export function FloatingDrawer({
	isOpen,
	onClose,
	title,
	children,
	side = "right",
	status,
	isScrolled,
	setIsScrolled,
}: FloatingDrawerProps) {
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	const scrollContainerRef = React.useRef<HTMLDivElement>(null);

	const handleScroll = () => {
		if (
			scrollContainerRef.current?.scrollTop &&
			scrollContainerRef.current?.scrollTop > 80
		) {
			setIsScrolled(true);
		} else {
			setIsScrolled(false);
		}
	};

	if (!isMounted) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className={cn(
					"fixed z-50 overflow-hidden rounded-md bg-background/80 p-0 shadow-lg backdrop-blur-sm",
					"duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
					side === "right"
						? [
								"top-4 right-4 bottom-4 w-[calc(100%-2rem)] max-w-[calc(100vw-2rem)] sm:w-[550px]",
								"data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
							]
						: [
								"right-4 bottom-4 left-4 h-[80vh] max-h-[calc(100vh-2rem)] rounded-t-[10px]",
								"data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
							],
				)}
			>
				<DialogHeader className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
					<DialogTitle className="flex items-center gap-4 align-middle">
						<span>{title}</span> <Badge>{status}</Badge>
					</DialogTitle>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</button>
				</DialogHeader>
				<div
					onScroll={handleScroll}
					ref={scrollContainerRef}
					className="scrollbar scrollbar-track-muted-foreground scrollbar-thumb-foreground scrollbar-w-3 h-[calc(100%-4rem)] overflow-y-auto p-4"
				>
					{children}
				</div>
			</DialogContent>
		</Dialog>
	);
}
