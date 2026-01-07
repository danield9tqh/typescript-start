import { betterAuth, BetterAuthOptions } from "better-auth";
import { anonymous } from "better-auth/plugins/anonymous";
import { passkey } from "@better-auth/passkey";

interface AuthOptions {
    database: BetterAuthOptions["database"];
    rpID: string;
    rpName: string;
    origin: string;
    secret?: string;
}

export const createAuth = ({ database, rpID, rpName, origin, secret }: AuthOptions) => {
    return betterAuth({
        database,
        secret,
        plugins: [
            anonymous(),
            passkey({ rpID, rpName, origin }),
        ],
    });
}
