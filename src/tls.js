import mqtt from 'mqtt'
import tls from 'tls'

function tlsConnection(options) {
  const mqttClientOptions = {
    port: 8883,
    enableTrace: false,
    requestCert: true,
    rejectUnauthorized: true,
    ca: options.ca,
    key: options.key,
    cert: options.cert,
    ...options
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

export async function createTlsMqttClient(options) {
  const tlsConnector = await tlsConnection(options)
  return new mqtt.MqttClient(tlsConnector, options)
}
