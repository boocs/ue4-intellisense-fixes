

export type CommandObjectJson = {
	command?: string;
	directory?: string;
	file?: string;
	arguments?: string;
	output?: string;
};


// Currently incomplete
export type CCppConfigurationJson = {
	name?: string;
	intelliSenseMode?: string;
	compileCommands?: string;
	forcedInclude?: string[];
	includePath?: string[];
	browse?: {
		path?: string[];
		limitSymbolsToIncludedHeaders?: boolean;
	}
	defines?: string[];
	cppStandard?: string;
};


export type CCppPropertiesJson = {
	configurations?: [ CCppConfigurationJson ];
	version?: string;
};


export type LaunchJson = {
	version?: string;
	configurations?: [LaunchObjectJson];
};


// Unfinished but don't need all variables
export type LaunchObjectJson = {
	externalConsole?: boolean;
	console?: string;
};
