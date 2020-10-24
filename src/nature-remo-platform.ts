import {
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from "homebridge";
import { getAccessory } from "./switch-accessory";
import { DeviceModel, ApplianceModel } from "./types";
import got, { Got } from "got";

const PLATFORM_NAME = "NatureRemoPlatform";

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, NatureRemoPlatform);
};

class NatureRemoPlatform implements StaticPlatformPlugin {
  private readonly log: Logging;
  private readonly natureRemoClient: Got;
  private readonly homebridgeClient: HAP;

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.homebridgeClient = api.hap;
    this.natureRemoClient = got.extend({
      prefixUrl: "https://api.nature.global/1/",
      responseType: "json",
      headers: {
        authorization: `Bearer ${config.accessToken}`,
      },
    });
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    (async () => {
      const accessories: AccessoryPlugin[] = [];
      const devices = (await this.natureRemoClient
        .get("devices")
        .json()) as DeviceModel[];
      devices.map((device) => {
        accessories.push(
          getAccessory(
            "",
            this.homebridgeClient,
            this.log,
            this.natureRemoClient,
            device.id
          )
        );
      });
      const appliances = (await this.natureRemoClient
        .get("appliances")
        .json()) as ApplianceModel[];
      appliances.map((appliance) => {
        accessories.push(
          getAccessory(
            appliance.type,
            this.homebridgeClient,
            this.log,
            this.natureRemoClient,
            appliance.id
          )
        );
      });
      callback(accessories);
    })();
  }
}
