function resolveDashboard({dashboard, userId, devices, userDevices}) {
  const resolved = JSON.parse(JSON.stringify(dashboard));

  resolved.tabs = (resolved.tabs || []).map((tab) => ({
    ...tab,
    cards: (tab.cards || []).map((card) => ({
      ...card,
      items: (card.items || []).map((item) => {
        if (item.type !== "deviceRef") return item;

        const device = devices.find((d) => d.id === item.deviceId);
        if (!device) return { error: "Missing device", deviceId: item.deviceId };

        const userDevice = userDevices.find((ud) => ud.userId === userId).devices.find((d) => d.deviceId === device.id);

        return {
          ...device,
          ...(item.alias || {}),
          ...(device.type === "device" ? { state: userDevice?.state ?? false } : {}),
          ...(device.type === "sensor" ? { value: userDevice?.value } : {}),
        };
      }),
    })),
  }));

  return resolved;
}

function transformTabs(tabs) {
  return tabs.map((tab) => ({
    ...tab,
    cards: (tab.cards || []).map((card) => {

      const deviceRefs = (card.itemIds || []).map((id) => ({
        type: "deviceRef",
        deviceId: id,
      }));

      return {
        ...card,
        items: deviceRefs,
        itemIds: undefined,
      };
    }),
  }));
}

module.exports = { resolveDashboard, transformTabs };
