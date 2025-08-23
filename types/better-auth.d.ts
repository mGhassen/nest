declare module 'better-auth' {
  export interface NextAuthConfig {
    adapter?: any;
    providers: any[];
    callbacks?: any;
    pages?: any;
    session?: any;
    secret?: string;
  }

  export function getServerSession(config: NextAuthConfig): Promise<any>;
  export function handlers(config: NextAuthConfig): { GET: any; POST: any };
}

declare module 'better-auth/react' {
  export function signIn(provider: string, options?: any): Promise<any>;
  export function signOut(options?: any): Promise<any>;
  export function useSession(): { data: any; status: string };
}

declare module 'better-auth/providers/google' {
  const Google: any;
  export default Google;
}

declare module 'better-auth/providers/credentials' {
  const Credentials: any;
  export default Credentials;
}
