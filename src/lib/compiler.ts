import { Expr } from "./s-parser";

export const compileLangToWAT = (input: Expr[]): Expr[] => {
	return [
		"module",
	];
};
