import { useCamera, useViewport } from "@rbxts/pretty-react-hooks";
import { useCallback, useState } from "@rbxts/react";

/** UI is authored at 1080p and scaled from there. */
const BASE_RESOLUTION = new Vector2(1920, 1080);
/** 0 = scale by width only, 1 = by height only. */
const DOMINANT_AXIS = 0.5;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.4;

function computeScale(viewport: Vector2) {
	const width = math.log(viewport.X / BASE_RESOLUTION.X, 2);
	const height = math.log(viewport.Y / BASE_RESOLUTION.Y, 2);
	const blended = width * (1 - DOMINANT_AXIS) + height * DOMINANT_AXIS;
	return math.clamp(2 ** blended, MIN_SCALE, MAX_SCALE);
}

/**
 * Converts 1080p-authored pixel values to the current viewport, so the UI is
 * legible on a phone and not comically small on a 4K monitor.
 *
 * @example
 * const px = usePx();
 * <frame Size={new UDim2(0, px(420), 0, px(300))} />
 */
export function usePx() {
	const camera = useCamera();
	const [scale, setScale] = useState(() => computeScale(camera.ViewportSize));

	useViewport((viewport) => setScale(computeScale(viewport)));

	return useCallback((value: number) => math.floor(value * scale + 0.5), [scale]);
}
