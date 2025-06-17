//Enhanced version with more sparkles - performance optimized

"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import Link from "next/link";
import { useState } from "react";

const SignUpPage = () => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialSignUp = (provider: string) => {
    setLoadingProvider(provider);
    // The loading state will be cleared when the page redirects or if there's an error
    // You might want to add a timeout as a fallback
    setTimeout(() => {
      setLoadingProvider(null);
    }, 10000); // Clear after 10 seconds as fallback
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-green-900/30"></div>
        
        {/* Enhanced Sparkle Animation Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large floating sparkles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-400/50 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-300/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-emerald-400/35 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-green-300/50 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          
          {/* Additional medium sparkles */}
          <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-emerald-500/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/6 left-1/6 w-1 h-1 bg-green-500/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/6 w-0.5 h-0.5 bg-emerald-400/50 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute top-3/4 right-1/5 w-1 h-1 bg-green-400/35 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
          <div className="absolute bottom-1/2 right-2/3 w-0.5 h-0.5 bg-emerald-300/45 rounded-full animate-pulse" style={{animationDelay: '1.8s'}}></div>
          
          {/* Small twinkling sparkles */}
          <div className="absolute top-1/5 left-1/2 w-0.5 h-0.5 bg-emerald-400/30 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute bottom-1/5 right-1/2 w-0.5 h-0.5 bg-green-400/40 rounded-full animate-pulse" style={{animationDelay: '1.3s'}}></div>
          <div className="absolute top-1/8 right-3/4 w-0.5 h-0.5 bg-emerald-500/25 rounded-full animate-pulse" style={{animationDelay: '0.9s'}}></div>
          <div className="absolute bottom-1/8 left-3/4 w-0.5 h-0.5 bg-green-500/35 rounded-full animate-pulse" style={{animationDelay: '1.6s'}}></div>
          <div className="absolute top-2/5 right-1/8 w-0.5 h-0.5 bg-emerald-400/20 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          <div className="absolute bottom-2/5 left-1/8 w-0.5 h-0.5 bg-green-400/30 rounded-full animate-pulse" style={{animationDelay: '1.1s'}}></div>
          
          {/* Floating cross sparkles */}
          <div className="absolute top-1/3 left-1/5 w-1 h-1 animate-pulse" style={{animationDelay: '0.6s'}}>
            <div className="absolute inset-0 bg-emerald-400/25 transform rotate-45 rounded-sm"></div>
            <div className="absolute inset-0 bg-emerald-400/25 transform -rotate-45 rounded-sm"></div>
          </div>
          <div className="absolute bottom-1/3 right-1/5 w-1 h-1 animate-pulse" style={{animationDelay: '1.4s'}}>
            <div className="absolute inset-0 bg-green-400/30 transform rotate-45 rounded-sm"></div>
            <div className="absolute inset-0 bg-green-400/30 transform -rotate-45 rounded-sm"></div>
          </div>
          <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 animate-pulse" style={{animationDelay: '1.7s'}}>
            <div className="absolute inset-0 bg-emerald-500/35 transform rotate-45 rounded-sm"></div>
            <div className="absolute inset-0 bg-emerald-500/35 transform -rotate-45 rounded-sm"></div>
          </div>
          
          {/* Gentle floating animation for some sparkles */}
          <div className="absolute top-1/4 right-1/3 animate-bounce" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
            <div className="w-1 h-1 bg-emerald-400/30 rounded-full"></div>
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
            <div className="w-0.5 h-0.5 bg-green-400/40 rounded-full"></div>
          </div>
          <div className="absolute top-3/5 left-2/3 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1.5s'}}>
            <div className="w-0.5 h-0.5 bg-emerald-500/25 rounded-full"></div>
          </div>
        </div>
        
        {/* Centered content container */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-12 text-center">
          {/* Enhanced Medical Cross Icon with sparkle effect */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
              </svg>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-3xl blur-xl"></div>
            
            {/* Sparkles around the icon */}
            <div className="absolute -top-2 -right-2 w-1 h-1 bg-emerald-400/60 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute -bottom-2 -left-2 w-0.5 h-0.5 bg-green-400/50 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
            <div className="absolute -top-1 left-1/2 w-0.5 h-0.5 bg-emerald-500/40 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute top-1/2 -right-1 w-0.5 h-0.5 bg-green-500/45 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
              Medix System
            </span>
          </h1>
          
          <p className="text-gray-300 text-lg max-w-md leading-relaxed">
            Join us and test out our digital hospital management system.
          </p>
        </div>
      </div>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden bg-gray-900 p-6 text-center border-b border-gray-800 relative overflow-hidden">
        {/* Mobile sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-4 w-0.5 h-0.5 bg-emerald-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-green-400/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 right-8 w-0.5 h-0.5 bg-emerald-500/25 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-2 relative">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
            </svg>
            {/* Mobile icon sparkles */}
            <div className="absolute -top-1 -right-1 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          </div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
            Medix System
          </h1>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm sm:text-base">Join our healthcare platform today</p>
          </div>

          <SignUp.Root>
            <SignUp.Step name="start" className="space-y-4 sm:space-y-6">
              {/* Social Sign Up Buttons */}
              <div className="space-y-3">
                <Clerk.Connection
                  name="google"
                  asChild
                >
                  <button 
                    type="button"
                    onClick={() => handleSocialSignUp('google')}
                    disabled={loadingProvider !== null}
                    className={`w-full border rounded-xl p-3 text-white flex items-center justify-center gap-3 font-medium transition-all duration-200 group text-sm sm:text-base cursor-pointer ${
                      loadingProvider === 'google'
                        ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                        : loadingProvider !== null
                        ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {loadingProvider === 'google' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                        <span className="text-emerald-400">Connecting...</span>
                      </>
                    ) : (
                      <>
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
                        <span className="group-hover:text-emerald-400 transition-colors">Continue with Google</span>
                      </>
                    )}
                  </button>
                </Clerk.Connection>

                <Clerk.Connection
                  name="apple"
                  asChild
                >
                  <button 
                    type="button"
                    onClick={() => handleSocialSignUp('apple')}
                    disabled={loadingProvider !== null}
                    className={`w-full border rounded-xl p-3 text-white flex items-center justify-center gap-3 font-medium transition-all duration-200 group text-sm sm:text-base cursor-pointer ${
                      loadingProvider === 'apple'
                        ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                        : loadingProvider !== null
                        ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {loadingProvider === 'apple' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                        <span className="text-emerald-400">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width={20} height={20} className="flex-shrink-0">
                          <path fill="white" d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
                        </svg>
                        <span className="group-hover:text-emerald-400 transition-colors">Continue with Apple</span>
                      </>
                    )}
                  </button>
                </Clerk.Connection>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700"></div>
                <span className="text-gray-500 text-xs sm:text-sm font-medium whitespace-nowrap">or continue with email</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700"></div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <Clerk.Field name="username" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">Username</Clerk.Label>
                  <Clerk.Input
                    className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your username"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <Clerk.Field name="emailAddress" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">Email Address</Clerk.Label>
                  <Clerk.Input
                    className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">Password</Clerk.Label>
                  <Clerk.Input
                    className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Create a strong password"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>
              </div>

              <SignUp.Captcha />

              <SignUp.Action
                submit
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
              >
                Create Account
              </SignUp.Action>
            </SignUp.Step>

            <SignUp.Step name="continue" className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Complete Your Profile</h3>
                <p className="text-gray-400 text-sm sm:text-base">We need a few more details</p>
              </div>

              <Clerk.Field name="username" className="space-y-2">
                <Clerk.Label className="text-sm font-medium text-gray-300">Username</Clerk.Label>
                <Clerk.Input 
                  placeholder="Choose your username" 
                  className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 text-sm sm:text-base" 
                />
                <Clerk.FieldError className="text-red-400 text-sm" />
              </Clerk.Field>

              <SignUp.Action 
                submit 
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
              >
                Continue
              </SignUp.Action>
            </SignUp.Step>

            <SignUp.Step name="verifications" className="space-y-4 sm:space-y-6">
              <SignUp.Strategy name="email_code">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="L22 6L12 13L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-gray-400 text-sm sm:text-base">We&apos;ve sent a verification code to your email address</p>
                </div>

                <Clerk.Field name="code" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-300">Verification Code</Clerk.Label>
                  <Clerk.Input
                    placeholder="Enter 6-digit code"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-center text-lg tracking-widest transition-all duration-200"
                  />
                  <Clerk.FieldError className="text-red-400 text-sm" />
                </Clerk.Field>

                <SignUp.Action
                  submit
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
                >
                  Verify Email
                </SignUp.Action>
              </SignUp.Strategy>
            </SignUp.Step>

            {/* Sign In Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
              >
                Already have an account? 
                <span className="text-emerald-400 font-medium">Sign in</span>
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-4 sm:mt-6 text-center px-4">
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                By creating an account, you agree to our{" "}
                <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
                , including{" "}
                <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors">
                  Cookie Use
                </span>
                .
              </p>
            </div>
          </SignUp.Root>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;