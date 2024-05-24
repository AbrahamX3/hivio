import Image from "next/image";

import { cn } from "@/lib/utils";

// Optimized using https://svgomg.net/

export default function LogoFull({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Hivio Full Logo"
      className={cn("size-28", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1698 478"
    >
      <path
        fill="currentColor"
        d="M786.614 448.823v-167.61c0-8.691-2.478-11.174-11.152-11.174h-50.806c-8.675 0-11.153 2.483-11.153 11.174v167.61c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.968 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881V171.956c0 8.07 2.478 11.174 11.153 11.174h50.806c8.674 0 11.152-3.104 11.152-11.174V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.654c17.968 0 22.925 4.96621 22.925 22.96881V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.654c-17.968 0-22.925-4.966-22.925-22.969Zm211.28-419.6464V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.968 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881ZM1199.56 471.792h-68.16c-32.22 0-41.51-9.311-45.23-38.488l-47.71-404.1274c-1.86-18.0026 4.96-22.96881 22.93-22.96881h45.23c17.97 0 21.68 4.96621 22.92 22.96881l27.26 318.4594c.62 7.45 3.1 9.312 8.68 9.312 5.57 0 8.05-1.862 8.67-9.312l27.26-318.4594c1.24-18.0026 4.96-22.96881 22.93-22.96881h45.23c17.97 0 24.78 4.96621 22.92 22.96881l-47.7 404.1274c-3.72 29.177-13.02 38.488-45.23 38.488Zm219.01-442.6154V448.823c0 18.003-4.96 22.969-22.93 22.969h-39.65c-17.97 0-22.93-4.966-22.93-22.969V29.1766c0-18.0026 4.96-22.96881 22.93-22.96881h39.65c17.97 0 22.93 4.96621 22.93 22.96881ZM1698 335.221C1698 440.132 1668.26 478 1578.42 478s-119.58-37.868-119.58-142.779V142.779C1458.84 38.4883 1488.58 0 1578.42 0S1698 38.4883 1698 142.779v192.442Zm-151.18 21.106c0 24.831 9.91 34.764 31.6 34.764s31.6-9.933 31.6-34.764v-231.55c0-27.3147-9.91-37.8679-31.6-37.8679s-31.6 10.5532-31.6 37.8679v231.55ZM93.2759 27.9607C93.2759 12.5184 105.804 0 121.259 0h295.817c15.455 0 27.983 12.5184 27.983 27.9607 0 15.4422-12.528 27.9606-27.983 27.9606H121.259c-15.455 0-27.9831-12.5184-27.9831-27.9606Zm0 418.0783c0-15.442 12.5281-27.96 27.9831-27.96h295.817c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H121.259c-15.455 0-27.9831-12.518-27.9831-27.961ZM63.9606 69.236c-16.1904 0-29.3153 13.1145-29.3153 29.2921 0 16.1779 13.1249 29.2919 29.3153 29.2919H474.374c16.191 0 29.316-13.114 29.316-29.2919 0-16.1776-13.125-29.2921-29.316-29.2921H63.9606Zm-29.3153 310.23c0-15.442 12.5283-27.96 27.9828-27.96H475.707c15.454 0 27.983 12.518 27.983 27.96 0 15.443-12.529 27.961-27.983 27.961H62.6281c-15.4545 0-27.9828-12.518-27.9828-27.961Zm-6.6625-238.331C12.5283 141.135 0 153.653 0 169.096c0 15.442 12.5283 27.96 27.9828 27.96H199.913c13.824-23.878 39.661-39.944 69.255-39.944 29.593 0 55.43 16.066 69.254 39.944h174.595c15.455 0 27.983-12.518 27.983-27.96 0-15.443-12.528-27.961-27.983-27.961H27.9828Zm165.7832 69.236H27.9828C12.5283 210.371 0 222.889 0 238.331c0 15.443 12.5283 27.961 27.9828 27.961H194.762c-3.579-9.07-5.545-18.951-5.545-29.292 0-9.337 1.603-18.3 4.549-26.629Zm149.807 55.921c3.579-9.07 5.545-18.951 5.545-29.292 0-9.337-1.603-18.3-4.549-26.629h168.448c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H343.573Zm-140.29 15.978c14.418 20.91 38.549 34.618 65.885 34.618 27.335 0 51.466-13.708 65.884-34.618h177.965c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H27.9828C12.5283 338.191 0 325.673 0 310.23c0-15.442 12.5283-27.96 27.9828-27.96H203.283Z"
      />
    </svg>
  );
}

export function LogoText({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Hivio Logo Text"
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1070 478"
    >
      <path
        fill="currentColor"
        d="M158.614 448.823v-167.61c0-8.691-2.478-11.174-11.152-11.174H96.6557c-8.6742 0-11.1526 2.483-11.1526 11.174v167.61c0 18.003-4.9567 22.969-22.9247 22.969H22.9248C4.95671 471.792 0 466.826 0 448.823V29.1766C0 11.174 4.95671 6.20779 22.9248 6.20779h39.6536c17.968 0 22.9247 4.96621 22.9247 22.96881V171.956c0 8.07 2.4784 11.174 11.1526 11.174h50.8063c8.674 0 11.152-3.104 11.152-11.174V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.654c17.968 0 22.925 4.96621 22.925 22.96881V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.654c-17.968 0-22.925-4.966-22.925-22.969Zm211.28-419.6464V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.968 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881ZM571.556 471.792h-68.155c-32.219 0-41.512-9.311-45.23-38.488L410.463 29.1766c-1.859-18.0026 4.957-22.96881 22.925-22.96881h45.229c17.969 0 21.686 4.96621 22.925 22.96881l27.262 318.4594c.62 7.45 3.098 9.312 8.674 9.312 5.577 0 8.055-1.862 8.675-9.312l27.261-318.4594c1.24-18.0026 4.957-22.96881 22.925-22.96881h45.23c17.968 0 24.784 4.96621 22.925 22.96881L616.786 433.304c-3.718 29.177-13.012 38.488-45.23 38.488Zm219.01-442.6154V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.969 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.956-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881ZM1070 335.221C1070 440.132 1040.26 478 950.42 478c-89.841 0-119.581-37.868-119.581-142.779V142.779C830.839 38.4883 860.579 0 950.42 0 1040.26 0 1070 38.4883 1070 142.779v192.442Zm-151.179 21.106c0 24.831 9.913 34.764 31.599 34.764 21.685 0 31.598-9.933 31.598-34.764v-231.55c0-27.3147-9.913-37.8679-31.598-37.8679-21.686 0-31.599 10.5532-31.599 37.8679v231.55Z"
      />
    </svg>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Hivio Logo Icon"
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 541 474"
    >
      <path
        fill="currentColor"
        d="M93.2759 27.9607C93.2759 12.5184 105.804 0 121.259 0h295.817c15.455 0 27.983 12.5184 27.983 27.9607 0 15.4422-12.528 27.9606-27.983 27.9606H121.259c-15.455 0-27.9831-12.5184-27.9831-27.9606Zm0 418.0783c0-15.442 12.5281-27.96 27.9831-27.96h295.817c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H121.259c-15.455 0-27.9831-12.518-27.9831-27.961ZM63.9606 69.236c-16.1904 0-29.3153 13.1145-29.3153 29.2921 0 16.1779 13.1249 29.2919 29.3153 29.2919H474.374c16.191 0 29.316-13.114 29.316-29.2919 0-16.1776-13.125-29.2921-29.316-29.2921H63.9606Zm-29.3153 310.23c0-15.442 12.5283-27.96 27.9828-27.96H475.707c15.454 0 27.983 12.518 27.983 27.96 0 15.443-12.529 27.961-27.983 27.961H62.6281c-15.4545 0-27.9828-12.518-27.9828-27.961Zm-6.6625-238.331C12.5283 141.135 0 153.653 0 169.096c0 15.442 12.5283 27.96 27.9828 27.96H199.913c13.824-23.878 39.661-39.944 69.255-39.944 29.593 0 55.43 16.066 69.254 39.944h174.595c15.455 0 27.983-12.518 27.983-27.96 0-15.443-12.528-27.961-27.983-27.961H27.9828Zm165.7832 69.236H27.9828C12.5283 210.371 0 222.889 0 238.331c0 15.443 12.5283 27.961 27.9828 27.961H194.762c-3.579-9.07-5.545-18.951-5.545-29.292 0-9.337 1.603-18.3 4.549-26.629Zm149.807 55.921c3.579-9.07 5.545-18.951 5.545-29.292 0-9.337-1.603-18.3-4.549-26.629h168.448c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H343.573Zm-140.29 15.978c14.418 20.91 38.549 34.618 65.885 34.618 27.335 0 51.466-13.708 65.884-34.618h177.965c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H27.9828C12.5283 338.191 0 325.673 0 310.23c0-15.442 12.5283-27.96 27.9828-27.96H203.283Z"
      />
    </svg>
  );
}

export function TMDBIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="TMDB Logo"
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 190.24 81.52"
    >
      <defs>
        <linearGradient
          id="a"
          x2="190.24"
          y1="40.76"
          y2="40.76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#90cea1" />
          <stop offset=".56" stopColor="#3cbec9" />
          <stop offset="1" stopColor="#00b3e5" />
        </linearGradient>
      </defs>
      <g data-name="Layer 2">
        <path
          fill="url(#a)"
          d="M105.67 36.06h66.9a17.67 17.67 0 0 0 17.67-17.66A17.67 17.67 0 0 0 172.57.73h-66.9A17.67 17.67 0 0 0 88 18.4a17.67 17.67 0 0 0 17.67 17.66Zm-88 45h76.9a17.67 17.67 0 0 0 17.67-17.66 17.67 17.67 0 0 0-17.67-17.67h-76.9A17.67 17.67 0 0 0 0 63.4a17.67 17.67 0 0 0 17.67 17.66Zm-7.26-45.64h7.8V6.92h10.1V0h-28v6.9h10.1Zm28.1 0h7.8V8.25h.1l9 27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2 23.1h-.1L50.31 0h-11.8Zm113.92 20.25a15.07 15.07 0 0 0-4.52-5.52 18.57 18.57 0 0 0-6.68-3.08 33.54 33.54 0 0 0-8.07-1h-11.7v35.4h12.75a24.58 24.58 0 0 0 7.55-1.15 19.34 19.34 0 0 0 6.35-3.32 16.27 16.27 0 0 0 4.37-5.5 16.91 16.91 0 0 0 1.63-7.58 18.5 18.5 0 0 0-1.68-8.25ZM145 68.6a8.8 8.8 0 0 1-2.64 3.4 10.7 10.7 0 0 1-4 1.82 21.57 21.57 0 0 1-5 .55h-4.05v-21h4.6a17 17 0 0 1 4.67.63 11.66 11.66 0 0 1 3.88 1.87A9.14 9.14 0 0 1 145 59a9.87 9.87 0 0 1 1 4.52 11.89 11.89 0 0 1-1 5.08Zm44.63-.13a8 8 0 0 0-1.58-2.62 8.38 8.38 0 0 0-2.42-1.85 10.31 10.31 0 0 0-3.17-1v-.1a9.22 9.22 0 0 0 4.42-2.82 7.43 7.43 0 0 0 1.68-5 8.42 8.42 0 0 0-1.15-4.65 8.09 8.09 0 0 0-3-2.72 12.56 12.56 0 0 0-4.18-1.3 32.84 32.84 0 0 0-4.62-.33h-13.2v35.4h14.5a22.41 22.41 0 0 0 4.72-.5 13.53 13.53 0 0 0 4.28-1.65 9.42 9.42 0 0 0 3.1-3 8.52 8.52 0 0 0 1.2-4.68 9.39 9.39 0 0 0-.55-3.18Zm-19.42-15.75h5.3a10 10 0 0 1 1.85.18 6.18 6.18 0 0 1 1.7.57 3.39 3.39 0 0 1 1.22 1.13 3.22 3.22 0 0 1 .48 1.82 3.63 3.63 0 0 1-.43 1.8 3.4 3.4 0 0 1-1.12 1.2 4.92 4.92 0 0 1-1.58.65 7.51 7.51 0 0 1-1.77.2h-5.65Zm11.72 20a3.9 3.9 0 0 1-1.22 1.3 4.64 4.64 0 0 1-1.68.7 8.18 8.18 0 0 1-1.82.2h-7v-8h5.9a15.35 15.35 0 0 1 2 .15 8.47 8.47 0 0 1 2.05.55 4 4 0 0 1 1.57 1.18 3.11 3.11 0 0 1 .63 2 3.71 3.71 0 0 1-.43 1.92Z"
          data-name="Layer 1"
        />
      </g>
    </svg>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 262"
    >
      <path
        fill="#4285F4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      <path
        fill="#34A853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      <path
        fill="#FBBC05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      />
      <path
        fill="#EB4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
}

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 256 199"
    >
      <path
        fill="#5865F2"
        d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
      />
    </svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 256 250"
    >
      <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
    </svg>
  );
}

