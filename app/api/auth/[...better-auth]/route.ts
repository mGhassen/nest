import { handlers } from "better-auth"
import { authConfig } from "@/lib/auth"

export const { GET, POST } = handlers(authConfig)
