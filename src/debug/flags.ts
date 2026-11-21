/**
 * URL flags for development. Example: http://localhost:5173/?debug
 *  - `debug` draws physics bodies and velocities.
 */
const params = new URLSearchParams(window.location.search);

export const DEBUG_PHYSICS = params.has('debug');
