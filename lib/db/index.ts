import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Supabase connection
const connectionString = process.env.DATABASE_URL!

// Create postgres client
const client = postgres(connectionString)

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Export for direct Supabase client if needed
export { client as postgresClient }
