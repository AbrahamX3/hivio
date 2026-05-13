import { Tailwind, Button, Hr } from "react-email";
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import * as React from "react";

import { APP_NAME, BRAND_COLOR } from "../lib/constants";

interface Props {
  username: string;
  url: string;
}

export default function ResetPasswordEmail({ username = "Usuario", url = "#" }: Props) {
  return (
    <React.Fragment>
      <Html>
        <Head />
        <Preview>Restablece tu contraseña de {APP_NAME}</Preview>
        <Tailwind>
          <Body className="bg-[#fafafa] font-sans m-0 p-0">
            <Container className="max-w-[520px] mx-auto py-12 px-0">
              {/* Card */}
              <Section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mx-4">
                {/* Header */}
                <Heading className="text-[#1a1a1a] text-2xl font-semibold m-0 mb-6">
                  Restablece tu contraseña
                </Heading>

                <Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-4">
                  Hola <strong className="text-[#1a1a1a]">{username}</strong>,
                </Text>

                <Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-8">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en
                  el botón de abajo para crear una nueva contraseña segura.
                </Text>

                {/* CTA Button */}
                <Section className="text-center my-8">
                  <Button
                    href={url}
                    style={{ backgroundColor: BRAND_COLOR }}
                    className="text-white py-3 px-8 rounded-lg no-underline text-[15px] font-medium inline-block"
                  >
                    Restablecer contraseña
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
                  ¿No solicitaste este cambio? Puedes ignorar este correo de forma segura.
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

export { ResetPasswordEmail };
