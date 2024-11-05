import { useEffect } from "react";

export default function useMouseMove() {
	useEffect(function handleMouseMove() {
		function mouseMoveEvent(e: MouseEvent) {
			const scale = window.visualViewport?.scale;
			if (scale === 1) {
				const body = document.body;

				const targetX = e.clientX;
				const targetY = e.clientY;

				body.style.setProperty("--x", `${targetX}px`);
				body.style.setProperty("--y", `${targetY}px`);
			}
		}

		document.addEventListener("mousemove", mouseMoveEvent);
		return () => {
			document.removeEventListener("mousemove", mouseMoveEvent);
		};
	}, []);
}
