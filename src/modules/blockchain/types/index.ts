/**
 * Blockchain Types
 * Carbon credit certificates and blockchain integration
 */

export enum CertificateStatus {
  PENDING = 'PENDING',
  MINTED = 'MINTED',
  VERIFIED = 'VERIFIED',
  RETIRED = 'RETIRED',
  REVOKED = 'REVOKED',
}

export enum CertificateType {
  CARBON_SEQUESTRATION = 'CARBON_SEQUESTRATION',
  EMISSION_REDUCTION = 'EMISSION_REDUCTION',
  SUSTAINABLE_PRACTICE = 'SUSTAINABLE_PRACTICE',
  BIODIVERSITY = 'BIODIVERSITY',
}

export interface CarbonCertificate {
  id: string
  tenantId: string
  type: CertificateType
  status: CertificateStatus

  // Carbon Data
  carbonAmount: number // tonnes CO2e
  period: {
    start: Date
    end: Date
  }

  // Blockchain
  tokenId?: string
  contractAddress?: string
  transactionHash?: string
  blockNumber?: number
  chainId?: number // 1 = Ethereum, 137 = Polygon, etc.

  // Verification
  verifiedBy?: string
  verifiedAt?: Date
  verificationDocument?: string // IPFS hash or URL

  // Metadata
  methodology: string // e.g., "Verra VCS", "Gold Standard"
  projectDescription: string
  location: {
    latitude: number
    longitude: number
    address: string
  }

  // Evidence
  evidence: {
    calculationMethod: string
    dataPoints: Array<{
      type: string
      value: number
      unit: string
      timestamp: Date
    }>
    documents?: string[] // IPFS hashes
    photos?: string[]
  }

  // Trading
  marketValue?: number // USD
  tradable: boolean
  retiredBy?: string
  retiredAt?: Date

  createdAt: Date
  updatedAt: Date
}

export interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  blockNumber: number
  timestamp: Date
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
}

export interface MintCertificateRequest {
  type: CertificateType
  carbonAmount: number
  periodStart: Date
  periodEnd: Date
  methodology: string
  projectDescription: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  evidence: CarbonCertificate['evidence']
}

export interface VerifyCertificateRequest {
  certificateId: string
  verifierAddress: string
  verificationDocument: string
  approved: boolean
  notes?: string
}

export interface RetireCertificateRequest {
  certificateId: string
  retiredBy: string
  reason: string
}

export interface CertificateMarketplace {
  totalCertificates: number
  totalCarbonAmount: number
  averagePrice: number
  listings: CertificateListing[]
}

export interface CertificateListing {
  certificate: CarbonCertificate
  price: number // USD per tonne
  seller: string
  listedAt: Date
}

export interface Web3Config {
  network: 'ethereum' | 'polygon' | 'localhost'
  rpcUrl: string
  contractAddress: string
  chainId: number
}
