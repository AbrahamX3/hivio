import { Tailwind, Button, Hr } from "react-email";
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import * as React from "react";

import { APP_NAME, BRAND_COLOR } from "../lib/constants";

interface Props {
  username: string;
  url: string;
}

export default function VerificationEmail({ username = "Usuario", url = "#" }: Props) {
  return (
    <React.Fragment>
      <Html>
        <Head />
        <Preview>Verifica tu correo electrónico en {APP_NAME}</Preview>
        <Tailwind>
          <Body className="bg-[#fafafa] font-sans m-0 p-0">
            <Container className="max-w-[520px] mx-auto py-12 px-0">
              {/* Card */}
              <Section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mx-4">
                {/* Header */}
                <Heading className="text-[#1a1a1a] text-2xl font-semibold m-0 mb-6">
                  ¡Bienvenido a {APP_NAME}!
                </Heading>

                <Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-4">
                  Hola <strong className="text-[#1a1a1a]">{username}</strong>,
                </Text>

                <Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-8">
                  Tu cuenta ha sido creada en {APP_NAME}. Para activarla y comenzar a usar el
                  sistema, necesitamos verificar que esta dirección de correo electrónico es tuya.
                </Text>

                {/* CTA Button */}
                <Section className="text-center my-8">
                  <Button
                    href={url}
                    style={{ backgroundColor: BRAND_COLOR }}
                    className="text-white py-3 px-8 rounded-lg no-underline text-[15px] font-medium inline-block"
                  >
                    Activar cuenta
                  </Button>
                </Section>

                <Hr className="border-gray-200 my-8 mx-0" />

                <Text className="text-[#888888] text-[13px] leading-relaxed m-0">
                  <span className="inline-block align-middle mr-[6px]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  Este enlace expira en <strong className="text-[#666666]">1 hora</strong> por
                  seguridad.
                </Text>

                <Text className="text-[#999999] text-[13px] leading-relaxed m-0 mt-3">
                  ¿No esperabas recibir este correo? Contacta al administrador de tu organización.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="text-center mt-8">
                <Text className="text-[#aaaaaa] text-[12px] m-0">Enviado por {APP_NAME}</Text>
                <Text className="text-[#cccccc] text-[11px] m-0 mt-1">
                  © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    </React.Fragment>
  );
}

export { VerificationEmail };
