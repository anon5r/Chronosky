export interface DIDDocument {
	id: string,
	verificationMethod: DIDVerificationMethod[],
	service: DIDService[]
}

export interface DIDVerificationMethod {
	id: string,
	type: string,
	controller: string,
	publicKeyMultibase: string,
}

export interface DIDService {
	id: string,
	type: string,
	serviceEndpoint: string,
}


/**
 * Retrieves the service endpoint for a given DID.
 *
 * @param {string} did - The Decentralized Identifier.
 * @returns {Promise<string>} - The service endpoint corresponding to the provided DID.
 * @throws {Error} - If the DID cannot be resolved or no service endpoint is found.
 */
export async function resolveEndpoint(did: string): Promise<string> {
	const didResolver = await fetch(`https://plc.directory/${did}`)

	if (!didResolver.ok) {
		throw new Error(`Failed to resolve DID: ${did}`)
	}
	const didDocument: DIDDocument = JSON.parse(await didResolver.text()) as DIDDocument

	let serviceEndpoint: string = ''
	for (const service of didDocument.service) {
		if (service.type === 'AtprotoPersonalDataServer') {
			serviceEndpoint = service.serviceEndpoint
			break
		}
	}
	if (serviceEndpoint.length < 1) {
		throw new Error(`No service endpoint found for DID: ${did}`)
	}
	return serviceEndpoint
}
