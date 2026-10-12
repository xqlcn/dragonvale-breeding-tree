import { createContext } from "react";

/**
 * Broadcasts "Expand all" / "Collapse all". Each click bumps `seq`; tree nodes compare it with
 * the last seq they applied, so they react once per click but keep their own open state otherwise.
 */
export interface TreeExpansionCommand { seq: number; expand: boolean }

export const TreeExpansionContext = createContext<TreeExpansionCommand>({ seq: 0, expand: true });
