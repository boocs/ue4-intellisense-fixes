
export type CommandObject = {
	command?: string;
	directory?: string;
	file?: string;
	arguments?: string;
	output?: string;
};

export type CCppConfiguration = {
	name?: string;
	intelliSenseMode?: string;
	compileCommands?: string;
	forcedInclude?: string[];
	includePath?: string[];
	browse?: {
		path?: string[];
	}
	defines?: string[]
};

export type CCppProperties = {
	configurations?: [ CCppConfiguration ],
	version?: string
};


export const enum UE4Version {
	none = 0,
	v426 = 1,
	v425 = 2
}
