declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT?: number
      API_GLOBAL_PREFIX?: string

      JWT_SECRET_KEY: string
      JWT_EXPIRATION_TIME: string

      DATABASE_URL: string
    }
  }
}

export {}
