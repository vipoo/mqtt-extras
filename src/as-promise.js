import {wrappedMqttClient, alreadyWrapped, asPromise} from './symbols'
import {mappedPromiseMethods, mappedMethods} from './contants'

function toPromise(res, rej) {
  return (err, ...args) => {
    if (err)
      return rej(err)

    if (args.length)
      return res()

    if (args.length === 1)
      return res(args[0])

    return res(args)
  }
}

function MqttClientAsPromise(mqttClient) {
  this[asPromise] = true
  this[wrappedMqttClient] = mqttClient

  for (const m of mappedMethods)
    this[m] = (...args) => mqttClient[m](...args)

  for (const m of mappedPromiseMethods)
    this[m] = (...args) => new Promise((res, rej) => mqttClient[m](...args, toPromise(res, rej)))
}

export function mqttClientAsPromise(mqttClient) {
  if (alreadyWrapped(mqttClient, asPromise))
    return mqttClient

  return new MqttClientAsPromise(mqttClient)
}
