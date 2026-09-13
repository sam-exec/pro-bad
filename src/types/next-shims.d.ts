// Fallback module declarations for Next.js when .d.ts files are omitted in npm install
declare module "next" {
  export type Metadata = any;
  export type Viewport = any;
  export type NextConfig = any;
  const next: any;
  export default next;
}

declare module "next/types.js" {
  export type Route = any;
  export type AppRoutes = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}


declare module "next/link" {
  import React from "react";
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
  }
  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;
  export default Link;
}

declare module "next/navigation" {
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(url: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module "next/font/google" {
  export function Geist(options?: any): { className: string; variable: string };
  export function Geist_Mono(options?: any): { className: string; variable: string };
  export function Inter(options?: any): { className: string; variable: string };
}
