import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const GeistSemiBold = await fetch(
    new URL("@/styles/fonts/Geist-SemiBold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const GeistMedium = await fetch(
    new URL("@/styles/fonts/Geist-Medium.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const username = request.nextUrl.searchParams.get("username") ?? "Anonymous";
  const avatar = request.nextUrl.searchParams.get("avatar") ?? "none";
  const name = request.nextUrl.searchParams.get("name") ?? "Anonymous";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          flexWrap: "nowrap",
          backgroundColor: "white",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #FACC15 2%, transparent 0%), radial-gradient(circle at 75px 75px, #FACC15 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            style={{
              height: "100px",
              width: "355.23px",
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 1698 478"
          >
            <path
              fill="#000"
              d="M786.614 448.823v-167.61c0-8.691-2.478-11.174-11.152-11.174h-50.806c-8.675 0-11.153 2.483-11.153 11.174v167.61c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.968 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881V171.956c0 8.07 2.478 11.174 11.153 11.174h50.806c8.674 0 11.152-3.104 11.152-11.174V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.654c17.968 0 22.925 4.96621 22.925 22.96881V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.654c-17.968 0-22.925-4.966-22.925-22.969Zm211.28-419.6464V448.823c0 18.003-4.957 22.969-22.925 22.969h-39.653c-17.968 0-22.925-4.966-22.925-22.969V29.1766c0-18.0026 4.957-22.96881 22.925-22.96881h39.653c17.968 0 22.925 4.96621 22.925 22.96881ZM1199.56 471.792h-68.16c-32.22 0-41.51-9.311-45.23-38.488l-47.71-404.1274c-1.86-18.0026 4.96-22.96881 22.93-22.96881h45.23c17.97 0 21.68 4.96621 22.92 22.96881l27.26 318.4594c.62 7.45 3.1 9.312 8.68 9.312 5.57 0 8.05-1.862 8.67-9.312l27.26-318.4594c1.24-18.0026 4.96-22.96881 22.93-22.96881h45.23c17.97 0 24.78 4.96621 22.92 22.96881l-47.7 404.1274c-3.72 29.177-13.02 38.488-45.23 38.488Zm219.01-442.6154V448.823c0 18.003-4.96 22.969-22.93 22.969h-39.65c-17.97 0-22.93-4.966-22.93-22.969V29.1766c0-18.0026 4.96-22.96881 22.93-22.96881h39.65c17.97 0 22.93 4.96621 22.93 22.96881ZM1698 335.221C1698 440.132 1668.26 478 1578.42 478s-119.58-37.868-119.58-142.779V142.779C1458.84 38.4883 1488.58 0 1578.42 0S1698 38.4883 1698 142.779v192.442Zm-151.18 21.106c0 24.831 9.91 34.764 31.6 34.764s31.6-9.933 31.6-34.764v-231.55c0-27.3147-9.91-37.8679-31.6-37.8679s-31.6 10.5532-31.6 37.8679v231.55ZM93.2759 27.9607C93.2759 12.5184 105.804 0 121.259 0h295.817c15.455 0 27.983 12.5184 27.983 27.9607 0 15.4422-12.528 27.9606-27.983 27.9606H121.259c-15.455 0-27.9831-12.5184-27.9831-27.9606Zm0 418.0783c0-15.442 12.5281-27.96 27.9831-27.96h295.817c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H121.259c-15.455 0-27.9831-12.518-27.9831-27.961ZM63.9606 69.236c-16.1904 0-29.3153 13.1145-29.3153 29.2921 0 16.1779 13.1249 29.2919 29.3153 29.2919H474.374c16.191 0 29.316-13.114 29.316-29.2919 0-16.1776-13.125-29.2921-29.316-29.2921H63.9606Zm-29.3153 310.23c0-15.442 12.5283-27.96 27.9828-27.96H475.707c15.454 0 27.983 12.518 27.983 27.96 0 15.443-12.529 27.961-27.983 27.961H62.6281c-15.4545 0-27.9828-12.518-27.9828-27.961Zm-6.6625-238.331C12.5283 141.135 0 153.653 0 169.096c0 15.442 12.5283 27.96 27.9828 27.96H199.913c13.824-23.878 39.661-39.944 69.255-39.944 29.593 0 55.43 16.066 69.254 39.944h174.595c15.455 0 27.983-12.518 27.983-27.96 0-15.443-12.528-27.961-27.983-27.961H27.9828Zm165.7832 69.236H27.9828C12.5283 210.371 0 222.889 0 238.331c0 15.443 12.5283 27.961 27.9828 27.961H194.762c-3.579-9.07-5.545-18.951-5.545-29.292 0-9.337 1.603-18.3 4.549-26.629Zm149.807 55.921c3.579-9.07 5.545-18.951 5.545-29.292 0-9.337-1.603-18.3-4.549-26.629h168.448c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H343.573Zm-140.29 15.978c14.418 20.91 38.549 34.618 65.885 34.618 27.335 0 51.466-13.708 65.884-34.618h177.965c15.455 0 27.983 12.518 27.983 27.96 0 15.443-12.528 27.961-27.983 27.961H27.9828C12.5283 338.191 0 325.673 0 310.23c0-15.442 12.5283-27.96 27.9828-27.96H203.283Z"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            verticalAlign: "middle",
            gap: "2rem",
            backgroundColor: "#FACC15",
            padding: "1rem",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineClamp: 1,
          }}
        >
          {avatar !== "none" ? (
            <img
              src={avatar}
              alt={name}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "100%",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "100px",
                height: "100px",
                borderRadius: "100%",
                backgroundColor: "darkgray",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "50px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {username.slice(0, 1)}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              verticalAlign: "middle",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 45,
                fontWeight: 900,
                color: "black",
              }}
            >
              @{username}
            </span>
            <span
              style={{
                fontSize: 45,
                fontWeight: 400,
                color: "black",
              }}
            >
              {name}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist SemiBold",
          data: GeistSemiBold,
        },
        {
          name: "Geist Medium",
          data: GeistMedium,
        },
      ],
    },
  );
}
