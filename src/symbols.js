
export const wrappedMqttClient = Symbol('WrappedMqttClient')
export const withDebug = Symbol('withDebug')
export const asPromise = Symbol('asPromise')

export function alreadyWrapped(mqttClient, test) {
  if (!mqttClient[wrappedMqttClient])
    return false

  if (mqttClient[test])
    return true

  return alreadyWrapped(mqttClient[wrappedMqttClient])
}
