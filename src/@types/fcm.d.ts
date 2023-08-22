type FcmMessage = {
	message: {
		token: string,
		android: {
			notification: {
				title: string,
				body: string,
				sound: string,
				icon: string,
			}
		},
		apns: {
			payload: {
				aps: {
					alert: {
						title: string,
						subtitle: string,
						body: string,
					},
					sound: string,
					"mutable-content": number
				}
			}
		},
		fcm_options: {
			image: string
		}
	}
}

type FcmServiceAccountJson = {
	type: string,
	project_id: string,
	private_key_id: string,
	private_key: string,
	client_email: string,
	client_id: string,
	auth_uri: string,
	token_uri: string,
	auth_provider_x509_cert_url: string,
	client_x509_cert_url: string,
}