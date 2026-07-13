/**
 * Compute swipe power from offset and velocity (used e.g. for Framer Motion drag).
 * @param offset - Drag offset (px).
 * @param velocity - Drag velocity.
 * @returns Power value for pagination / threshold logic.
 */
export const swipePower = (offset: number, velocity: number): number => {
    return Math.abs(offset) * velocity;
};
