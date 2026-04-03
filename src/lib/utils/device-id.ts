export async function getClientDeviceId() {
  try {
    const deviceUuidModule = await import("device-uuid");
    const DeviceUUID = deviceUuidModule.default;

    return new DeviceUUID().get();
  } catch (error) {
    console.error("Failed to generate device id with device-uuid:", error);

    return crypto.randomUUID();
  }
}
