"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";

export default function MovieRuntimeInput() {
	const { control, watch } = useFormContext();
	const hours = watch("currentRuntimeHours") || 0;
	const minutes = watch("currentRuntimeMinutes") || 0;

	return (
		<div className="space-y-4">
			<Label>Current Runtime</Label>
			<div className="flex flex-wrap gap-4">
				<div className="w-full sm:w-auto">
					<Label htmlFor="currentRuntimeHours">Hours</Label>
					<Controller
						name="currentRuntimeHours"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								id="currentRuntimeHours"
								min={0}
								max={10}
								className="w-full sm:w-24"
								onChange={(e) => field.onChange(e.target.valueAsNumber)}
							/>
						)}
					/>
				</div>
				<div className="w-full sm:w-auto">
					<Label htmlFor="currentRuntimeMinutes">Minutes</Label>
					<Controller
						name="currentRuntimeMinutes"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								id="currentRuntimeMinutes"
								min={0}
								max={59}
								className="w-full sm:w-24"
								onChange={(e) => field.onChange(e.target.valueAsNumber)}
							/>
						)}
					/>
				</div>
			</div>
			<p className="text-muted-foreground text-sm">
				Total runtime: {hours} hour{hours !== 1 ? "s" : ""} and {minutes} minute
				{minutes !== 1 ? "s" : ""}
			</p>
		</div>
	);
}
