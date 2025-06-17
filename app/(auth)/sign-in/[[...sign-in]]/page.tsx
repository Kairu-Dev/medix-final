"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Link from "next/link";
import Image from "next/image";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm sm:text-base">Sign in to your Medix account</p>
          </div>

          <SignIn.Root>
            <SignIn.Step name="start" className="space-y-4 sm:space-y-6">
              {/* Social Sign In Buttons */}
              <div className="space-y-3">
                <Clerk.Connection
                  name="google"
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/50 rounded-xl p-3 text-white flex items-center justify-center gap-3 font-medium transition-all duration-200 group text-sm sm:text-base"
                >
                  <svg viewBox="0 0 24 24" width={20} height={20} className="flex-shrink-0">
                    <path
                      d="M18.977 4.322L16 7.3c-1.023-.838-2.326-1.35-3.768-1.35-2.69 0-4.95 1.73-5.74 4.152l-3.44-2.635c1.656-3.387 5.134-5.705 9.18-5.705 2.605 0 4.93.977 6.745 2.56z"
                      fill="#EA4335"
                    />
                    <path
                      d="M6.186 12c0 .66.102 1.293.307 1.89L3.05 16.533C2.38 15.17 2 13.63 2 12s.38-3.173 1.05-4.533l3.443 2.635c-.204.595-.307 1.238-.307 1.898z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M18.893 19.688c-1.786 1.667-4.168 2.55-6.66 2.55-4.048 0-7.526-2.317-9.18-5.705l3.44-2.635c.79 2.42 3.05 4.152 5.74 4.152 1.32 0 2.474-.308 3.395-.895l3.265 2.533z"
                      fill="#34A853"
                    />
                    <path
                      d="M22 12c0 3.34-1.22 5.948-3.107 7.688l-3.265-2.53c1.07-.67 1.814-1.713 2.093-3.063h-5.488V10.14h9.535c.14.603.233 1.255.233 1.86z"
                      fill="#4285F4"
                    />
                  </svg>
                  <span className="group-hover:text-blue-400 transition-colors">Continue with Google</span>
                </Clerk.Connection>

                <Clerk.Connection
                  name="apple"
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/50 rounded-xl p-3 text-white flex items-center justify-center gap-3 font-medium transition-all duration-200 group text-sm sm:text-base"
                >
                  <svg viewBox="0 0 24 24" width={20} height={20} className="flex-shrink-0">
                    <path fill="white" d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
                  </svg>
                  <span className="group-hover:text-blue-400 transition-colors">Continue with Apple</span>
                </Clerk.Connection>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700"></div>
                <span className="text-gray-500 text-xs sm:text-sm font-medium whitespace-nowrap">or continue with email</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700"></div>
              </div>

              {/* Email Field */}
              <div className="space-y-4">
                <Clerk.Field name="identifier" className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <Clerk.Input
                    placeholder="Enter your email address"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>
              </div>

              <SignIn.Action
                submit
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 text-sm sm:text-base"
              >
                Continue
              </SignIn.Action>
            </SignIn.Step>

            <SignIn.Step name="verifications" className="space-y-4 sm:space-y-6">
              <SignIn.Strategy name="password">
                <div className="space-y-4">
                  <Clerk.Field name="password" className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <Clerk.Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    />
                    <Clerk.FieldError className="text-red-400 text-sm" />
                  </Clerk.Field>

                  <div className="flex flex-col gap-3">
                    <SignIn.Action
                      submit
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 text-sm sm:text-base"
                    >
                      Sign In
                    </SignIn.Action>
                    
                    <SignIn.Action
                      navigate="forgot-password"
                      className="text-center text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                    >
                      Forgot your password?
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>

              <SignIn.Strategy name="reset_password_email_code">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="L22 6L12 13L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    We sent a reset code to <span className="text-blue-400 font-medium"><SignIn.SafeIdentifier /></span>
                  </p>
                </div>

                <Clerk.Field name="code" className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Reset Code</label>
                  <Clerk.Input
                    placeholder="Enter 6-digit code"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-center text-lg tracking-widest transition-all duration-200"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <SignIn.Action
                  submit
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 text-sm sm:text-base"
                >
                  Reset Password
                </SignIn.Action>
              </SignIn.Strategy>
            </SignIn.Step>

            <SignIn.Step name="forgot-password" className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Reset Password</h3>
                <p className="text-gray-400 text-sm sm:text-base">Choose a reset method</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <SignIn.SupportedStrategy name="reset_password_email_code">
                    <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 text-sm sm:text-base text-center">
                      Reset via Email
                    </div>
                  </SignIn.SupportedStrategy>
                </div>

                <SignIn.Action 
                  navigate="previous" 
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center text-sm sm:text-base"
                >
                  Go Back
                </SignIn.Action>
              </div>
            </SignIn.Step>

            <SignIn.Step name="reset-password" className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Create New Password</h3>
                <p className="text-gray-400 text-sm sm:text-base">Enter your new password below</p>
              </div>

              <div className="space-y-4">
                <Clerk.Field name="password" className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <Clerk.Input
                    type="password"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Create a strong password"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <Clerk.Field name="confirmPassword" className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <Clerk.Input
                    type="password"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Confirm your password"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>
              </div>

              <SignIn.Action 
                submit 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 text-sm sm:text-base"
              >
                Update Password
              </SignIn.Action>
            </SignIn.Step>

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base"
              >
                Don&apos;t have an account? 
                <span className="text-blue-400 font-medium">Sign up</span>
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-4 sm:mt-6 text-center px-4">
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                By signing in, you agree to our{" "}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
                , including{" "}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  Cookie Use
                </span>
                .
              </p>
            </div>
          </SignIn.Root>
        </div>
      </div>

      {/* Right Side - Hero Section with Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/30"></div>
        
        {/* Image Container */}
        <div className="w-full h-full relative">
          <Image 
            src="/assets/images/onboarding-img.png"
            alt="Medical Professional"
            fill
            style={{ objectFit: 'cover' }}
            priority
            className="opacity-90"
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-gray-900/70 flex flex-col justify-center items-center p-12 text-center">
            {/* Medical Cross Icon */}
            <div className="mb-8 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
                </svg>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome back to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Medix System
              </span>
            </h1>
            
            <p className="text-gray-200 text-lg max-w-md leading-relaxed">
              Continue managing patient care with our healthcare platform.
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-blue-400/25 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-indigo-300/40 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden bg-gray-900 p-6 text-center border-b border-gray-800 order-1">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            MedCare System
          </h1>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;