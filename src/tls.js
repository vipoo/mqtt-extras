import mqtt from 'mqtt'
import tls from 'tls'
import fs from 'fs'

function tlsConnection(options) {

  const ca = options.ca || fs.readFileSync(options.caPath)
  const key = options.key || fs.readFileSync(options.keyPath)
  const cert = options.cert || fs.readFileSync(options.certPath)

  const mqttClientOptions = {
    port: 8883,
    enableTrace: false,
    requestCert: true,
    rejectUnauthorized: true,
    ...options,
    ca,
    key,
    cert
  }

  return mqttClient => {
    const tlsConnection = tls.connect(mqttClientOptions)

    function handleTLSerrors(err) {
      mqttClient.emit('error', err)
      tlsConnection.end()
    }

    tlsConnection.on('secureConnect', () => {
      if (!tlsConnection.authorized)
        tlsConnection.emit('error', new Error('TLS not authorized'))
      else
        tlsConnection.removeListener('error', handleTLSerrors)
    })

    tlsConnection.on('error', handleTLSerrors)
    return tlsConnection
  }
}

export function createTlsMqttClient(options) {
  const tlsConnector = tlsConnection(options)
  return new mqtt.MqttClient(tlsConnector, options)
}
