'use client';

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Home() {
    return (
        <div className="flex h-screen items-center justify-center">
            <GoogleLogin
                onSuccess={async (cred) => {
                    const token = cred.credential;

                    const { data } = await axios.post("/api/auth/google", { token });

                    localStorage.setItem("jwt", data.jwt);
                    window.location.href = "/dashboard";
                }}
                onError={() => console.log("Erro ao logar")}
            />
        </div>
    );
}
