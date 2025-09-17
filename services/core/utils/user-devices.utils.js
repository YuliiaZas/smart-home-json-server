function initUserDevicesForDashboard({ tabs, userId, dashboardId, devices, userDevices }) {
  const actualDeviceIdsInTabs = new Set();
  (tabs || []).forEach((tab) =>
    (tab.cards || []).forEach((card) =>
      (card.items || []).forEach((item) => actualDeviceIdsInTabs.add(item.deviceId))
    )
  );

  const userDevicesDb = userDevices.find((u) => u.userId === userId) || { userId, devices: [] };

  const updatedDevices = userDevicesDb.devices
    .map((device) =>
      device.dashboards.includes(dashboardId) && !actualDeviceIdsInTabs.has(device.deviceId)
        ? null // remove device that is no longer in dashboard
        : device
    )
    .filter(Boolean);

  actualDeviceIdsInTabs.forEach((deviceId) => {
    let userDeviceIndex = updatedDevices.findIndex((d) => d.deviceId === deviceId);

    if (userDeviceIndex < 0) {
      // Add new device
      const globalDevice = devices.find((d) => d.id === deviceId);

      if (globalDevice) {
        const userDevice = {
          deviceId,
          dashboards: [dashboardId],
          ...(globalDevice.type === "device" ? { state: globalDevice.state ?? false } : {}),
          ...(globalDevice.type === "sensor" ? { value: globalDevice.value } : {}),
        };

        updatedDevices.push(userDevice);
      }
    } else {
      const currentUserDevice = updatedDevices[userDeviceIndex];

      if (!currentUserDevice.dashboards.includes(dashboardId)) {
        // Add dashboardId to existing device
        const userDevice = {
          ...updatedDevices[userDeviceIndex],
          dashboards: [...updatedDevices[userDeviceIndex].dashboards, dashboardId]
        };

        updatedDevices[userDeviceIndex] = userDevice;
      }
    }
  });

  const updatedUserDevicesDb = userDevices.map((u) =>
    u.userId === userId ? { ...u, devices: updatedDevices } : u
  );

  if (!userDevices.some((u) => u.userId === userId)) {
    updatedUserDevicesDb.push({ userId, devices: updatedDevices });
  }

  return updatedUserDevicesDb;
}

function removeUserDevicesForDashboard(userDevices, userId, dashboardId) {
  return userDevices.map((ud) =>
    ud.userId === userId
      ? {
          ...ud,
          devices: ud.devices
            .map((device) => ({
              ...device,
              dashboards: device.dashboards.filter((dId) => dId !== dashboardId),
            }))
            .filter((device) => device.dashboards.length > 0),
        }
      : ud
  );
}

module.exports = {
  initUserDevicesForDashboard,
  removeUserDevicesForDashboard,
};