export function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1200 1227"
    >
      <path
        fill="currentColor"
        d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
      />
    </svg>
  );
}

export function PersonalWebsiteIcon({ className }: { className?: string }) {
  return (
    <Image
      width={1002}
      height={1002}
      className={cn("h-8 w-auto object-contain", className)}
      src="/personal-website.webp"
      alt="Personal Website"
    />
  );
}

export function VercelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-8 w-auto invert dark:invert-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="#ffffff"
      viewBox="0 0 284 65"
    >
      <path d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm117.14-14.5c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm-39.03 3.5c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9v-46h9zM37.59.25l36.95 64H.64l36.95-64zm92.38 5l-27.71 48-27.71-48h10.39l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10v14.8h-9v-34h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" />
    </svg>
  );
}

export function EdgeDBIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 26"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M74.537 12.807c0 6.072-2.435 7.161-5.157 7.161h-5.786V5.645h5.786c2.722 0 5.157 1.089 5.157 7.162Zm-2.95 0c0-4.24-1.29-4.44-3.152-4.44H66.63v8.88h1.805c1.862 0 3.151-.2 3.151-4.44Zm-30.653 7.161V5.645h9.11v2.721H43.97v2.922h4.583v2.693h-4.583v3.266h6.073v2.721h-9.11ZM55 26h3V0h-3v26Zm25.609-12.39v3.638h2.52c1.576 0 1.977-1.032 1.977-1.805 0-.601-.286-1.833-2.435-1.833H80.61Zm0-5.243v2.721h2.062c1.175 0 1.862-.515 1.862-1.375 0-.859-.687-1.346-1.862-1.346H80.61Zm-3.036-2.722h5.844c3.065 0 3.982 2.149 3.982 3.695 0 1.433-.917 2.464-1.547 2.75C87.685 12.98 88 14.783 88 15.7c0 1.203-.601 4.268-4.583 4.268h-5.844V5.645ZM23.49 12.807c0 6.072-2.435 7.161-5.156 7.161h-5.787V5.645h5.787c2.721 0 5.156 1.089 5.156 7.162Zm8.937 4.556c1.547 0 2.349-.516 2.635-.86v-1.575H32.6v-2.464h4.898v5.7c-.43.66-2.778 1.948-4.927 1.948-3.523 0-6.502-1.374-6.502-7.447s3.007-7.162 5.729-7.162c4.268 0 5.328 2.235 5.672 4.211l-2.521.573c-.143-.917-.946-2.062-2.779-2.062-1.862 0-3.15.2-3.15 4.44s1.346 4.698 3.408 4.698Zm-11.888-4.556c0-4.24-1.289-4.44-3.15-4.44h-1.806v8.88h1.805c1.862 0 3.151-.2 3.151-4.44ZM0 19.968V5.645h9.11v2.721H3.035v2.922H7.62v2.693H3.036v3.266H9.11v2.721H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
