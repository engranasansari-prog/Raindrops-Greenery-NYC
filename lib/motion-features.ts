// Framer Motion feature bundle — loaded ASYNC by components/MotionProvider.tsx.
// domMax includes ALL animation features (layout animations, popLayout, drag,
// gestures), so every existing animation behaves identically to the full
// `motion` import — the engine just arrives after first paint instead of
// shipping in the first-load JS bundle.
import { domMax } from 'framer-motion';

export default domMax;
