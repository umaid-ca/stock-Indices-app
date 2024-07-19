"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default function Login() {
  // const session = await getServerSession(authOptions)
  // if (session) redirect("/")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    console.log(email, password, `email password`);
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log(res, `response from login api`);
      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main style={{ height: "100vh" }} className="body_login_form">
      <form onSubmit={handleSubmit} className="login">
        <h2>Welcome!</h2>
        <p style={{ color: "black", fontWeight: "700" }}>Please log in</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <input style={{ borderRadius: "8px" }} type="submit" value="Log In" />
        {error && (
          <div style={{ margin: "20px 0px" }}>
            <span className="error">{error}</span>
          </div>
        )}
        <Link href={"/sign_up"}>
          <span style={{ color: "black", fontWeight: "700" }}>
            Don&apos;t have an account?{" "}
            <span className="underline">Register Here!</span>
          </span>
        </Link>
      </form>
    </main>
  );
}
