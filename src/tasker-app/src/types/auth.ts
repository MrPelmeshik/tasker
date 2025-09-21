export type ApiResponse<T> = {
	success: boolean;
	message: string;
	data?: T | null;
	errors: string[];
};

export type UserInfo = {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: string[];
};

export type AuthResponse = {
	accessToken: string;
	refreshToken: string; // будет в cookie; фронт не использует напрямую
	tokenType: string; // "Bearer"
	expiresIn: number; // seconds
	userInfo: UserInfo;
};

export type RefreshTokenResponse = {
	accessToken: string;
	refreshToken: string; // будет в cookie; фронт не использует напрямую
	tokenType: string; // "Bearer"
	expiresIn: number; // seconds
};

export type LoginRequest = {
	username: string;
	password: string;
};

export type RefreshTokenRequest = {
	refreshToken?: string;
};
