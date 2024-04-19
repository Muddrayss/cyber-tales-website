export type CreditsDataType_Role = {
	role: string;
	name: string[];
}

export type CreditsDataType = {
	project: string;
	roles: CreditsDataType_Role[];
}