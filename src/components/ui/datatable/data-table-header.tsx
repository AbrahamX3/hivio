export default function DataTableHeader({
	mobileTitle,
	desktopTitle,
	children,
}: {
	mobileTitle: string;
	desktopTitle: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="my-4 flex w-full flex-col justify-between gap-4 rounded-md align-middle md:flex-row">
			<p className="text-center font-bold text-2xl sm:hidden">{mobileTitle}</p>
			<p className="hidden font-bold text-2xl sm:flex">{desktopTitle}</p>
			{children}
		</div>
	);
}
