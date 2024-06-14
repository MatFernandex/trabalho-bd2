declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT?: number
      API_GLOBAL_PREFIX?: string

      DATABASE_URL: string
    }
  }
}

export {}
