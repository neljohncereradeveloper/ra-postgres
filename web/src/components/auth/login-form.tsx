"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiLogin } from "@/lib/auth/api";
import { AuthApplicationAccessEnum } from "@/lib/constants/auth.constants";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3); // 3 second countdown
  const [redirectPath, setRedirectPath] = useState("/");

  // Handle successful login with a countdown
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown(countdown - 1);
        } else {
          router.push(redirectPath);
          router.refresh();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess, countdown, redirectPath, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      // Use the internal API route
      const res = await apiLogin({ username, password });
      if (
        res &&
        res.user.applicationAccess.includes(
          AuthApplicationAccessEnum.CastVoteManagementModule
        )
      ) {
        setRedirectPath("/cast-vote");
      } else if (
        res &&
        res.user.applicationAccess.includes(
          AuthApplicationAccessEnum.ElectionManagementModule
        )
      ) {
        setRedirectPath("/elections");
      }

      // Set login success to start the countdown
      setLoginSuccess(true);
    } catch (err) {
      console.error("Login form: Error during login", err);
      let errorMessage = "Failed to login";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginSuccess ? (
          <Alert className="mb-4 bg-green-50">
            <AlertDescription>
              Login successful! Redirecting in {countdown} seconds...
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="text-sm font-medium">Username</div>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              disabled={loginSuccess || isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Password</div>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loginSuccess || isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || loginSuccess}
          >
            {isLoading
              ? "Logging in..."
              : loginSuccess
              ? "Redirecting..."
              : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
