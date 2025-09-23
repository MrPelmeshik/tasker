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
	tokenType: string; // "Bearer"
	expiresIn: number; // seconds
	userInfo: UserInfo;
};

export type RefreshTokenResponse = {
	accessToken: string;
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

export type RegisterRequest = {
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	confirmPassword: string;
};

export type RegisterResponse = {
	userId: string;
	message: string;
};
