"use client";

import ReactConfetti from "react-confetti";

import { useConfetti } from "./use-confetti";

export const Confetti = () => {
	const { confetti } = useConfetti();

	return (
		<>
			{confetti.map((id) => (
				<ReactConfetti
					key={id}
					className="absolute left-0 top-0 h-full w-full"
					width={window.innerWidth}
					height={window.innerHeight}
					style={{
						zIndex: 100,
					}}
					recycle={false}
					numberOfPieces={800}
					tweenDuration={20000}
					initialVelocityY={-5}
				/>
			))}
		</>
	);
};
