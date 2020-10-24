import {
  AccessoryPlugin,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from "homebridge";
import { Got } from "got";
import {
  AccessoryType,
  ApplianceModel,
  DeviceModel,
  OperationModes,
} from "./types";

interface NatureRemoAccessory extends AccessoryPlugin {
  readonly log: Logging;
  readonly client: Got;
  readonly id: string;

  getName(callback: CharacteristicGetCallback): void;
}

interface NatureRemoApplianceConstructorArgs {
  hap: HAP;
  log: Logging;
  client: Got;
  deviceId: string;
  id: string;
  name: string;
}

class BaseNatureRemoAppliance implements NatureRemoAccessory {
  name: string;
  readonly log: Logging;
  readonly client: Got;
  readonly id: string;
  readonly deviceId: string;
  readonly services: Service[] = [];

  constructor({
    hap,
    log,
    client,
    deviceId,
    id,
    name,
  }: NatureRemoApplianceConstructorArgs) {
    this.log = log;
    this.client = client;
    this.deviceId = deviceId;
    this.id = id;

    this.name = name;
  }

  getName(callback: CharacteristicGetCallback) {
    this.getAppliance()
      .then((appliance) => callback(null, appliance.nickname))
      .catch((reason) => callback(new Error(reason)));
  }

  getManufacturer(callback: CharacteristicGetCallback) {
    this.getAppliance()
      .then((appliance) => callback(null, appliance.nickname))
      .catch((reason) => callback(new Error(reason)));
  }

  getModel(callback: CharacteristicGetCallback) {
    this.getAppliance()
      .then((appliance) => callback(null, appliance.nickname))
      .catch((reason) => callback(new Error(reason)));
  }

  // All services must be initialized in the constructor
  getServices(): Service[] {
    return this.services;
  }

  patchServices(hap: HAP): void {
    const informationService = new hap.Service.AccessoryInformation();
    informationService
      .getCharacteristic(hap.Characteristic.Manufacturer)
      .on("get", this.getManufacturer.bind(this));
    informationService
      .getCharacteristic(hap.Characteristic.Model)
      .on("get", this.getModel.bind(this));
    this.services.push(informationService);
  }

  getAppliance(): Promise<ApplianceModel> {
    const appliances = this.client.get("appliances").json() as Promise<
      ApplianceModel[]
    >;
    return appliances.then(
      (appliances) =>
        appliances.filter((appliance) => appliance.id === this.id)[0]
    );
  }

  getDevice(): Promise<DeviceModel> {
    return (this.client.get("devices").json() as Promise<DeviceModel[]>).then(
      (devices) => devices.filter((device) => device.id === this.deviceId)[0]
    );
  }
}

export const getAccessory = (
  type: AccessoryType | "",
  hap: HAP,
  log: Logging,
  client: Got,
  deviceId: string,
  name: string,
  id?: string
): NatureRemoAccessory => {
  switch (type) {
    case "AC":
      return new AirConAccessory(<NatureRemoApplianceConstructorArgs>{
        hap,
        log,
        client,
        deviceId,
        name,
        id,
      });
    // case "LIGHT":
    //     return new LightAccessory(hap, log, client, id);
    // case "TV":
    //     return new TVAccessory(hap, log, client, id);
    // case "IR":
    //     return new IRAccessory(hap, log, client, id);
    default:
      return new SensorAccessory(hap, log, client, deviceId, name);
  }
};

export class SensorAccessory implements NatureRemoAccessory {
  name: string;
  readonly client: Got;
  readonly log: Logging;
  readonly id: string;

  private services: Service[] = [];

  constructor(hap: HAP, log: Logging, client: Got, id: string, name: string) {
    this.log = log;
    this.client = client;
    this.id = id;

    this.name = name;

    const temperatureService = new hap.Service.TemperatureSensor(name);
    temperatureService
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on("get", this.getCurrentTemperature.bind(this));
    this.services.push(temperatureService);

    const humidityService = new hap.Service.HumiditySensor(name);
    humidityService
      .getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
      .on("get", this.getCurrentHumidity.bind(this));
    this.services.push(humidityService);
    // this.motionService = new hap.Service.MotionSensor(name)
    // this.illuminationService = new hap.Service.LightSensor(name)

    const informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Nature")
      .setCharacteristic(hap.Characteristic.Model, "Remo");
    informationService
      .getCharacteristic(hap.Characteristic.SerialNumber)
      .on("get", this.getSerialNumber.bind(this));
    informationService
      .getCharacteristic(hap.Characteristic.FirmwareRevision)
      .on("get", this.getFirmwareVersion.bind(this));
    this.services.push(informationService);

    this.services.forEach((service) => {
      service
        .getCharacteristic(hap.Characteristic.Name)
        .on("get", this.getName.bind(this));
    });
  }

  getCurrentTemperature(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => device.newest_events.te)
      .then((temperatureSensor) => callback(null, temperatureSensor.val))
      .catch((reason) => callback(new Error(reason)));
  }

  getCurrentHumidity(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => device.newest_events.hu)
      .then((temperatureSensor) => callback(null, temperatureSensor.val))
      .catch((reason) => callback(new Error(reason)));
  }

  getSerialNumber(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => callback(null, device.serial_number))
      .catch((reason) => callback(new Error(reason)));
  }

  getFirmwareVersion(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => callback(null, device.firmware_version))
      .catch((reason) => callback(new Error(reason)));
  }

  getName(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => callback(null, device.name))
      .catch((reason) => callback(new Error(reason)));
  }

  // private getCurrentMotion() {
  // }
  //
  // private getCurrentIllumination() {
  // }

  getDevice(): Promise<DeviceModel> {
    const devices = this.client.get("devices").json() as Promise<DeviceModel[]>;
    return devices.then(
      (devices) => devices.filter((device) => (device.id = this.id))[0]
    );
  }

  // All services must be initialized in the constructor
  getServices(): Service[] {
    return this.services;
  }
}

