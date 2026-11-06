import * as React from "react";
import { Tailwind, Button, Hr } from "react-email";
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "react-email";

import { APP_NAME } from "../lib/constants";

const CURRENT_YEAR = new Date().getFullYear();
const DESTRUCTIVE_COLOR = "#dc2626";

interface Props {
	username: string;
	url: string;
	email: string;
}

export default function DeleteAccountEmail({
	username = "Usuario",
	url = "#",
	email = "",
}: Props) {
	return (
		<React.Fragment>
			<Html>
				<Head />
				<Preview>Confirma la eliminación de tu cuenta de {APP_NAME}</Preview>
				<Tailwind>
					<Body className="bg-[#fafafa] font-sans m-0 p-0">
						<Container className="max-w-[520px] mx-auto py-12 px-0">
							{/* Card */}
							<Section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mx-4">
								{/* Header */}
								<Heading className="text-[#1a1a1a] text-2xl font-semibold m-0 mb-6">
									Eliminar tu cuenta
								</Heading>

								<Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-4">
									Hola <strong className="text-[#1a1a1a]">{username}</strong>,
								</Text>

								<Text className="text-[#666666] text-[15px] leading-relaxed m-0 mb-8">
									Recibimos una solicitud para eliminar permanentemente tu
									cuenta de {APP_NAME} (
									<strong className="text-[#1a1a1a]">{email}</strong>). Si
									continúas, se borrarán tu historial, favoritos, estadísticas y
									demás datos asociados. Esta acción no se puede deshacer.
								</Text>

								{/* CTA Button */}
								<Section className="text-center my-8">
									<Button
										href={url}
										style={{ backgroundColor: DESTRUCTIVE_COLOR }}
										className="text-white py-3 px-8 rounded-lg no-underline text-[15px] font-medium inline-block"
									>
										Eliminar mi cuenta
									</Button>
								</Section>

								<Hr className="border-gray-200 my-8 mx-0" />

								<Text className="text-[#888888] text-[13px] leading-relaxed m-0">
									Por seguridad, abre este enlace en el mismo navegador donde
									tienes la sesión iniciada. El enlace expira en 1 hora.
								</Text>

								<Text className="text-[#999999] text-[13px] leading-relaxed m-0 mt-3">
									¿No solicitaste esto? Ignora este correo; tu cuenta seguirá
									activa y no se eliminará nada.
								</Text>
							</Section>

							{/* Footer */}
							<Section className="text-center mt-8">
								<Text className="text-[#aaaaaa] text-[12px] m-0">
									Enviado por {APP_NAME}
								</Text>
								<Text className="text-[#cccccc] text-[11px] m-0 mt-1">
									© {CURRENT_YEAR} {APP_NAME}. Todos los derechos reservados.
								</Text>
							</Section>
						</Container>
					</Body>
				</Tailwind>
			</Html>
		</React.Fragment>
	);
}

export { DeleteAccountEmail };
