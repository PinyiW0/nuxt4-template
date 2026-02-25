// 認證相關型別

export interface LoginRequest {
  account: string
  password: string
}

export interface LoginUser {
  id: number
  account: string
  role: string
}

export interface LoginData {
  access_token: string
  refresh_token: string
  user: LoginUser
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshData {
  access_token: string
}