export class AirConAccessory extends BaseNatureRemoAppliance {
  targetHeatingCoolingState: OperationModes = "";
  currentHeatingCoolingState: OperationModes = "";

  supportedRanges: {
    warm: number[];
    cool: number[];
    auto: number[];
    [key: string]: number[];
  };

  constructor({
    hap,
    log,
    client,
    deviceId,
    id,
    name,
  }: NatureRemoApplianceConstructorArgs) {
    super({
      hap,
      log,
      client,
      deviceId,
      id,
      name,
    });

    this.supportedRanges = {
      warm: [],
      cool: [],
      auto: [],
    };

    this.getAppliance().then((appliance) => {
      const ranges = appliance.aircon!.range!.modes;
      this.supportedRanges.warm = ranges.warm.temp.map((temp) =>
        parseInt(temp)
      );
      this.supportedRanges.cool = ranges.cool.temp.map((temp) =>
        parseInt(temp)
      );
      this.supportedRanges.auto = ranges.auto.temp.map((temp) =>
        parseInt(temp)
      );
    });

    // create a new Thermostat service
    const service = new hap.Service.Thermostat();

    // create handlers for required characteristics
    service
      .getCharacteristic(hap.Characteristic.CurrentHeatingCoolingState)
      .on("get", this.getCurrentHeatingCoolingState.bind(this));

    service
      .getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
      .on("get", this.getTargetHeatingCoolingState.bind(this))
      .on("set", this.setTargetHeatingCoolingState.bind(this));

    service
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on("get", this.getCurrentTemperature.bind(this));

    service
      .getCharacteristic(hap.Characteristic.TargetTemperature)
      .on("get", this.getTargetTemperature.bind(this))
      .on("set", this.setTargetTemperature.bind(this));

    service
      .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .on("get", this.getTemperatureDisplayUnits.bind(this))
      .on("set", this.setTemperatureDisplayUnits.bind(this));

    this.patchServices(hap);
  }

  getCurrentHeatingCoolingState(callback: CharacteristicGetCallback) {
    this.getAppliance()
      .then((appliance) => {
        const settings = appliance.settings;
        if (settings!.button === "power-off") {
          return "off";
        } else {
          const mode = settings!.mode;
          this.currentHeatingCoolingState = mode;
          return mode;
        }
      })
      .then((mode) => {
        let currentHeatingCoolingState: number;
        switch (mode) {
          case "off":
            currentHeatingCoolingState = 0;
            break;
          case "warm":
            currentHeatingCoolingState = 1;
            break;
          case "cool":
            currentHeatingCoolingState = 2;
            break;
          case "auto":
            currentHeatingCoolingState = 3;
            break;
          case "":
          case "blow":
          case "dry":
          default:
            currentHeatingCoolingState = NaN;
        }
        if (isNaN(currentHeatingCoolingState)) {
          callback(new Error("Appliance mode unsupported by HomeKit"));
        } else {
          callback(null, currentHeatingCoolingState);
        }
      });
  }

  getTargetHeatingCoolingState(callback: CharacteristicGetCallback) {
    if (this.targetHeatingCoolingState === "") {
      callback(new Error("No current target Heating or Cooling State"));
    } else {
      callback(null, this.targetHeatingCoolingState);
    }
  }

  setTargetHeatingCoolingState(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback
  ) {
    const params: { button: string; mode?: OperationModes } = {
      button: "",
    };
    let mode: OperationModes = "";
    switch (value) {
      case 0:
        params.button = "power-off";
        break;
      case 1:
        mode = "warm";
        break;
      case 2:
        mode = "cool";
        break;
      case 3:
        mode = "auto";
        break;
      default:
        callback(
          new Error("Unsupported target Heating or Cooling State requested")
        );
        return;
    }
    if (mode !== "") {
      params.mode = mode;
      this.targetHeatingCoolingState = mode;
    }
    this.client
      .post(`appliances/${this.id}/aircon_settings`, {
        json: params,
      })
      .then((_) => callback(null, value))
      .catch((e) => callback(new Error(e)));
  }

  getCurrentTemperature(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => callback(null, device.newest_events.te.val))
      .catch((e) => callback(new Error(e)));
  }

  getTargetTemperature(callback: CharacteristicGetCallback) {
    this.getAppliance()
      .then((appliance) => callback(null, appliance.settings!.temp))
      .catch((e) => callback(new Error(e)));
  }

  setTargetTemperature(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback
  ) {
    if (this.targetHeatingCoolingState !== this.currentHeatingCoolingState) {
      Promise.resolve(new Promise((resolve) => setTimeout(resolve, 1000)));
    }
    const newValue = Math.round(<number>value);
    if (
      !this.supportedRanges[this.currentHeatingCoolingState].includes(newValue)
    )
      this.client
        .post(`appliances/${this.id}/aircon_settings`, {
          json: {
            temp: value,
          },
        })
        .then((_) => callback(null, newValue))
        .catch((e) => callback(new Error(e)));
  }

  getTemperatureDisplayUnits(callback: CharacteristicGetCallback) {
    this.getDevice()
      .then((device) => callback(null, device.newest_events.te.val))
      .catch((e) => callback(new Error(e)));
  }

  setTemperatureDisplayUnits(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback
  ) {
    this.client
      .post(`appliances/${this.id}/`, {
        json: {
          tempUnit: 0 ? "c" : "f",
        },
      })
      .then((_) => callback(null, value))
      .catch((e) => callback(new Error(e)));
  }
}
