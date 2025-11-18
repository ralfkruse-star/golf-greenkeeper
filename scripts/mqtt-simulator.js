#!/usr/bin/env node

/**
 * MQTT Sensor Simulator
 *
 * Simulates IoT sensors sending data to MQTT broker for testing
 *
 * Usage:
 *   node scripts/mqtt-simulator.js
 *
 * Requires:
 *   npm install mqtt
 */

const mqtt = require('mqtt')

// Configuration
const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
const USERNAME = process.env.MQTT_USERNAME
const PASSWORD = process.env.MQTT_PASSWORD

// Sensor definitions
const sensors = [
  {
    deviceId: 'SM-GRN-001',
    name: 'Green 1 Soil Moisture',
    zoneId: 'zone-1',
    type: 'SOIL_MOISTURE',
    unit: '%',
    min: 30,
    max: 60,
    interval: 30000, // 30 seconds
  },
  {
    deviceId: 'TMP-FAI-005',
    name: 'Fairway 5 Temperature',
    zoneId: 'zone-5',
    type: 'TEMPERATURE',
    unit: '°C',
    min: 10,
    max: 30,
    interval: 60000, // 1 minute
  },
  {
    deviceId: 'PH-GRN-003',
    name: 'Green 3 pH Level',
    zoneId: 'zone-3',
    type: 'PH_LEVEL',
    unit: 'pH',
    min: 6.0,
    max: 7.5,
    interval: 300000, // 5 minutes
  },
  {
    deviceId: 'HUM-TEE-001',
    name: 'Tee 1 Humidity',
    zoneId: 'zone-tee-1',
    type: 'HUMIDITY',
    unit: '%',
    min: 40,
    max: 80,
    interval: 45000, // 45 seconds
  },
]

// Connect to MQTT broker
console.log(`🔌 Connecting to MQTT broker: ${BROKER_URL}`)

const client = mqtt.connect(BROKER_URL, {
  username: USERNAME,
  password: PASSWORD,
  clientId: `simulator-${Date.now()}`,
})

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker\n')

  // Send initial status for all sensors
  sensors.forEach((sensor) => {
    sendStatus(sensor, 'ACTIVE')
  })

  // Start sending sensor data
  sensors.forEach((sensor) => {
    console.log(`📡 Starting sensor: ${sensor.name} (${sensor.deviceId})`)

    // Send initial reading
    sendSensorData(sensor)

    // Send periodic readings
    setInterval(() => {
      sendSensorData(sensor)
    }, sensor.interval)
  })

  console.log('\n✨ Simulator running. Press Ctrl+C to stop.\n')
})

client.on('error', (error) => {
  console.error('❌ MQTT error:', error)
})

client.on('close', () => {
  console.log('🔌 Disconnected from MQTT broker')
})

/**
 * Generate random sensor reading
 */
function generateReading(sensor) {
  const value = sensor.min + Math.random() * (sensor.max - sensor.min)
  const battery = 80 + Math.random() * 20 // 80-100%
  const signal = 70 + Math.random() * 30 // 70-100%

  return {
    deviceId: sensor.deviceId,
    zoneId: sensor.zoneId,
    type: sensor.type,
    value: Math.round(value * 10) / 10,
    unit: sensor.unit,
    timestamp: new Date().toISOString(),
    battery: Math.round(battery),
    signal: Math.round(signal),
  }
}

/**
 * Send sensor data to MQTT
 */
function sendSensorData(sensor) {
  const reading = generateReading(sensor)
  const topic = `golf/sensors/${sensor.deviceId}/data`

  client.publish(topic, JSON.stringify(reading), { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌ Failed to publish ${sensor.deviceId}:`, err)
    } else {
      console.log(`📤 ${sensor.name}: ${reading.value}${reading.unit} (Battery: ${reading.battery}%)`)

      // Check for alerts
      checkAlerts(sensor, reading)
    }
  })
}

/**
 * Send sensor status
 */
function sendStatus(sensor, status) {
  const topic = `golf/sensors/${sensor.deviceId}/status`
  const message = {
    deviceId: sensor.deviceId,
    status,
    timestamp: new Date().toISOString(),
  }

  client.publish(topic, JSON.stringify(message), { qos: 1 })
}

/**
 * Check if reading should trigger an alert
 */
function checkAlerts(sensor, reading) {
  const alerts = []

  if (sensor.type === 'SOIL_MOISTURE') {
    if (reading.value < 30) {
      alerts.push(`Niedrige Bodenfeuchtigkeit: ${reading.value}%`)
    } else if (reading.value > 70) {
      alerts.push(`Hohe Bodenfeuchtigkeit: ${reading.value}%`)
    }
  }

  if (sensor.type === 'TEMPERATURE') {
    if (reading.value < 5) {
      alerts.push(`Frost-Warnung: ${reading.value}°C`)
    } else if (reading.value > 35) {
      alerts.push(`Hitze-Warnung: ${reading.value}°C`)
    }
  }

  if (sensor.type === 'PH_LEVEL') {
    if (reading.value < 6.0 || reading.value > 7.5) {
      alerts.push(`pH-Wert außerhalb Idealbereich: ${reading.value}`)
    }
  }

  if (reading.battery < 20) {
    alerts.push(`Niedriger Batteriestand: ${reading.battery}%`)
  }

  // Send alerts
  if (alerts.length > 0) {
    const topic = `golf/sensors/${sensor.deviceId}/alert`
    const message = {
      deviceId: sensor.deviceId,
      zoneId: sensor.zoneId,
      alerts,
      timestamp: new Date().toISOString(),
    }

    client.publish(topic, JSON.stringify(message), { qos: 1 })
    console.log(`⚠️  ALERT ${sensor.name}: ${alerts.join(', ')}`)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down simulator...')

  sensors.forEach((sensor) => {
    sendStatus(sensor, 'OFFLINE')
  })

  setTimeout(() => {
    client.end()
    process.exit(0)
  }, 1000)
})
