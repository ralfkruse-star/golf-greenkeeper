'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface ScanResult {
  type: 'EQUIPMENT' | 'ZONE' | 'MATERIAL' | 'UNKNOWN'
  id: string
  name?: string
  details?: any
}

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [scanning])

  const startScanning = async () => {
    try {
      setError(null)
      setScanResult(null)

      // Get available cameras
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        const selectedCamera = devices[0].id
        setCameraId(selectedCamera)

        // Initialize scanner
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        // Start scanning
        await scanner.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          onScanError
        )

        setScanning(true)
      } else {
        setError('Keine Kamera gefunden')
      }
    } catch (err: any) {
      setError('Kamera-Zugriff fehlgeschlagen: ' + err.message)
      console.error(err)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error('Failed to stop scanner:', err)
      }
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    console.log('QR Code detected:', decodedText)

    // Stop scanning temporarily
    await stopScanning()

    // Parse QR code
    try {
      const data = JSON.parse(decodedText)

      // Fetch details based on type
      const token = localStorage.getItem('access_token')
      let details = null

      if (data.type === 'EQUIPMENT' && data.id) {
        const response = await fetch(`/api/equipment/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (result.success) {
          details = result.data
        }
      } else if (data.type === 'ZONE' && data.id) {
        const response = await fetch(`/api/zones/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (result.success) {
          details = result.data
        }
      } else if (data.type === 'MATERIAL' && data.id) {
        const response = await fetch(`/api/materials/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (result.success) {
          details = result.data
        }
      }

      setScanResult({
        type: data.type || 'UNKNOWN',
        id: data.id || decodedText,
        name: data.name || details?.name,
        details,
      })
    } catch (err) {
      // Not a valid JSON, treat as raw text
      setScanResult({
        type: 'UNKNOWN',
        id: decodedText,
      })
    }
  }

  const onScanError = (errorMessage: string) => {
    // Ignore continuous scan errors (camera is working)
    // Only log actual errors
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('QR Scan error:', errorMessage)
    }
  }

  const handleNewScan = () => {
    setScanResult(null)
    startScanning()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          QR-Code Scanner
        </h1>
        <p className="text-gray-600 mt-1">
          Scannen Sie QR-Codes von Equipment, Zonen oder Materialien
        </p>
      </div>

      {/* Scanner Card */}
      <div className="bg-white rounded-lg shadow p-6">
        {!scanning && !scanResult && (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bereit zum Scannen
            </h2>
            <p className="text-gray-600 mb-6">
              Klicken Sie auf "Scannen starten", um einen QR-Code zu scannen
            </p>
            <button
              onClick={startScanning}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Scannen starten
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {scanning && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Kamera aktiv
              </h2>
              <button
                onClick={stopScanning}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Stoppen
              </button>
            </div>
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden border-4 border-green-500"
            ></div>
            <p className="text-center text-gray-600 mt-4">
              Richten Sie die Kamera auf einen QR-Code
            </p>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    QR-Code erfolgreich gescannt
                  </h2>
                  <p className="text-gray-600">Typ: {scanResult.type}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ID:
                  </label>
                  <p className="text-gray-900 font-mono">{scanResult.id}</p>
                </div>

                {scanResult.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Name:
                    </label>
                    <p className="text-gray-900">{scanResult.name}</p>
                  </div>
                )}

                {scanResult.details && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Details:
                    </label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      {scanResult.type === 'EQUIPMENT' && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Typ:</span>{' '}
                            {scanResult.details.type}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            {scanResult.details.status}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Betriebsstunden:</span>{' '}
                            {scanResult.details.operatingHours}h
                          </p>
                        </div>
                      )}
                      {scanResult.type === 'MATERIAL' && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Bestand:</span>{' '}
                            {scanResult.details.currentStock}{' '}
                            {scanResult.details.unit}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Typ:</span>{' '}
                            {scanResult.details.type}
                          </p>
                        </div>
                      )}
                      {scanResult.type === 'ZONE' && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Typ:</span>{' '}
                            {scanResult.details.type}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Loch:</span> Hole{' '}
                            {scanResult.details.holeNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleNewScan}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Neuer Scan
                </button>
                {scanResult.type !== 'UNKNOWN' && (
                  <button
                    onClick={() => {
                      const path =
                        scanResult.type === 'EQUIPMENT'
                          ? '/dashboard/equipment'
                          : scanResult.type === 'MATERIAL'
                          ? '/dashboard/materials'
                          : '/dashboard/map'
                      window.location.href = path
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Details öffnen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          So funktioniert's
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span>
              Klicken Sie auf "Scannen starten" und erlauben Sie den
              Kamera-Zugriff
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span>
              Richten Sie die Kamera auf einen QR-Code von Equipment, Zonen oder
              Materialien
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span>
              Nach erfolgreichem Scan werden automatisch Details geladen
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
