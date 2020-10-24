/* Sample Response

[
  {
    "id": "7e42fb8a-55c3-4f7e-b7bd-fa485bcfe63c",
    "device": {
      "name": "Living Room",
      "id": "3d27defa-06d7-4490-9c54-b2d4338c0d68",
      "created_at": "2019-09-02T10:48:38Z",
      "updated_at": "2020-10-23T15:44:14Z",
      "mac_address": "b4:e6:2d:6d:82:b6",
      "serial_number": "1W219070003526",
      "firmware_version": "Remo/1.0.77-g808448c",
      "temperature_offset": 3,
      "humidity_offset": 10
    },
    "model": {
      "id": "de4834d7-e64b-418d-b749-cad6abe7e3e2",
      "country": "JP",
      "manufacturer": "fujitsu",
      "remote_name": "ar-rbf3j",
      "series": "",
      "name": "Fujitsu AC 013",
      "image": "ico_ac_1"
    },
    "type": "AC",
    "nickname": "Living Room AC",
    "image": "ico_ac_1",
    "settings": {
      "temp": "21",
      "temp_unit": "c",
      "mode": "cool",
      "vol": "auto",
      "dir": "",
      "dirh": "",
      "button": "",
      "updated_at": "2020-10-23T15:44:14Z"
    },
    "aircon": {
      "range": {
        "modes": {
          "auto": {
            "temp": [
              "-2",
              "-1",
              "0",
              "1",
              "2",
              "29"
            ],
            "dir": [
              ""
            ],
            "dirh": [
              ""
            ],
            "vol": [
              "1",
              "2",
              "3",
              "4",
              "auto"
            ]
          },
          "blow": {
            "temp": [
              ""
            ],
            "dir": [
              ""
            ],
            "dirh": [
              ""
            ],
            "vol": [
              "1",
              "2",
              "3",
              "4",
              "auto"
            ]
          },
          "cool": {
            "temp": [
              "18",
              "19",
              "20",
              "21",
              "22",
              "23",
              "24",
              "25",
              "26",
              "27",
              "28",
              "29",
              "30"
            ],
            "dir": [
              ""
            ],
            "dirh": [
              ""
            ],
            "vol": [
              "1",
              "2",
              "3",
              "4",
              "auto"
            ]
          },
          "dry": {
            "temp": [
              "18",
              "19",
              "20",
              "21",
              "22",
              "23",
              "24",
              "25",
              "26",
              "27",
              "28",
              "29",
              "30"
            ],
            "dir": [
              ""
            ],
            "dirh": [
              ""
            ],
            "vol": [
              ""
            ]
          },
          "warm": {
            "temp": [
              "18",
              "19",
              "20",
              "21",
              "22",
              "23",
              "24",
              "25",
              "26",
              "27",
              "28",
              "29",
              "30"
            ],
            "dir": [
              ""
            ],
            "dirh": [
              ""
            ],
            "vol": [
              "1",
              "2",
              "3",
              "4",
              "auto"
            ]
          }
        },
        "fixedButtons": [
          "airdir-swing",
          "airdir-tilt",
          "power-off"
        ]
      },
      "tempUnit": "c"
    },
    "signals": []
  }
]

 */

export interface DeviceModel {
  id: string;
  name: string;
  temperature_offset: number;
  humidity_offset: number;
  created_at: string;
  updated_at: string;
  firmware_version: string;
  mac_address: string;
  serial_number: string;
  newest_events: {
    te: SensorValueModel;
    hu: SensorValueModel;
    mo: SensorValueModel;
    il: SensorValueModel;
  };
}

export interface SensorValueModel {
  val: number;
  created_at: string;
}

export interface ApplianceModel {
  id: string;
  device: {
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    mac_address: string;
    serial_number: string;
    firmware_version: string;
    temperature_offset: number;
    humidity_offset: number;
  };
  model: ApplianceModel;
  nickname: string;
  type: AccessoryType; // Default "AC"
  // Type of the appliance. "AC" (Air conditioner), "TV" and "LIGHT" are 1st class citizen appliance, which is included in our IRDB (InfraRed signals DataBase). The "ApplianceModel" stores meta data about the appliance. We provide AC specific UI. Everything else is "IR". We just learn the signals from the remote and store them, and when users tap the button on the smartphone app, our server sends it through Remo.
  settings?: AirConParamsModel;
  aircon?: AirConModel;
  signals: SignalModel[];
  tv?: TVModel;
  light?: LightModel;
  smart_meter?: SmartMeterModel;
}

type AccessoryType = "AC" | "TV" | "LIGHT" | "IR";

export interface AirConParamsModel {
  // The temperature in string format. The unit is described in Aircon object. The range of Temperatures which the air conditioner accepts depends on the air conditioner model and operation mode.
  temp: string;
  // The range of OperationModes which the air conditioner accepts depends on the air conditioner model. Check the 'AirConRangeMode' information in the response for the range of the particular air conditioner model.
  mode: OperationModes;
  // Empty means automatic. Numbers express the amount of volume. The range of AirVolumes which the air conditioner accepts depends on the air conditioner model and operation mode. Check the 'AirConRangeMode' information in the response for the range of the particular air conditioner model and operation mode.
  vol: "" | "auto" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
  // Empty means automatic.
  dir: "";
  // Specify "power-off" always if you want the air conditioner powered off. Empty means powered on.
  // Check available fixed-buttons in AirConModel.range.fixedButtons
  button: string;
}

export type OperationModes = "" | "cool" | "warm" | "dry" | "blow" | "auto";

export interface AirConModel {
  range: {
    modes: {
      auto: AirConRangeModeModel;
      cool: AirConRangeModeModel;
      warm: AirConRangeModeModel;
      dry: AirConRangeModeModel;
      blow: AirConRangeModeModel;
    };
    fixedButtons: string[];
    tempUnit: "" | "c" | "f";
  };
}

export interface AirConRangeModeModel {
  // The temperature in string format. The unit is described in Aircon object. The range of Temperatures which the air conditioner accepts depends on the air conditioner model and operation mode. Check the 'AirConRangeMode' information in the response for the range of the particular air conditioner model and operation mode.
  temp: string[];

  // Empty means automatic. Numbers express the amount of volume. The range of AirVolumes which the air conditioner accepts depends on the air conditioner model and operation mode. Check the 'AirConRangeMode' information in the response for the range of the particular air conditioner model and operation mode.
  vol: ("" | "auto" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10")[];

  // Air Direction. Empty means automatic.
  dir: string[];
}

export interface SignalModel {
  id: string;
  name: string;
}

export interface TVModel {
  // Terrestrial, BS, or CS
  state: {
    input: "t" | "bs" | "cs";
  };
  buttons: {
    name: string;
    label: string;
  };
}

export interface LightModel {
  state: {
    brightness: string;
    power: "on" | "off";
    last_button: string;
  };
  buttons: {
    name: string;
    label: string;
  };
}

export interface SmartMeterModel {
  echonetlite_properties: {
    // The ECHONET lite properties fetched from the appliance.
    // See "Detailed Requirements for ECHONET Device Objects" for more details.
    // ref. https://echonet.jp/spec_object_rl_en/
    name: string;

    // ECHONET Property
    epc: number;

    val: string;
    updated_at: string;
  };
}
